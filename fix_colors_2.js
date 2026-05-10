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
    ['from-indigo-900/50 to-blue-900/30', 'from-indigo-100 dark:from-indigo-900/50 to-blue-100 dark:to-blue-900/30'],
    ['text-indigo-200', 'text-indigo-700 dark:text-indigo-200'],
    ['text-blue-300', 'text-blue-700 dark:text-blue-300'],
    ['text-white', 'text-slate-900 dark:text-white'], // Do this generically if missing anywhere? No, dangerous.
];

replaceInFile('./src/pages/StudentDashboard.tsx', fixes);
