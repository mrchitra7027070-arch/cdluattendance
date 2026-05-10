import fs from 'fs';

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

const fixes = [
    ['text-slate-900 dark:text-slate-900 dark:text-white', 'text-slate-900 dark:text-white'],
    ['bg-amber-500 text-slate-900 dark:text-white', 'bg-amber-500 text-white'], 
];

replaceInFile('./src/pages/StudentDashboard.tsx', fixes);
replaceInFile('./src/pages/TeacherDashboard.tsx', fixes);
