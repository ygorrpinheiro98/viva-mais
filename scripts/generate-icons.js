const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#grad)"/>
  <circle cx="256" cy="256" r="140" stroke="white" stroke-width="24" fill="none"/>
  <path d="M256 130 L256 190 M256 322 L256 382" stroke="white" stroke-width="32" stroke-linecap="round"/>
  <path d="M190 256 L256 256 L322 256" stroke="white" stroke-width="32" stroke-linecap="round"/>
</svg>`;

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  const svgBuffer = Buffer.from(svgContent);
  
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192.png'));
  
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512.png'));
  
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  
  console.log('✅ Ícones gerados com sucesso!');
  console.log('📁 public/icons/icon-192.png');
  console.log('📁 public/icons/icon-512.png');
  console.log('📁 public/icons/apple-touch-icon.png');
}

generateIcons().catch(console.error);
