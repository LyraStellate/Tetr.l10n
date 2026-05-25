const fs = require('fs');
const path = require('path');

console.log('Starting TETR.IO Translation Patcher (Fast ASAR append mode)...');

const localAppData = process.env.LOCALAPPDATA;
const resourcesPath = path.join(localAppData, 'Programs', 'tetrio-desktop', 'resources');

if (!fs.existsSync(resourcesPath)) {
    console.error('Error: TETR.IO resources directory not found.');
    process.exit(1);
}

const patchDir = path.join(resourcesPath, 'translation_patch');
if (!fs.existsSync(patchDir)) {
    fs.mkdirSync(patchDir, { recursive: true });
}

const currentDir = __dirname;
const filesToCopy = ['translate.js', 'translations.csv'];
let missingFiles = false;

for (const file of filesToCopy) {
    const srcFile = path.join(currentDir, file);
    const destFile = path.join(patchDir, file);
    if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`Copied ${file} to translation_patch`);
    } else {
        console.error(`Error: Required file ${file} not found in patch directory.`);
        missingFiles = true;
    }
}

if (missingFiles) {
    process.exit(1);
}

let sourceAsar = path.join(resourcesPath, 'app.asar');
const bakAsar = path.join(resourcesPath, 'app.asar.bak');
const originalFs = require('original-fs');

if (originalFs.existsSync(bakAsar)) {
    console.log('Found app.asar.bak, using it as base.');
    sourceAsar = bakAsar;
} else if (!originalFs.existsSync(sourceAsar)) {
    console.error('Error: Neither app.asar nor app.asar.bak found!');
    process.exit(1);
} else {
    console.log('Backing up app.asar to app.asar.bak...');
    originalFs.copyFileSync(sourceAsar, bakAsar);
    sourceAsar = bakAsar;
}

