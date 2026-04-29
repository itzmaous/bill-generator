require('dotenv').config();
const {
  Client, GatewayIntentBits, Events,
  AttachmentBuilder, InteractionType,
} = require('discord.js');
const { renderBill } = require('./screenshot');
const { buildEmbed, payMethodDropdown, mainButtons } = require('./components');
const { addItemModal, removeItemModal, editItemModal, editItemIndexModal } = require('./modals');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// messageId -> bill
const bills = new Map();
// userId -> messageId (để modal biết đang sửa bill nào)
const userSession = new Map();

// ─── helpers ─────────────────────────────────────────────────────────────────

function randomBillId() {
  return 'HD-' + String(Math.floor(Math.random() * 999999)).padStart(6, '0');
}

function getNow() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return {
    date: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`,
    time: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
  };
}

async function refreshBill(interaction, bill, isFirst = false) {
  const { date, time } = getNow();
  bill.date = date;
  bill.time = time;

  const buf = await renderBill(bill);
  const file = new AttachmentBuilder(buf, { name: 'receipt.png' });
  const embed = buildEmbed(bill);
  const components = [payMethodDropdown(bill.payMethod), ...mainButtons(bill)];

  let msg;
  if (isFirst) {
    msg = await interaction.editReply({ content: '', embeds: [embed], files: [file], components });
  } else {
    await interaction.editReply({ embeds: [embed], files: [file], components });
    msg = await interaction.fetchReply();
  }

  bills.set(msg.id, bill);
  userSession.set(interaction.user.id, msg.id);
  return msg;
}

function getBillFromMessage(msgId) {
  return bills.get(msgId) || null;
}

function getBillFromUser(userId) {
  const msgId = userSession.get(userId);
  return msgId ? bills.get(msgId) : null;
}

// ─── event handler ───────────────────────────────────────────────────────────

client.once(Events.ClientReady, () => {
  console.log(`✅ Đã đăng nhập: ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    await handle(interaction);
  } catch (e) {
    console.error('Lỗi interaction:', e);
    const errMsg = { content: `❌ Lỗi: ${e.message}`, ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(errMsg).catch(() => {});
    } else {
      await interaction.reply(errMsg).catch(() => {});
    }
  }
});

