# 🧾 Discord Bill Bot

Bot tạo hóa đơn đẹp trực tiếp trong Discord.

## Cài đặt

### 1. Clone và cài dependencies
```bash
npm install
```

> **Lưu ý:** Puppeteer sẽ tự tải Chromium (~200MB) khi `npm install`.

### 2. Tạo bot trên Discord Developer Portal
1. Vào https://discord.com/developers/applications → **New Application**
2. Vào tab **Bot** → **Reset Token** → copy token
3. Bật **Applications Commands** trong OAuth2 → URL Generator
4. Invite bot vào server với scope: `bot` + `applications.commands`

### 3. Cấu hình `.env`
```bash
cp .env.example .env
```
Điền vào `.env`:
```
DISCORD_TOKEN=token_của_bot
CLIENT_ID=application_id_của_bot  # lấy ở General Information
```

### 4. Đăng ký slash command
```bash
npm run register
```

### 5. Chạy bot
```bash
npm start
```

---

## Cách dùng

```
/bill customer: @TênKhách
```

- **Tên cửa hàng** → tự động = tên server
- **Khu vực / Bàn** → tự động = tên kênh (#general, #order...)
- **Thu ngân** → tự động = người gõ lệnh
- **Khách** → người được ping

### Buttons sau khi tạo bill:
| Button | Tác dụng |
|--------|----------|
| ➕ Thêm món | Mở modal nhập tên / số lượng / giá |
| ✏️ Sửa món | Chọn số thứ tự → sửa thông tin |
| 🗑️ Xóa món | Chọn số thứ tự → xóa |
| 📷 Xuất PNG | Gửi ảnh hóa đơn vào chat |
| 🙏 Hiện/Ẩn cảm ơn | Toggle phần cảm ơn |
| 📷 Hiện/Ẩn QR | Toggle mã QR |

### Dropdown:
- Chọn phương thức thanh toán: Tiền mặt / Chuyển khoản / Thẻ NH / MoMo / ZaloPay

---

## Cấu trúc file

```
discord-bill-bot/
├── index.js          # Main bot + event handlers
├── receipt.js        # Build HTML hóa đơn
├── screenshot.js     # Puppeteer render HTML → PNG
├── components.js     # Embed, buttons, dropdown
├── modals.js         # Các modal nhập liệu
├── register-commands.js  # Đăng ký slash command
├── .env.example
└── package.json
```
