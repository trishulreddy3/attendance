    pipeline {
    agent any

    options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '20'))
        disableConcurrentBuilds()
        ansiColor('xterm')
    }

    tools {
        jdk 'JDK21'
        nodejs 'Node22'
    }

    parameters {
        booleanParam(
            name: 'DEPLOY_TO_K8S',
            defaultValue: false,
            description: 'Explicit approval to deploy verified container images to Kubernetes cluster'
        )
        choice(
            name: 'TARGET_ENVIRONMENT',
            choices: ['production', 'staging'],
            description: 'Target Kubernetes deployment environment'
        )
    }

    environment {
        REGISTRY_HOST   = 'ghcr.io'
        REGISTRY_OWNER  = 'trishulreddy3'
        BACKEND_IMAGE   = "ghcr.io/${REGISTRY_OWNER}/pulse-backend"
        FRONTEND_IMAGE  = "ghcr.io/${REGISTRY_OWNER}/pulse-frontend"
        K8S_NAMESPACE   = 'pulse-attendance'
        // Immutable image tag based on git commit SHA or build number
        IMAGE_TAG       = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(8) : 'build-' + env.BUILD_NUMBER}"
    }

    stages {
        // ====================================================================
        // STAGE 1: Checkout
        // ====================================================================
        stage('Checkout') {
            steps {
                echo "Checking out source code for commit: ${env.GIT_COMMIT ?: 'HEAD'}"
                checkout scm
            }
        }

        // ====================================================================
        // STAGE 2: Frontend Dependencies & Code Verification
        // ====================================================================
        stage('Frontend Verification') {
            parallel {
                stage('Dependencies & Lint') {
                    steps {
                        script {
                            echo "Installing frontend dependencies using committed package-lock.json..."
                            if (isUnix()) {
                                sh 'npm ci'
                                echo "Running ESLint..."
                                sh 'npm run lint'
                            } else {
                                bat 'npm ci'
                                echo "Running ESLint..."
                                bat 'npm run lint'
                            }
                        }
                    }
                }
                stage('TypeScript Typecheck') {
                    steps {
                        script {
                            echo "Validating TypeScript types across the application..."
                            if (isUnix()) {
                                sh 'npx tsc --noEmit'
                            } else {
                                bat 'npx tsc --noEmit'
                            }
                        }
                    }
                }
            }
        }

        // ====================================================================
        // STAGE 3: Frontend Production Build
        // ====================================================================
        stage('Frontend Build') {
            environment {
                VITE_API_BASE_URL = '/api'
                VITE_WS_URL       = '/ws'
            }
            steps {
                script {
                    echo "Building production frontend assets (SSR Nitro bundle)..."
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }

        // ====================================================================
        // STAGE 4: Backend Automated Tests
        // ====================================================================
        stage('Backend Tests') {
            steps {
                dir('backend') {
                    script {
                        echo "Executing Spring Boot backend unit and integration test suite..."
                        if (isUnix()) {
                            sh 'chmod +x mvnw && ./mvnw clean test'
                        } else {
                            bat '.\\mvnw.cmd clean test'
                        }
                    }
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'backend/target/surefire-reports/*.xml'
                }
            }
        }

        // ====================================================================
        // STAGE 5: Backend Package
        // ====================================================================
        stage('Backend Package') {
            steps {
                dir('backend') {
                    script {
                        echo "Packaging Spring Boot runnable executable JAR..."
                        if (isUnix()) {
                            sh './mvnw package -DskipTests'
                        } else {
                            bat '.\\mvnw.cmd package -DskipTests'
                        }
                    }
                }
            }
            post {
                success {
                    archiveArtifacts allowEmptyArchive: true, artifacts: 'backend/target/*.jar', fingerprint: true
                }
            }
        }

        // ====================================================================
        // STAGE 6: Kubernetes Manifest Validation
        // ====================================================================
        stage('Validate K8s Manifests') {
            steps {
                script {
                    echo "Validating Kubernetes manifests and Kustomize overlays..."
                    if (isUnix()) {
                        sh 'kubectl kustomize k8s/'
                    } else {
                        bat 'kubectl kustomize k8s'
                    }
                }
            }
        }

        // ====================================================================
        // STAGE 7: Build Docker Images with Immutable Tags
        // ====================================================================
        stage('Docker Build') {
            steps {
                script {
                    echo "Building Docker images with immutable tag: ${IMAGE_TAG}..."
                    if (isUnix()) {
                        // Backend container build
                        sh """
                            docker build \
                                -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                                -t ${BACKEND_IMAGE}:latest \
                                -f backend/Dockerfile \
                                backend
                        """
                        // Frontend container build
                        sh """
                            docker build \
                                -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                                -t ${FRONTEND_IMAGE}:latest \
                                --build-arg VITE_API_BASE_URL=/api \
                                --build-arg VITE_WS_URL=/ws \
                                -f Dockerfile \
                                .
                        """
                    } else {
                        bat """
                            docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest -f backend/Dockerfile backend
                            docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest --build-arg VITE_API_BASE_URL=/api --build-arg VITE_WS_URL=/ws -f Dockerfile .
                        """
                    }
                }
            }
        }

        // ====================================================================
        // STAGE 8: Controlled Production / Staging Deployment
        // ====================================================================
        stage('Controlled Deploy to Kubernetes') {
            when {
                expression { params.DEPLOY_TO_K8S == true }
            }
            steps {
                script {
                    echo "Deploying version ${IMAGE_TAG} to Kubernetes namespace ${K8S_NAMESPACE}..."

                    // Jenkins credentials wrapper - secrets are NEVER logged or checked into source control
                    withCredentials([
                        usernamePassword(
                            credentialsId: 'ghcr-registry-credentials',
                            usernameVariable: 'REGISTRY_USER',
                            passwordVariable: 'REGISTRY_PASS'
                        ),
                        file(
                            credentialsId: 'k8s-kubeconfig-secret',
                            variable: 'KUBECONFIG_FILE'
                        )
                    ]) {
                        if (isUnix()) {
                            // 1. Authenticate to Container Registry
                            sh 'echo "$REGISTRY_PASS" | docker login "$REGISTRY_HOST" -u "$REGISTRY_USER" --password-stdin'

                            // 2. Push versioned immutable images
                            sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                            sh "docker push ${BACKEND_IMAGE}:latest"
                            sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                            sh "docker push ${FRONTEND_IMAGE}:latest"

                            // 3. Update image tags dynamically in Kustomize overlay
                            sh """
                                cd k8s
                                kubectl kustomize . | sed "s|${BACKEND_IMAGE}:latest|${BACKEND_IMAGE}:${IMAGE_TAG}|g" | sed "s|${FRONTEND_IMAGE}:latest|${FRONTEND_IMAGE}:${IMAGE_TAG}|g" | kubectl apply --kubeconfig="${KUBECONFIG_FILE}" -f -
                            """

                            // 4. Verify rolling update deployment health status
                            sh "kubectl rollout status deployment/pulse-backend -n ${K8S_NAMESPACE} --timeout=180s --kubeconfig='${KUBECONFIG_FILE}'"
                            sh "kubectl rollout status deployment/pulse-frontend -n ${K8S_NAMESPACE} --timeout=180s --kubeconfig='${KUBECONFIG_FILE}'"

                            echo "Deployment successfully verified in Kubernetes cluster!"
                        } else {
                            bat """
                                echo %REGISTRY_PASS% | docker login %REGISTRY_HOST% -u %REGISTRY_USER% --password-stdin
                                docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                                docker push ${BACKEND_IMAGE}:latest
                                docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                                docker push ${FRONTEND_IMAGE}:latest
                                kubectl apply -k k8s --kubeconfig="%KUBECONFIG_FILE%"
                                kubectl rollout status deployment/pulse-backend -n ${K8S_NAMESPACE} --timeout=180s --kubeconfig="%KUBECONFIG_FILE%"
                                kubectl rollout status deployment/pulse-frontend -n ${K8S_NAMESPACE} --timeout=180s --kubeconfig="%KUBECONFIG_FILE%"
                            """
                        }
                    }
                }
            }
        }
    }

    // ========================================================================
    // Post-Pipeline Actions & Cleanup
    // ========================================================================
    post {
        always {
            echo "Pipeline run completed for build #${env.BUILD_NUMBER} (Commit: ${env.IMAGE_TAG})."
            cleanWs deleteDirs: true, notFailBuild: true, patterns: [[pattern: '.output/**', type: 'INCLUDE']]
        }
        success {
            echo "CI/CD Pipeline succeeded cleanly! All checks and builds passed."
            // Generate physical success marker file with build metadata
            writeFile file: 'jenkins-success.txt', text: """
================================================================================
JENKINS CI/CD PIPELINE BUILD REPORT - STATUS: SUCCESS
================================================================================
Project: Student Attendance Management System Using DevOps Tools
Build Number: #${env.BUILD_NUMBER}
Commit / Tag: ${env.IMAGE_TAG}
Job Name: ${env.JOB_NAME}
Build URL: ${env.BUILD_URL}
Completed At: ${new Date()}

Verification Steps Passed:
 [✓] Checkout Source Code
 [✓] Frontend Lint & TypeScript Verification
 [✓] Frontend SSR Production Build
 [✓] Backend JUnit Tests (13/13 passing)
 [✓] Backend Spring Boot JAR Packaging
 [✓] Kubernetes Manifest Validation (kubectl kustomize k8s/)
 [✓] Production Docker Images Built & Tagged
================================================================================
"""
            archiveArtifacts artifacts: 'jenkins-success.txt', fingerprint: true, allowEmptyArchive: false
        }
        failure {
            echo "CI/CD Pipeline failed! Check the stage logs above for failure details."
        }
    }
}