async function handle(interaction) {

  // ── /bill ───────────────────────────────────────────────────────────────────
  if (interaction.isChatInputCommand() && interaction.commandName === 'bill') {
    await interaction.deferReply({ ephemeral: true });

    const customerUser = interaction.options.getUser('customer');
    const { date, time } = getNow();

    const bill = {
      shopName: interaction.guild?.name || 'Server',
      shopAddr: '',
      shopPhone: '',
      billId: randomBillId(),
      tableNo: `#${interaction.channel?.name || 'general'}`,
      cashier: interaction.member?.displayName || interaction.user.username,
      customer: customerUser?.displayName || customerUser?.username || '—',
      items: [],
      payMethod: 'Tiền mặt',
      disc: 0, svc: 0, vat: 0,
      showThanks: true,
      showQR: true,
      date, time,
    };

    await refreshBill(interaction, bill, true);
    return;
  }

  // ── Select: phương thức thanh toán ─────────────────────────────────────────
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_pay_method') {
    const bill = getBillFromMessage(interaction.message.id);
    if (!bill) { await interaction.reply({ content: '❌ Hóa đơn đã hết hạn.', ephemeral: true }); return; }
    userSession.set(interaction.user.id, interaction.message.id);
    await interaction.deferUpdate();
    bill.payMethod = interaction.values[0];
    await refreshBill(interaction, bill);
    return;
  }

  // ── Buttons ─────────────────────────────────────────────────────────────────
  if (interaction.isButton()) {
    const bill = getBillFromMessage(interaction.message.id);
    if (!bill) { await interaction.reply({ content: '❌ Hóa đơn đã hết hạn.', ephemeral: true }); return; }
    // Lưu session để modal dùng
    userSession.set(interaction.user.id, interaction.message.id);

    if (interaction.customId === 'btn_add_item') {
      await interaction.showModal(addItemModal());
      return;
    }

    if (interaction.customId === 'btn_edit_item') {
      if (!bill.items.length) { await interaction.reply({ content: '⚠️ Chưa có sản phẩm nào.', ephemeral: true }); return; }
      await interaction.showModal(editItemIndexModal(bill.items.length));
      return;
    }

    if (interaction.customId === 'btn_remove_item') {
      if (!bill.items.length) { await interaction.reply({ content: '⚠️ Chưa có sản phẩm nào.', ephemeral: true }); return; }
      await interaction.showModal(removeItemModal(bill.items.length));
      return;
    }

    if (interaction.customId === 'btn_export_png') {
      await interaction.deferReply({ ephemeral: false });
      const buf = await renderBill(bill);
      const file = new AttachmentBuilder(buf, { name: `hoadon-${bill.billId}.png` });
      await interaction.editReply({ content: `📄 Hóa đơn **#${bill.billId}**`, files: [file] });
      return;
    }

    if (interaction.customId === 'btn_toggle_thanks') {
      await interaction.deferUpdate();
      bill.showThanks = !bill.showThanks;
      await refreshBill(interaction, bill);
      return;
    }

    if (interaction.customId === 'btn_toggle_qr') {
      await interaction.deferUpdate();
      bill.showQR = !bill.showQR;
      await refreshBill(interaction, bill);
      return;
    }
  }

  // ── Modals ──────────────────────────────────────────────────────────────────
  if (interaction.type === InteractionType.ModalSubmit) {
    const id = interaction.customId;
    const bill = getBillFromUser(interaction.user.id);
    if (!bill) { await interaction.reply({ content: '❌ Session hết hạn, hãy dùng /bill lại.', ephemeral: true }); return; }

    // Thêm sản phẩm
    if (id === 'modal_add_item') {
      const name = interaction.fields.getTextInputValue('item_name').trim();
      const qty = Math.max(1, parseInt(interaction.fields.getTextInputValue('item_qty')) || 1);
      const price = Math.max(0, parseInt(interaction.fields.getTextInputValue('item_price').replace(/\D/g, '')) || 0);
      await interaction.deferUpdate();
      bill.items.push({ name, qty, price });
      await refreshBill(interaction, bill);
      return;
    }

    // Sửa sản phẩm — bước 1: nhập index
    if (id === 'modal_edit_pick') {
      const idx = parseInt(interaction.fields.getTextInputValue('item_index')) - 1;
      if (isNaN(idx) || idx < 0 || idx >= bill.items.length) {
        await interaction.reply({ content: `⚠️ Số thứ tự phải từ 1–${bill.items.length}.`, ephemeral: true });
        return;
      }
      // Lưu index đang sửa
      bill._editIdx = idx;
      await interaction.showModal(editItemModal(idx, bill.items[idx]));
      return;
    }

    // Sửa sản phẩm — bước 2: nhập dữ liệu mới
    if (id === 'modal_edit_item') {
      const idx = bill._editIdx ?? -1;
      if (idx < 0 || idx >= bill.items.length) {
        await interaction.reply({ content: '❌ Không xác định được sản phẩm cần sửa.', ephemeral: true });
        return;
      }
      await interaction.deferUpdate();
      bill.items[idx] = {
        name: interaction.fields.getTextInputValue('item_name').trim(),
        qty: Math.max(1, parseInt(interaction.fields.getTextInputValue('item_qty')) || 1),
        price: Math.max(0, parseInt(interaction.fields.getTextInputValue('item_price').replace(/\D/g, '')) || 0),
      };
      delete bill._editIdx;
      await refreshBill(interaction, bill);
      return;
    }

    // Xóa sản phẩm
    if (id === 'modal_remove_item') {
      const idx = parseInt(interaction.fields.getTextInputValue('item_index')) - 1;
      if (isNaN(idx) || idx < 0 || idx >= bill.items.length) {
        await interaction.reply({ content: `⚠️ Số thứ tự phải từ 1–${bill.items.length}.`, ephemeral: true });
        return;
      }
      await interaction.deferUpdate();
      bill.items.splice(idx, 1);
      await refreshBill(interaction, bill);
      return;
    }
  }
}

client.login(process.env.DISCORD_TOKEN);
