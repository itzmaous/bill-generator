const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

function addItemModal() {
  return new ModalBuilder()
    .setCustomId('modal_add_item')
    .setTitle('➕ Thêm sản phẩm')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('item_name').setLabel('Tên sản phẩm')
          .setStyle(TextInputStyle.Short).setRequired(true)
          .setPlaceholder('VD: Cà phê sữa đá')
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('item_qty').setLabel('Số lượng')
          .setStyle(TextInputStyle.Short).setRequired(true)
          .setValue('1')
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('item_price').setLabel('Đơn giá (VND)')
          .setStyle(TextInputStyle.Short).setRequired(true)
          .setPlaceholder('45000')
      )
    );
}

function editItemIndexModal(count) {
  return new ModalBuilder()
    .setCustomId('modal_edit_pick')
    .setTitle('✏️ Sửa sản phẩm — chọn số thứ tự')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('item_index')
          .setLabel(`Số thứ tự sản phẩm muốn sửa (1–${count})`)
          .setStyle(TextInputStyle.Short).setRequired(true)
          .setPlaceholder('1')
      )
    );
}

function editItemModal(idx, item) {
  return new ModalBuilder()
    .setCustomId('modal_edit_item')
    .setTitle(`✏️ Sửa sản phẩm #${idx + 1}`)
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('item_name').setLabel('Tên sản phẩm')
          .setStyle(TextInputStyle.Short).setRequired(true)
          .setValue(item.name)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('item_qty').setLabel('Số lượng')
          .setStyle(TextInputStyle.Short).setRequired(true)
          .setValue(String(item.qty))
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('item_price').setLabel('Đơn giá (VND)')
          .setStyle(TextInputStyle.Short).setRequired(true)
          .setValue(String(item.price))
      )
    );
}

function removeItemModal(count) {
  return new ModalBuilder()
    .setCustomId('modal_remove_item')
    .setTitle('🗑️ Xóa sản phẩm')
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('item_index')
          .setLabel(`Số thứ tự sản phẩm cần xóa (1–${count})`)
          .setStyle(TextInputStyle.Short).setRequired(true)
          .setPlaceholder('1')
      )
    );
}

module.exports = { addItemModal, editItemIndexModal, editItemModal, removeItemModal };
