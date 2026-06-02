const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'src', 'routes');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(routesDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // loginFaculty
  content = content.replace(/const r = loginFaculty\(/g, 'const r = await loginFaculty(');
  // loginStudent
  content = content.replace(/const r = loginStudent\([^,]+, [^,]+, ([^\)]+)\)/g, 'const r = await loginStudent($1, $2)'); 
  // actually student-login.tsx does: loginStudent(studentId, email, password)
  content = content.replace(/loginStudent\(([^,]+), ([^,]+), ([^\)]+)\)/g, 'await loginStudent($1, $3)');

  // createSession
  content = content.replace(/const s = createSession\(/g, 'const s = await createSession(');

  // markAttendance in student.scan.tsx
  // It says: const r = markAttendance(picked, me.id);
  // Needs to be: const r = await markAttendance(picked, me.id, currentLat, currentLng);
  // We'll fix student.scan.tsx manually or replace:
  content = content.replace(/const r = markAttendance\(([^,]+), ([^\)]+)\)/g, 'const r = await markAttendance($1, $2, 0, 0)'); // Mocking lat/lng for now unless we manually fix

  // addStudent
  content = content.replace(/const r = addStudent\(/g, 'const r = await addStudent(');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated', file);
  }
});
