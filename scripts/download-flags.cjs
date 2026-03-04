/**
 * 국기 이미지를 flagcdn(256x192)에서 다운로드하여 public/flags에 저장합니다.
 * 실행: npm run download-flags  또는  node scripts/download-flags.cjs
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const FLAGS_DIR = path.join(__dirname, '..', 'public', 'flags');
const CODES = [
  'fr', 'it', 'ch', 'es', 'gr', 'gb', 'kr', 'de', 'ie', 'at', 'dk', 'mx', 'fi', 'ar', 'us', 'au', 'jp', 'cn', 'th'
];

if (!fs.existsSync(FLAGS_DIR)) {
  fs.mkdirSync(FLAGS_DIR, { recursive: true });
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function main() {
  for (const code of CODES) {
    const url = `https://flagcdn.com/256x192/${code}.png`;
    try {
      const buf = await download(url);
      if (buf.length < 500) {
        console.warn('Skip', code, ': too small (' + buf.length + ' bytes)');
        continue;
      }
      fs.writeFileSync(path.join(FLAGS_DIR, code + '.png'), buf);
      console.log('OK', code);
    } catch (e) {
      console.warn('Fail', code, ':', e.message);
    }
  }
  console.log('Done.');
}

main();
