const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

function dependencyTreeLine(fileLine) {
    fileLine = fileLine.replace('\n', '');
    if (fileLine === 'PODS:') {
        console.log('pods head: ' + fileLine);
        return '';
    } else if (fileLine === 'DEPENDENCIES:') {
        console.log('stop reading file');
        outputDotFile().then(dotFileToPdf).catch(console.error);
        return '';
    } else {
        return fileLine;
    }
}

const branketDelete = /\s\(.*\)/;
function removePodVersion(podLine) {
    if (!podLine) {
        return;
    }
    return podLine.replace(branketDelete, '');
}

const slashDelete = /\/.*/;
function removeSubspecLine(line) {
    if (!line) {
        return;
    }
    let cleanSubspecLine = line.replace(slashDelete, '');
    if (line.endsWith(':')) {
        cleanSubspecLine += ':';
    }
    return cleanSubspecLine;
}

let rootNode = '';
const uniqSet = new Set();
function treeToEdge(cleanTreeLine) {
    if (!cleanTreeLine) {
        return;
    }

    if (cleanTreeLine.endsWith(':') && cleanTreeLine.startsWith('  - ')) {
        rootNode = cleanTreeLine.replace('  - ', '').replace(':', '');
        return;
    } else if (cleanTreeLine.startsWith('  - ')) {
        return;
    } else {
        const leafNode = cleanTreeLine.replace('    - ', '');
        if (rootNode !== leafNode) {
            uniqSet.add(`"${rootNode}" -> "${leafNode}";`);
        }
    }
}

async function outputDotFile() {
    return new Promise((resolve, reject) => {
        const writeFileRef = fs.createWriteStream('PodGraph.dot');

        writeFileRef.write('digraph {\n\n');
        writeFileRef.write('ranksep=1.5;\n');
        writeFileRef.write('nodesep=0.1;\n');
        writeFileRef.write('edge [color=gray];\n');
        writeFileRef.write('node [shape=box fontcolor=blue fontname=Menlo fontsize=20];\n');

        for (const dotLine of uniqSet) {
            if (dotLine) {
                writeFileRef.write(dotLine + '\n');
            }
        }

        writeFileRef.write('\n}');
        writeFileRef.end();

        writeFileRef.on('finish', resolve);
        writeFileRef.on('error', reject);
    });
}

async function dotFileToPdf() {
    try {
        await execAsync('/opt/homebrew/bin/dot PodGraph.dot -Tpdf -o PodGraph.pdf');
        await execAsync('rm PodGraph.dot');
        await execAsync('open PodGraph.pdf');
    } catch (error) {
        console.error(`exec error: ${error}`);
    }
}

function main() {
    const podfileLockPath = process.argv[2];
    fs.readFile(podfileLockPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        data.split('\n').forEach((fileLine) => {
            const podLine = dependencyTreeLine(fileLine);
            const cleanVersionLine = removePodVersion(podLine);
            const cleanSubspecLine = removeSubspecLine(cleanVersionLine);
            treeToEdge(cleanSubspecLine);
        });
    });
}

main();
