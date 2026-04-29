// receipt.js — sinh HTML hóa đơn để Puppeteer screenshot

function fmt(n) {
  return Number(n).toLocaleString('vi-VN') + 'đ';
}
function fmtN(n) {
  return Number(n).toLocaleString('vi-VN');
}

function buildReceiptHTML(bill) {
  const {
    shopName, shopAddr, shopPhone,
    billId, tableNo, cashier, customer,
    items = [], payMethod,
    disc = 0, svc = 0, vat = 0,
    showThanks = true, showQR = true,
    date, time,
  } = bill;

  const sub = items.reduce((s, it) => s + it.qty * it.price, 0);
  const discAmt = Math.round(sub * disc / 100);
  const afterDisc = sub - discAmt;
  const vatAmt = Math.round(afterDisc * vat / 100);
  const svcAmt = Math.round(afterDisc * svc / 100);
  const total = afterDisc + vatAmt + svcAmt;

  const qrUrl = showQR
    ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${shopName} | ${billId}`)}&bgcolor=faf7f2&color=1a1a1a&margin=2`
    : '';

  const itemsHTML = items.map((it, i) => `
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:4px;line-height:1.9;font-size:12px">
      <span style="flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${i + 1}. ${it.name || '—'}</span>
      <span style="width:24px;text-align:center;color:#555">${it.qty}</span>
      <span style="width:60px;text-align:right;color:#777;font-size:10px">${fmtN(it.price)}</span>
      <span style="width:68px;text-align:right;font-weight:600">${fmtN(it.qty * it.price)}</span>
    </div>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#e8e4de;display:flex;align-items:flex-start;justify-content:center;padding:32px;font-family:'Share Tech Mono',monospace}
.receipt{
  width:320px;background:#faf7f2;font-size:12px;color:#1a1a1a;
  padding:28px 22px;
  box-shadow:0 4px 20px rgba(0,0,0,.18);
}

.r-center{text-align:center}
.r-bold{font-weight:700;letter-spacing:.5px}
.r-big{font-size:16px;font-weight:700;letter-spacing:1px}
.r-small{font-size:10px;color:#888}
.r-muted{color:#888}
.r-spacer{height:8px}
.r-spacer-sm{height:4px}
.r-row{display:flex;justify-content:space-between;align-items:baseline;gap:8px;line-height:1.8}
</style>
</head>
<body>
<div class="receipt">
  <div class="r-center r-big">${shopName}</div>
  <div class="r-spacer-sm"></div>
  ${shopAddr ? `<div class="r-center r-small">${shopAddr}</div>` : ''}
  ${shopPhone ? `<div class="r-center r-small">☎ ${shopPhone}</div>` : ''}
  <div class="r-spacer"></div>
  <div class="r-center r-small r-muted">================================================</div>
  <div class="r-center r-bold" style="font-size:14px;letter-spacing:2px">HÓA ĐƠN BÁN HÀNG</div>
  <div class="r-center r-small r-muted">================================================</div>
  <div class="r-spacer-sm"></div>

  <div class="r-row"><span>Số HĐ:</span><span class="r-bold">${billId}</span></div>
  <div class="r-row"><span>Ngày:</span><span>${date}</span></div>
  <div class="r-row"><span>Giờ:</span><span>${time}</span></div>
  ${tableNo ? `<div class="r-row"><span>Khu vực:</span><span>${tableNo}</span></div>` : ''}
  ${cashier ? `<div class="r-row"><span>Thu ngân:</span><span>${cashier}</span></div>` : ''}
  ${customer ? `<div class="r-row"><span>Khách:</span><span>${customer}</span></div>` : ''}

  <div class="r-spacer-sm"></div>
  <div class="r-small r-muted">------------------------------------------------</div>
  <div class="r-row" style="color:#555;font-size:11px">
    <span style="flex:1">#  Sản phẩm</span>
    <span style="width:24px;text-align:center">SL</span>
    <span style="width:60px;text-align:right">GIÁ</span>
    <span style="width:68px;text-align:right">T.TIỀN</span>
  </div>
  <div class="r-small r-muted">------------------------------------------------</div>

  ${itemsHTML}

  <div class="r-small r-muted">------------------------------------------------</div>
  <div class="r-spacer-sm"></div>

  <div class="r-row"><span>Tổng Cộng</span><span>${fmt(sub)}</span></div>
  ${disc > 0 ? `<div class="r-row" style="color:#c0392b"><span>Giảm giá (${disc}%)</span><span>- ${fmt(discAmt)}</span></div>` : ''}
  ${svc > 0 ? `<div class="r-row"><span>Phí dịch vụ (${svc}%)</span><span>${fmt(svcAmt)}</span></div>` : ''}
  ${vat > 0 ? `<div class="r-row"><span>VAT (${vat}%)</span><span>${fmt(vatAmt)}</span></div>` : ''}

  <div class="r-spacer-sm"></div>
  <div class="r-small r-muted">================================================</div>
  <div style="display:flex;justify-content:space-between;font-size:17px;font-weight:700;line-height:2.2;letter-spacing:.5px">
    <span>THÀNH TIỀN</span><span>${fmt(total)}</span>
  </div>
  <div class="r-small r-muted">================================================</div>
  <div class="r-spacer-sm"></div>
  <div class="r-row"><span>Thanh toán</span><span>${payMethod}</span></div>

  ${showThanks ? `
  <div class="r-spacer"></div>
  <div class="r-small r-muted">------------------------------------------------</div>
  <div class="r-center r-bold" style="font-size:13px">Cảm ơn quý khách! 🙏</div>
  <div class="r-center r-small r-muted">Hẹn gặp lại lần sau</div>` : ''}

  ${showQR ? `
  <div class="r-spacer"></div>
  <div class="r-small r-muted">------------------------------------------------</div>
  <div style="text-align:center;margin:10px 0 4px">
    <img src="${qrUrl}" style="width:100px;height:100px;image-rendering:pixelated" crossorigin="anonymous">
  </div>
  <div class="r-center r-small r-muted" style="font-size:9px;letter-spacing:1.5px">QUÉT ĐỂ XEM HÓA ĐƠN</div>` : ''}

  <div class="r-spacer"></div>
</div>
</body>
</html>`;
}

module.exports = { buildReceiptHTML };
