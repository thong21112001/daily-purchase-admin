import fs from "fs";
import path from "path";

// Tạo ICO 32x32 uncompressed BGRA BMP
function createIco32() {
  const width = 32;
  const height = 32;
  
  // Tạo mảng pixel 32x32 RGBA
  const pixels = new Uint8Array(width * height * 4); // 4096 bytes
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      const dx = Math.abs(x - 15.5);
      const dy = Math.abs(y - 15.5);
      const cornerRadius = 7;
      
      let insideBadge = true;
      if (dx > (15.5 - cornerRadius) && dy > (15.5 - cornerRadius)) {
        const cdx = dx - (15.5 - cornerRadius);
        const cdy = dy - (15.5 - cornerRadius);
        if (cdx * cdx + cdy * cdy > cornerRadius * cornerRadius) {
          insideBadge = false;
        }
      }
      
      if (!insideBadge) {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
        continue;
      }
      
      // Viền xanh ngọc Emerald
      const isBorder = (x <= 1 || x >= 30 || y <= 1 || y >= 30);
      if (isBorder) {
        pixels[idx] = 0x81;     // B
        pixels[idx + 1] = 0xb9; // G
        pixels[idx + 2] = 0x10; // R
        pixels[idx + 3] = 0xff; // A
        continue;
      }
      
      // Thân túi mua hàng
      const isBagHandle = (y >= 6 && y <= 11) && ((x >= 11 && x <= 13) || (x >= 18 && x <= 20) || (y <= 7 && x >= 11 && x <= 20));
      const isBagBody = (x >= 7 && x <= 24 && y >= 11 && y <= 27);
      
      // Dấu checkmark ngọc lục bảo
      const isCheckmark = 
        (x === 11 && (y === 18 || y === 19)) ||
        (x === 12 && (y === 19 || y === 20)) ||
        (x === 13 && (y === 20 || y === 21)) ||
        (x === 14 && (y === 21 || y === 22)) ||
        (x === 15 && (y === 20 || y === 21)) ||
        (x === 16 && (y === 19 || y === 20)) ||
        (x === 17 && (y === 18 || y === 19)) ||
        (x === 18 && (y === 17 || y === 18)) ||
        (x === 19 && (y === 16 || y === 17)) ||
        (x === 20 && (y === 15 || y === 16)) ||
        (x === 21 && (y === 14 || y === 15));
      
      if (isCheckmark) {
        pixels[idx] = 0x81;     // B
        pixels[idx + 1] = 0xb9; // G
        pixels[idx + 2] = 0x10; // R
        pixels[idx + 3] = 0xff;
      } else if (isBagHandle) {
        pixels[idx] = 0x81;
        pixels[idx + 1] = 0xb9;
        pixels[idx + 2] = 0x10;
        pixels[idx + 3] = 0xff;
      } else if (isBagBody) {
        const isBagBorder = (x === 7 || x === 24 || y === 11 || y === 27);
        if (isBagBorder) {
          pixels[idx] = 0xf4;
          pixels[idx + 1] = 0xf4;
          pixels[idx + 2] = 0xf5;
          pixels[idx + 3] = 0xff;
        } else {
          pixels[idx] = 0x3f;
          pixels[idx + 1] = 0x3f;
          pixels[idx + 2] = 0x46;
          pixels[idx + 3] = 0xff;
        }
      } else {
        pixels[idx] = 0x1b;
        pixels[idx + 1] = 0x18;
        pixels[idx + 2] = 0x18;
        pixels[idx + 3] = 0xff;
      }
    }
  }
  
  // Bottom-to-top BMP
  const bmpData = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * width * 4;
    const destRow = y * width * 4;
    for (let x = 0; x < width * 4; x++) {
      bmpData[destRow + x] = pixels[srcRow + x];
    }
  }
  
  const headerSize = 6;
  const dirEntrySize = 16;
  const bmiHeaderSize = 40;
  const pixelDataSize = width * height * 4;
  const maskDataSize = (width * height) / 8;
  const imageSize = bmiHeaderSize + pixelDataSize + maskDataSize;
  const totalFileSize = headerSize + dirEntrySize + imageSize;
  
  const buffer = Buffer.alloc(totalFileSize);
  
  // Header
  buffer.writeUInt16LE(0, 0);
  buffer.writeUInt16LE(1, 2);
  buffer.writeUInt16LE(1, 4);
  
  // Dir entry
  buffer.writeUInt8(width, 6);
  buffer.writeUInt8(height, 7);
  buffer.writeUInt8(0, 8);
  buffer.writeUInt8(0, 9);
  buffer.writeUInt16LE(1, 10);
  buffer.writeUInt16LE(32, 12);
  buffer.writeUInt32LE(imageSize, 14);
  buffer.writeUInt32LE(headerSize + dirEntrySize, 18);
  
  // BITMAPINFOHEADER
  let offset = headerSize + dirEntrySize;
  buffer.writeUInt32LE(40, offset);
  buffer.writeInt32LE(width, offset + 4);
  buffer.writeInt32LE(height * 2, offset + 8);
  buffer.writeUInt16LE(1, offset + 12);
  buffer.writeUInt16LE(32, offset + 14);
  buffer.writeUInt32LE(0, offset + 16);
  buffer.writeUInt32LE(pixelDataSize + maskDataSize, offset + 20);
  buffer.writeInt32LE(0, offset + 24);
  buffer.writeInt32LE(0, offset + 28);
  buffer.writeUInt32LE(0, offset + 32);
  buffer.writeUInt32LE(0, offset + 36);
  
  // Pixel Data
  offset += bmiHeaderSize;
  for (let i = 0; i < pixelDataSize; i++) {
    buffer[offset + i] = bmpData[i];
  }
  
  // AND Mask
  offset += pixelDataSize;
  for (let i = 0; i < maskDataSize; i++) {
    buffer[offset + i] = 0x00;
  }
  
  return buffer;
}

const targetDir = "D:/01_HOME/005_VIBE_AI/08_daily-purchase-admin";
const icoBuffer = createIco32();

fs.writeFileSync(path.join(targetDir, "public/favicon.ico"), icoBuffer);
fs.writeFileSync(path.join(targetDir, "src/app/favicon.ico"), icoBuffer);

console.log("✅ Đã ghi thành công favicon.ico vào public/ và src/app/!");
