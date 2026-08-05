const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, default: 'fa-solid fa-circle' }
});

const adminSidebarConfigSchema = new mongoose.Schema({
    menus: [menuItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('AdminSidebarConfig', adminSidebarConfigSchema);