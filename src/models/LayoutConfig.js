import mongoose from 'mongoose';

const layoutConfigSchema = new mongoose.Schema({
    announcement: {
        text: { type: String, default: '' },
        link: { type: String, default: '' }
    },
    header: {
        siteTitle: { type: String, default: 'TopMCQBD' },
        logoUrl: { type: String, default: '' },
        seoTitle: { type: String, default: '' },
        faviconUrl: { type: String, default: '' },
        btnText: { type: String, default: '' },
        btnLink: { type: String, default: '' },
        menus: [
            {
                title: String,
                url: String,
                isMegaMenu: { type: Boolean, default: false },
                megaMenuId: String,
                subMenus: [
                    {
                        title: String,
                        url: String
                    }
                ]
            }
        ],
        megaMenus: { type: Array, default: [] }
    },
    footer: {
        columns: { type: Array, default: [] }
    },
    copyright: {
        text: { type: String, default: '' },
        links: { type: Array, default: [] }
    }
}, {
    timestamps: true,
    strict: false
});

export default mongoose.models.LayoutConfig || mongoose.model('LayoutConfig', layoutConfigSchema);
