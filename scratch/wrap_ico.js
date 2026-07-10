const fs = require('fs');

const pngBuffer = fs.readFileSync('c:/Users/HP/kush/Personal project/18homes/app/favicon_new.ico');
const header = Buffer.alloc(22);

// ICO Header
header.writeUInt16LE(0, 0); // Reserved
header.writeUInt16LE(1, 2); // Type (1 for Icon)
header.writeUInt16LE(1, 4); // Number of images (1)

// Directory Entry
header.writeUInt8(48, 6);   // Width
header.writeUInt8(48, 7);   // Height
header.writeUInt8(0, 8);    // Color count
header.writeUInt8(0, 9);    // Reserved
header.writeUInt16LE(1, 10); // Color planes
header.writeUInt16LE(32, 12); // Bits per pixel
header.writeUInt32LE(pngBuffer.length, 14); // Image data size
header.writeUInt32LE(22, 18); // Offset to image data

const icoBuffer = Buffer.concat([header, pngBuffer]);
fs.writeFileSync('c:/Users/HP/kush/Personal project/18homes/app/favicon.ico', icoBuffer);
console.log('Successfully wrote standard 48x48 ICO file to app/favicon.ico');
