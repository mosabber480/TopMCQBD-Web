const mongoose = require('mongoose');

const layoutConfigSchema = new mongoose.Schema({
    announcement: {
        text: String,
        link: String
    },
    header: {
        siteTitle: String,
        logoUrl: String,
        btnText: String,
        btnLink: String,
        menus: [
            {
                title: String,
                url: String,
                subMenus: [
                    {
                        title: String,
                        url: String
                    }
                ]
            }
        ]
    },
    footer: {
        col1Text: String,
        col1Fb: String,
        col1Yt: String,
        col2Title: String,
        col3Title: String,
        col4Title: String
    },
    copyright: {
        text: String
    }
}, { timestamps: true }); // timestamps: true দেওয়াতে updatedAt অটো জেনারেট হবে

module.exports = mongoose.model('LayoutConfig', layoutConfigSchema);