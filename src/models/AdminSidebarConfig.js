import mongoose from 'mongoose';

const subMenuItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  icon: { type: String, default: 'fa-solid fa-circle' }
});

const menuItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, default: '#' },
  icon: { type: String, default: 'fa-solid fa-circle' },
  subMenus: [subMenuItemSchema]
});

const headerButtonSchema = new mongoose.Schema({
  text: { type: String, required: true },
  url: { type: String, default: '#' },
  icon: { type: String, default: 'fa-solid fa-arrow-up-right-from-square' },
  color: { type: String, default: 'primary' }, // 'primary' | 'success' | 'danger' | 'dark' | 'info' | 'warning'
  targetBlank: { type: Boolean, default: false },
  action: { type: String, default: 'link' } // 'link' | 'logout'
});

const adminSidebarConfigSchema = new mongoose.Schema({
  menus: [menuItemSchema],
  headerButtons: [headerButtonSchema]
}, { timestamps: true });

export default mongoose.models.AdminSidebarConfig || mongoose.model('AdminSidebarConfig', adminSidebarConfigSchema);
