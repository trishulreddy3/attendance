# Set Java 21 for Maven
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.10.7-hotspot"

# Load .env variables
Get-Content .env | ForEach-Object {
    if ($_ -match '^(.*?)=(.*)$') {
        Set-Item -Path "env:\$($matches[1])" -Value $matches[2]
    }
}

Write-Host "Starting Pulse Backend (MongoDB) on port 8080..." -ForegroundColor Green
./mvnw spring-boot:run
