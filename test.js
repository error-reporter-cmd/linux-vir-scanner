const path = require('path');
const fs = require('fs');
const util = require('util');

const fsReaddir = util.promisify(fs.readdir);
const fsReadFile = util.promisify(fs.readFile);
const fsLstat = util.promisify(fs.lstat);

async function searchFilesInDirectoryAsync(dir, filter, ext) {  
    const found = await getFilesInDirectoryAsync(dir, ext);

    for (file of found) {
        const fileContent = await fsReadFile(file);

        // We want full words, so we use full word boundary in regex.
        const regex = new RegExp('\\b' + filter + '\\b');
        if (regex.test(fileContent)) {
            console.log(`Your word was found in file: ${file}`);
        }
    };
}

// Using recursion, we find every file with the desired extention, even if its deeply nested in subfolders.
async function getFilesInDirectoryAsync(dir, ext) {
    let files = [];
    const filesFromDirectory = await fsReaddir(dir).catch(err => {
        throw new Error(err.message);
    });

    for (let file of filesFromDirectory) {
        const filePath = path.join(dir, file);
        const stat = await fsLstat(filePath);

        // If we hit a directory, apply our function to that dir. If we hit a file, add it to the array of files.
        if (stat.isDirectory()) {
            const nestedFiles = await getFilesInDirectoryAsync(filePath, ext);
            files = files.concat(nestedFiles);
        } else {
            if (path.extname(file) === ext) {
                files.push(filePath);
            }
        }
    };

    return files;
}

searchFilesInDirectory("./", '\x52\x65\x67\x69\x73\x74\x65\x72\x4e\x65\x74\x45\x76\x65\x6e\x74', ".lua");
