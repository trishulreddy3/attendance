import os
import re

BACKEND_DIR = r"E:\attendence\backend"

def walk_files(directory, ext=".java"):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(ext):
                yield os.path.join(root, file)

# 1. pom.xml
pom_path = os.path.join(BACKEND_DIR, "pom.xml")
with open(pom_path, 'r', encoding='utf-8') as f:
    pom = f.read()

pom = re.sub(r'<dependency>\s*<groupId>org.springframework.boot</groupId>\s*<artifactId>spring-boot-starter-data-jpa</artifactId>\s*</dependency>', 
             '<dependency>\n            <groupId>org.springframework.boot</groupId>\n            <artifactId>spring-boot-starter-data-mongodb</artifactId>\n        </dependency>', pom)
pom = re.sub(r'<dependency>\s*<groupId>org.postgresql</groupId>\s*<artifactId>postgresql</artifactId>.*?</dependency>', '', pom, flags=re.DOTALL)
pom = re.sub(r'<dependency>\s*<groupId>org.flywaydb</groupId>\s*<artifactId>flyway-core</artifactId>.*?</dependency>', '', pom, flags=re.DOTALL)
pom = re.sub(r'<dependency>\s*<groupId>org.flywaydb</groupId>\s*<artifactId>flyway-database-postgresql</artifactId>.*?</dependency>', '', pom, flags=re.DOTALL)

with open(pom_path, 'w', encoding='utf-8') as f:
    f.write(pom)

# 2. application.yml & .env
app_yml = """spring:
  data:
    mongodb:
      uri: ${MONGODB_URI:mongodb://localhost:27017/attendance}
  jwt:
    secret: ${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
    expiration: 86400000
attendance:
  default-radius: 30
"""
with open(os.path.join(BACKEND_DIR, "src", "main", "resources", "application.yml"), 'w') as f: f.write(app_yml)
with open(os.path.join(BACKEND_DIR, "src", "main", "resources", "application-local.yml"), 'w') as f: f.write(app_yml)
with open(os.path.join(BACKEND_DIR, "src", "main", "resources", "application-dev.yml"), 'w') as f: f.write(app_yml)
with open(os.path.join(BACKEND_DIR, "src", "main", "resources", "application-prod.yml"), 'w') as f: f.write(app_yml)
with open(os.path.join(BACKEND_DIR, ".env.example"), 'w') as f: 
    f.write("MONGODB_URI=mongodb+srv://<db_username>:<db_password>@cluster0.wq9s6hi.mongodb.net/attendance\nJWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970\n")

# Delete flyway migration
flyway_dir = os.path.join(BACKEND_DIR, "src", "main", "resources", "db")
if os.path.exists(flyway_dir):
    import shutil
    shutil.rmtree(flyway_dir)

# 3. Refactor Java files
for filepath in walk_files(os.path.join(BACKEND_DIR, "src", "main", "java")):
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()

    orig_code = code

    # Global UUID -> String
    code = code.replace("UUID", "String")
    code = code.replace("java.util.String", "java.lang.String") # Fix incorrect UUID to String import
    
    # Remove JPA imports
    code = re.sub(r'import jakarta\.persistence\.[^;]+;', '', code)
    code = re.sub(r'import org\.hibernate\.[^;]+;', '', code)
    
    # Specific Entity Annotations
    if "com\\pulse\\attendance\\entity" in filepath or "com/pulse/attendance/entity" in filepath:
        code = code.replace("@Entity", "@org.springframework.data.mongodb.core.mapping.Document")
        code = re.sub(r'@Table\(name = "([^"]+)"\)', r'@org.springframework.data.mongodb.core.mapping.Document(collection = "\1")', code)
        code = code.replace("@Id", "@org.springframework.data.annotation.Id")
        code = code.replace("@GeneratedValue(strategy = GenerationType.UUID)", "")
        code = re.sub(r'@Column\([^)]+\)', '', code)
        code = code.replace("@ManyToOne(fetch = FetchType.LAZY)", "@org.springframework.data.mongodb.core.mapping.DocumentReference(lazy = true)")
        code = code.replace("@JoinColumn(name = \"[^\"]+\")", "")
        code = re.sub(r'import java\.util\.String;', '', code) # Clean up UUID import replacement
    
    # Specific Repository Annotations
    if "com\\pulse\\attendance\\repository" in filepath or "com/pulse/attendance/repository" in filepath:
        code = code.replace("JpaRepository", "MongoRepository")
        code = code.replace("org.springframework.data.jpa.repository.JpaRepository", "org.springframework.data.mongodb.repository.MongoRepository")
        
        # Remove JPQL Queries
        code = re.sub(r'@Query\([^)]+\)\s+', '', code)
    
    if code != orig_code:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(code)

print("Basic refactoring complete.")
