const fs = require('fs');
const buf = fs.readFileSync('c:/Users/HP/kush/Personal project/18homes/app/favicon.ico');
console.log('File size:', buf.length, 'bytes');
console.log('First 20 bytes (Hex):', buf.slice(0, 20).toString('hex'));

const reserved = buf.readUInt16LE(0);
const type = buf.readUInt16LE(2);
const numImages = buf.readUInt16LE(4);
console.log(`Reserved: ${reserved}, Type: ${type}, NumImages: ${numImages}`);

if (reserved === 0 && type === 1) {
  console.log('Looks like a valid ICO file!');
  for (let i = 0; i < numImages; i++) {
    const offset = 6 + i * 16;
    if (offset + 16 > buf.length) break;
    const width = buf[offset] || 256;
    const height = buf[offset + 1] || 256;
    const colorCount = buf[offset + 2];
    const bytesInRes = buf.readUInt32LE(offset + 8);
    const imageOffset = buf.readUInt32LE(offset + 12);
    console.log(`Image ${i + 1}: ${width}x${height}, colors: ${colorCount}, bytes: ${bytesInRes}, offset: ${imageOffset}`);
  }
} else {
  console.log('Not a standard ICO file format.');
}
