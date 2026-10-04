// Extrait la photo de profil du CV (flux JPEG /DCTDecode + masque de transparence /SMask)
// et l'enregistre en WebP détouré. Opération ponctuelle, non appelée au build.
// Usage : node scripts/extract-photo.mjs [CV_admin.pdf] [public/photo.webp]
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { chromium } from '@playwright/test';

const [pdfPath = 'CV_admin.pdf', outPath = 'public/photo.webp'] = process.argv.slice(2);
const pdf = readFileSync(pdfPath);
const text = pdf.toString('latin1');

/** Retourne { dict, data } pour l'objet PDF `id` qui contient un flux. */
function readStreamObject(id) {
  const pattern = new RegExp(`(?:^|\\s)${id} 0 obj\\s*<<([\\s\\S]*?)>>\\s*stream\\r?\\n`);
  const match = pattern.exec(text);
  if (!match) throw new Error(`Objet ${id} introuvable`);
  const dict = match[1];
  const length = Number(/\/Length (\d+)/.exec(dict)?.[1]);
  const start = match.index + match[0].length;
  return { dict, data: pdf.subarray(start, start + length) };
}

const jpegId = /(\d+) 0 obj\s*<<(?:(?!>>\s*stream)[\s\S])*?\/DCTDecode/.exec(text)?.[1];
if (!jpegId) throw new Error('Aucune image JPEG trouvée dans le PDF');

const photo = readStreamObject(jpegId);
const width = Number(/\/Width (\d+)/.exec(photo.dict)[1]);
const height = Number(/\/Height (\d+)/.exec(photo.dict)[1]);
const maskId = /\/SMask (\d+) 0 R/.exec(photo.dict)?.[1];
const mask = maskId ? inflateSync(readStreamObject(maskId).data) : null;

console.log(`Photo : objet ${jpegId}, ${width}x${height}, masque : ${maskId ?? 'aucun'}`);

// Le navigateur sert de décodeur JPEG et d'encodeur WebP.
const browser = await chromium.launch();
const page = await browser.newPage();
const dataUrl = await page.evaluate(
  async ({ jpegBase64, maskBytes, width, height }) => {
    const img = new Image();
    img.src = `data:image/jpeg;base64,${jpegBase64}`;
    await img.decode();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    if (maskBytes) {
      const pixels = ctx.getImageData(0, 0, width, height);
      const d = pixels.data;
      for (let i = 0; i < width * height; i++) {
        const alpha = maskBytes[i];
        // Les bords du JPEG sont fondus vers le noir : on retire ce fond noir.
        if (alpha > 0 && alpha < 255) {
          for (let c = 0; c < 3; c++) d[i * 4 + c] = Math.min(255, (d[i * 4 + c] * 255) / alpha);
        }
        d[i * 4 + 3] = alpha;
      }
      ctx.putImageData(pixels, 0, 0);
    }
    return canvas.toDataURL('image/webp', 0.85);
  },
  {
    jpegBase64: photo.data.toString('base64'),
    maskBytes: mask ? Array.from(mask) : null,
    width,
    height,
  },
);
await browser.close();

const webp = Buffer.from(dataUrl.split(',')[1], 'base64');
writeFileSync(outPath, webp);
console.log(`${outPath} : ${(webp.length / 1024).toFixed(1)} Ko`);
