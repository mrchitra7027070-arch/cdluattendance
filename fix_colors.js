import fs from 'fs';

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    // Revert some button text-white replacements for buttons having blue/emerald/red backgrounds
    content = content.replace(/bg-blue-600([^>]+)text-slate-900 dark:text-white/g, 'bg-blue-600$1text-white');
    content = content.replace(/bg-emerald-500([^>]+)text-slate-900 dark:text-white/g, 'bg-emerald-500$1text-white');
    content = content.replace(/bg-red-500([^>]+)text-slate-900 dark:text-white/g, 'bg-red-500$1text-white');
    content = content.replace(/bg-indigo-600([^>]+)text-slate-900 dark:text-white/g, 'bg-indigo-600$1text-white');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

const commonReplacements = [
    // bg-[#06112a]
    ['bg-[#06112a]', 'bg-slate-50 dark:bg-[#06112a]'],
    ['bg-white/5 ', 'bg-white/80 dark:bg-white/5 '],
    ['bg-white/5]', 'bg-white/80 dark:bg-white/5]'],
    ['bg-white/5\n', 'bg-white/80 dark:bg-white/5\n'],
    ['bg-white/5"', 'bg-white/80 dark:bg-white/5"'],
    
    ['bg-white/10 ', 'bg-white/60 dark:bg-white/10 '],
    ['bg-white/10"', 'bg-white/60 dark:bg-white/10"'],

    ['border-white/10', 'border-black/5 dark:border-white/10'],
    ['border-white/20', 'border-black/10 dark:border-white/20'],
    ['border-white/5', 'border-black/5 dark:border-white/5'],

    ['text-white', 'text-slate-900 dark:text-white'],
    ['text-slate-200', 'text-slate-700 dark:text-slate-200'],
    ['text-slate-300', 'text-slate-600 dark:text-slate-300'],
    ['text-slate-400', 'text-slate-500 dark:text-slate-400'],
    
    ['bg-slate-900/50', 'bg-slate-200/80 dark:bg-slate-900/50'],
    ['bg-slate-900/80', 'bg-slate-200/90 dark:bg-slate-900/80'],
    ['bg-slate-900/95', 'bg-slate-100/95 dark:bg-slate-900/95'],
    ['bg-slate-950/50', 'bg-white/60 dark:bg-slate-950/50'],
    ['bg-slate-800', 'bg-slate-300 dark:bg-slate-800'],
    
    ['shadow-[0_0_15px_rgba(', 'dark:shadow-[0_0_15px_rgba('],
];

replaceInFile('./src/pages/TeacherDashboard.tsx', commonReplacements);
replaceInFile('./src/pages/StudentDashboard.tsx', commonReplacements);
