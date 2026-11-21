const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const footerPath = path.join(ROOT_DIR, 'footer.html');

if (!fs.existsSync(footerPath)) {
  console.error('Không tìm thấy footer.html');
  process.exit(1);
}

const footerHtml = fs.readFileSync(footerPath, 'utf8');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let count = 0;
walkDir(ROOT_DIR, function(filePath) {
  // Bản /en do scripts/build-en.js sinh (có footer đã dịch) nên bỏ qua ở đây
  if (filePath.includes(path.sep + 'en' + path.sep)) return;
  if (filePath.endsWith('.html') && !filePath.endsWith('footer.html')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    const startIdx = content.indexOf('<div id="site-footer-container">');
    if (startIdx !== -1) {
      const footerEnd = content.indexOf('</footer>', startIdx);
      if (footerEnd !== -1) {
        const divEnd = content.indexOf('</div>', footerEnd);
        if (divEnd !== -1) {
          const endIdx = divEnd + '</div>'.length;
          content = content.substring(0, startIdx) + `<div id="site-footer-container">\n${footerHtml.trim()}\n</div>` + content.substring(endIdx);
          updated = true;
        }
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Đã đồng bộ footer cho:', path.relative(ROOT_DIR, filePath));
      count++;
    }
  }
});

console.log(`\nHoàn tất! Đã đồng bộ footer.html vào ${count} tệp HTML.`);

