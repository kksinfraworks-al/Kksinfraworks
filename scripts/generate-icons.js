import fs from 'node:fs';
import zlib from 'node:zlib';

function createPNG(width, height, r, g, b) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(2, 9); // color type 2 (truecolor RGB)
  ihdrData.writeUInt8(0, 10); // compression method 0
  ihdrData.writeUInt8(0, 11); // filter method 0
  ihdrData.writeUInt8(0, 12); // interlace method 0
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const scanlineLength = 1 + width * 3;
  const rawData = Buffer.alloc(height * scanlineLength);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // Border or center gradient pattern
      const isBorder = x < 8 || x >= width - 8 || y < 8 || y >= height - 8;
      const isCenter = Math.hypot(x - width / 2, y - height / 2) < (width * 0.35);
      
      if (isBorder) {
        rawData[pixelOffset] = 217;     // Amber-600
        rawData[pixelOffset + 1] = 119;
        rawData[pixelOffset + 2] = 6;
      } else if (isCenter) {
        rawData[pixelOffset] = 245;     // Amber-500
        rawData[pixelOffset + 1] = 158;
        rawData[pixelOffset + 2] = 11;
      } else {
        rawData[pixelOffset] = 30;      // Slate-800
        rawData[pixelOffset + 1] = 41;
        rawData[pixelOffset + 2] = 59;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuffer, data]);

  const crc = Buffer.alloc(4);
  crc.writeInt32BE(calculateCRC(typeAndData), 0);

  return Buffer.concat([length, typeAndData, crc]);
}

function calculateCRC(buffer) {
  let c = 0xffffffff;
  for (let n = 0; n < buffer.length; n++) {
    c = crcTable[(c ^ buffer[n]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) | 0;
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 217, 119, 6));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 217, 119, 6));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, 217, 119, 6));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 217, 119, 6));
console.log('Generated PWA icon PNGs successfully.');
