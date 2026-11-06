const SHEET_NAME = 'Lời chúc';
const HEADERS = ['Thời gian', 'Họ tên', 'Email', 'Lời chúc'];

function getTargetSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
}

function doGet() {
  try {
    const sheet = getTargetSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return reply({ ok: true, wishes: [] });
    }
    const rows = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    const wishes = rows
      .filter((r) => r[1] && r[3])
      .map((r) => ({
        time: String(r[0] || ''),
        name: String(r[1] || ''),
        wish: String(r[3] || ''),
      }))
      .reverse()
      .slice(0, 50);
    return reply({ ok: true, wishes: wishes });
  } catch (err) {
    return reply({ ok: false, error: 'Không thể tải lời chúc.', wishes: [] });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const token = PropertiesService.getScriptProperties().getProperty('TOKEN');
    if (token && data.token !== token) return reply({ ok: false, error: 'unauthorized' });

    const name = String(data.name || '').trim().slice(0, 80);
    const email = String(data.email || '').trim().slice(0, 120);
    const wish = String(data.wish || '').trim().slice(0, 500);
    if (!name || !email || !wish || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return reply({ ok: false, error: 'Dữ liệu không hợp lệ.' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getTargetSheet();
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(HEADERS);
        sheet.setFrozenRows(1);
      }
      const when = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');
      sheet.appendRow([when, safe(name), safe(email), safe(wish)]);
    } finally {
      lock.releaseLock();
    }
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: 'Không thể lưu lời chúc.' });
  }
}

function safe(value) {
  const text = String(value == null ? '' : value).trim();
  return /^[=+\-@\t\r\n]/.test(text) ? "'" + text : text;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
