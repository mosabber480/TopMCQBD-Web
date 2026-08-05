const mongoose = require('mongoose');

// সাব-মেনু স্কিমা (একই ডাটা স্ট্রাকচার)
const subMenuItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, default: 'fa-solid fa-circle' }
});

// প্রধান মেনু স্কিমা (যা সাব-মেনুর অ্যারে ধারণ করবে)
const menuItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, default: '#' },
    icon: { type: String, default: 'fa-solid fa-circle' },
    subMenus: [subMenuItemSchema] // 👈 ড্রপডাউনের জন্য সাব-মেনু অ্যারে যোগ করা হলো
});

const adminSidebarConfigSchema = new mongoose.Schema({
    menus: [menuItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('AdminSidebarConfig', adminSidebarConfigSchema);