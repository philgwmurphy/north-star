import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

// Icon SVG with star design matching the app's theme
const createIconSvg = (size, padding = 0) => {
  const scaledPadding = (padding / 512) * size;
  const innerSize = size - (scaledPadding * 2);
  const center = size / 2;

  // Star points calculation
  const outerRadius = innerSize * 0.4;
  const innerRadius = outerRadius * 0.38;
  const points = [];

  for (let i = 0; i < 5; i++) {
    // Outer point
    const outerAngle = (i * 72 - 90) * (Math.PI / 180);
    points.push(`${center + outerRadius * Math.cos(outerAngle)},${center + outerRadius * Math.sin(outerAngle)}`);
    // Inner point
    const innerAngle = ((i * 72) + 36 - 90) * (Math.PI / 180);
    points.push(`${center + innerRadius * Math.cos(innerAngle)},${center + innerRadius * Math.sin(innerAngle)}`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff3b30"/>
      <stop offset="100%" style="stop-color:#ff9500"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#000000"/>
  <polygon points="${points.join(' ')}" fill="url(#starGradient)"/>
</svg>`;
};

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  await mkdir(iconsDir, { recursive: true });

  // Generate regular icons
  for (const size of sizes) {
    const svg = createIconSvg(size);
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    await writeFile(join(iconsDir, `icon-${size}x${size}.png`), pngBuffer);
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Generate maskable icons (with extra padding for safe zone)
  for (const size of [192, 512]) {
    const svg = createIconSvg(size, size * 0.1); // 10% padding for maskable
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    await writeFile(join(iconsDir, `icon-maskable-${size}x${size}.png`), pngBuffer);
    console.log(`Generated icon-maskable-${size}x${size}.png`);
  }

  // Generate Apple touch icon (180x180)
  const appleSize = 180;
  const appleSvg = createIconSvg(appleSize);
  const applePngBuffer = await sharp(Buffer.from(appleSvg))
    .png()
    .toBuffer();

  await writeFile(join(iconsDir, 'apple-touch-icon.png'), applePngBuffer);
  console.log('Generated apple-touch-icon.png');

  // Generate favicon (32x32)
  const faviconSvg = createIconSvg(32);
  const faviconBuffer = await sharp(Buffer.from(faviconSvg))
    .png()
    .toBuffer();

  await writeFile(join(publicDir, 'favicon.ico'), faviconBuffer);
  console.log('Generated favicon.ico');

  console.log('\\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
