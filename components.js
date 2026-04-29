// components.js — buttons, dropdown, embed builder
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');

const PAY_METHODS = ['Tiền mặt', 'Chuyển khoản', 'Thẻ ngân hàng', 'Ví MoMo', 'ZaloPay'];

const PAY_EMOJI = {
  'Tiền mặt': '💵',
  'Chuyển khoản': '🏧',
  'Thẻ ngân hàng': '💳',
  'Ví MoMo': '💜',
  'ZaloPay': '🔵',
};

function payMethodDropdown(selected) {
  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select_pay_method')
      .setPlaceholder('Phương thức thanh toán')
      .addOptions(PAY_METHODS.map(m => ({
        label: m,
        value: m,
        default: m === selected,
        emoji: PAY_EMOJI[m],
      })))
  );
}

function mainButtons(bill) {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_add_item')
      .setEmoji('➕')
      .setLabel('Thêm sản phẩm')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_edit_item')
      .setEmoji('✏️')
      .setLabel('Sửa sản phẩm')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('btn_remove_item')
      .setEmoji('🗑️')
      .setLabel('Xóa sản phẩm')
      .setStyle(ButtonStyle.Danger),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('btn_toggle_thanks')
      .setLabel(bill.showThanks ? '🙏 Ẩn cảm ơn' : '🙏 Hiện cảm ơn')
      .setStyle(bill.showQR ? ButtonStyle.Success : ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('btn_toggle_qr')
      .setLabel(bill.showQR ? '📷 Ẩn QR' : '📷 Hiện QR')
      .setStyle(bill.showQR ? ButtonStyle.Success : ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('btn_export_png')
      .setLabel('📷 Xuất PNG')
      .setStyle(ButtonStyle.Primary),
  );

  return [row1, row2];
}

function buildEmbed(bill) {
  const fmt = n => Number(n).toLocaleString('vi-VN') + 'đ';

  const sub = bill.items.reduce((s, it) => s + it.qty * it.price, 0);
  const discAmt = Math.round(sub * bill.disc / 100);
  const afterDisc = sub - discAmt;
  const vatAmt = Math.round(afterDisc * bill.vat / 100);
  const svcAmt = Math.round(afterDisc * bill.svc / 100);
  const total = afterDisc + vatAmt + svcAmt;

  const itemLines = bill.items.length > 0
    ? bill.items.map((it, i) =>
        `\`${String(i + 1).padStart(2, '0')}.\` **${it.name}** × ${it.qty} — ${fmt(it.qty * it.price)}`
      ).join('\n')
    : '*Chưa có sản phẩm nào*';

  const embed = new EmbedBuilder()
    .setColor(0xd4b483)
    .setTitle(`Hóa đơn **#${bill.billId}**`)
    .setImage('attachment://receipt.png')

  return embed;
}

module.exports = { payMethodDropdown, mainButtons, buildEmbed, PAY_METHODS };