try {
    const fd = originalFs.openSync(sourceAsar, 'r');
    const buf = Buffer.alloc(16);
    originalFs.readSync(fd, buf, 0, 16, 0);
    
    const paddedHeaderSize = buf.readUInt32LE(8) - 4;
    const headerSize = buf.readUInt32LE(12); // unpadded length
    const headerBuf = Buffer.alloc(headerSize);
    originalFs.readSync(fd, headerBuf, 0, headerSize, 16);
    
    const jsonStr = headerBuf.toString('utf8').replace(/\0/g, '');
    const tree = JSON.parse(jsonStr);
    
    const mainJsNode = tree.files['main.js'];
    if (!mainJsNode) {
        throw new Error('main.js not found in ASAR header');
    }
    
    const mainJsOffset = parseInt(mainJsNode.offset, 10);
    const mainJsSize = mainJsNode.size;
    
    const mainJsBuf = Buffer.alloc(mainJsSize);
    originalFs.readSync(fd, mainJsBuf, 0, mainJsSize, 16 + paddedHeaderSize + mainJsOffset);
    let mainJsContent = mainJsBuf.toString('utf8');
    
    console.log('Applying patch to main.js...');
    
    // Clean up previous patches if any
    const patchRegex = /win\.webContents\.on\('did-navigate'[\s\S]*?\/\/ --- PATCH END ---/g;
    mainJsContent = mainJsContent.replace(patchRegex, '');
    
    const oldPatchRegex = /win\.webContents\.on\('did-navigate'[\s\S]*?translate\.js'[\s\S]*?\}\);/g;
    mainJsContent = mainJsContent.replace(oldPatchRegex, '');

    const injection = `
	win.webContents.on('did-navigate', (event, url) => {
		if (url.startsWith('https://tetr.io')) {
			try {
				const csvContent = require('original-fs').readFileSync(require('path').join(__dirname, '../translation_patch/translations.csv'), 'utf8');
				const translateScript = require('original-fs').readFileSync(require('path').join(__dirname, '../translation_patch/translate.js'), 'utf8');
				const injected = \`(function(){const _TETRIO_CSV=\${JSON.stringify(csvContent)};\\n\${translateScript}\\n})()\`;
				win.webContents.executeJavaScript(injected).catch(() => {});
			} catch (e) {
				console.error('Translation patch error:', e);
			}
		}
	});
	// --- PATCH END ---
	`;

    if (mainJsContent.includes(`win.webContents.on('did-fail-load'`)) {
        mainJsContent = mainJsContent.replace(
            `win.webContents.on('did-fail-load'`,
            injection.trim() + `\n\n\twin.webContents.on('did-fail-load'`
        );
        console.log('Successfully patched main.js content.');
    } else {
        throw new Error('Injection point not found in main.js');
    }
    
    const patchedMainJsBuf = Buffer.from(mainJsContent, 'utf8');
    
    // Calculate old binary data size
    const stat = originalFs.statSync(sourceAsar);
    const binaryDataSize = stat.size - 16 - paddedHeaderSize;
    
    // Update JSON tree
    mainJsNode.offset = String(binaryDataSize);
    mainJsNode.size = patchedMainJsBuf.length;
    delete mainJsNode.integrity; // Remove integrity check for patched file
    
    // Serialize new header
    const newHeader = JSON.stringify(tree);
    const unpaddedLength = Buffer.byteLength(newHeader, 'utf8');
    let padding = 4 - (unpaddedLength % 4);
    if (padding === 4) padding = 0;
    
    const paddedHeaderBuffer = Buffer.concat([Buffer.from(newHeader, 'utf8'), Buffer.alloc(padding, 0)]);
    const paddedLength = paddedHeaderBuffer.length;
    
    const newMagicBuf = Buffer.alloc(16);
    newMagicBuf.writeUInt32LE(4, 0);
    newMagicBuf.writeUInt32LE(paddedLength + 8, 4);
    newMagicBuf.writeUInt32LE(paddedLength + 4, 8);
    newMagicBuf.writeUInt32LE(unpaddedLength, 12);
    
    console.log('Writing patched ASAR...');
    const outAsar = path.join(resourcesPath, 'app.asar');
    const outAsarTemp = path.join(resourcesPath, 'app.asar.tmp');
    const outFd = originalFs.openSync(outAsarTemp, 'w');
    
    originalFs.writeSync(outFd, newMagicBuf);
    originalFs.writeSync(outFd, paddedHeaderBuffer);
    
    // Copy old binary data in chunks
    let bytesToCopy = binaryDataSize;
    let readOffset = 16 + paddedHeaderSize;
    const chunk = Buffer.alloc(1024 * 1024); // 1MB chunk
    
    while (bytesToCopy > 0) {
        const toRead = Math.min(bytesToCopy, chunk.length);
        originalFs.readSync(fd, chunk, 0, toRead, readOffset);
        originalFs.writeSync(outFd, chunk, 0, toRead);
        readOffset += toRead;
        bytesToCopy -= toRead;
    }
    
    // Write new main.js
    originalFs.writeSync(outFd, patchedMainJsBuf);
    
    originalFs.closeSync(outFd);
    originalFs.closeSync(fd);
    
    // Rename tmp to final
    if (originalFs.existsSync(outAsar)) {
        originalFs.unlinkSync(outAsar);
    }
    originalFs.renameSync(outAsarTemp, outAsar);
    
    // Rename existing 'app' directory so it doesn't conflict
    const existingAppDir = path.join(resourcesPath, 'app');
    if (fs.existsSync(existingAppDir)) {
        console.log('Found unpacked "app" directory. Renaming to "app_unpacked_old"...');
        const oldAppDir = path.join(resourcesPath, 'app_unpacked_old');
        if (fs.existsSync(oldAppDir)) {
            fs.rmSync(oldAppDir, { recursive: true, force: true });
        }
        fs.renameSync(existingAppDir, oldAppDir);
    }

    console.log('Patch successfully applied!');

} catch (error) {
    console.error('An error occurred during patching:', error);
    process.exit(1);
}
