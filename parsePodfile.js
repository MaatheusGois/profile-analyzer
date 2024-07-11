var rootNode = '';
var uniqSet = new Set();
var jsonData = [];

function dependencyTreeLine(fileLine) {
    fileLine = fileLine.replace('\n', '');
    if (fileLine === 'PODS:') {
        return '';
    } else if (fileLine === 'DEPENDENCIES:') {
        outputDotFile();
    } else {
        return fileLine;
    }
}

const branketDelete = / \(.*\)/;
function removePodVersion(podLine) {
    if (!podLine) {
        return;
    }
    const cleanVersionLine = podLine.replace(branketDelete, '');
    return cleanVersionLine;
}

const slashDelete = /\/.*/;
function removeSubspecLine(line) {
    if (!line) {
        return;
    }
    var cleanSubspecLine = line.replace(slashDelete, '');
    if (line.endsWith(':')) {
        cleanSubspecLine += ':';
    }
    return cleanSubspecLine;
}

function treeToEdge(cleanTreeLine) {
    if (!cleanTreeLine) {
        return;
    }

    if (cleanTreeLine.endsWith(':') && cleanTreeLine.startsWith('  - ')) {
        rootNode = cleanTreeLine.replace('  - ', '');
        rootNode = rootNode.replace(':', '');
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

function outputDotFile() {
    // Write the lines saved in uniqSet to the file

    for (const dotLine of uniqSet) {
        if (!dotLine) {
            continue;
        }
        const slips = dotLine.replace(/[;:"]/g, '').split(' -> ');
        const name = slips[0]
        const imp = slips[1]
        addImport(name, imp);
    }
}

function addImport(name, import_data) {
    if (name == "") { return }
    var isExist = false;

    for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i].name == name) {
            jsonData[i].imports.push(import_data);
            isExist = true;
            break;
        }
    }

    if (!isExist) {
        jsonData.push({ name: name, imports: [import_data] });
    }

    // Save the data to the file

    var isExist = false;

    for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i].name == import_data) {
            isExist = true;
            break;
        }
    }

    if (!isExist) {
        jsonData.push({ name: import_data, imports: [] });
    }
}

function parsePodfile(text) {
    rootNode = '';
    uniqSet = new Set();
    jsonData = [];
    for (const line of text.split('\n')) {
        const podLine = dependencyTreeLine(line);
        const cleanVersionLine = removePodVersion(podLine);
        const cleanSubspecLine = removeSubspecLine(cleanVersionLine);
        treeToEdge(cleanSubspecLine);
    }

    return jsonData;
}
