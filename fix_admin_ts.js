const fs = require('fs');
let c = fs.readFileSync('src/lib/admin.ts', 'utf8');
// Remove CourseRow2 placeholder (now in the final combined file)
c = c.replace(/export interface CourseRow2 \{\s*\/\* placeholder \*\/ \}\n/, '');
// Fix for-of on a string variable
c = c.replace(/(for \(\s*const\s+\w+\s+of\s+)(\w+)\s*\)/g, function(m, prefix, varName) {
  return prefix + 'Array.isArray(' + varName + ') ? ' + varName + ' : [], ' + ');';
});
fs.writeFileSync('src/lib/admin.ts', c);
console.log('admin.ts fixed: ' + c.length + ' chars');
