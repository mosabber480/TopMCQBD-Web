const mongoose = require('mongoose');

const layoutConfigSchema = new mongoose.Schema({
    announcement: {
        text: String,
        link: String
    },
    header: {
        siteTitle: String,
        logoUrl: String,
        seoTitle: String,
        faviconUrl: String,
        btnText: String,
        btnLink: String,
        menus: [
            {
                title: String,
                url: String,
                isMegaMenu: { type: Boolean, default: false }, 
                megaMenuId: String, // 🌟 কোন মেগা মেনু সিলেক্ট করা হয়েছে তার ID সেভ করার জন্য
                subMenus: [
                    {
                        title: String,
                        url: String
                    }
                ]
            }
        ],
        megaMenus: { type: Array, default: [] } // 🌟 একাধিক মেগা মেনুর লেআউট সেভ করার জন্য নতুন অ্যারে
    },
    footer: {
        // এখন শুধু dynamic drag & drop কলাম ডাটা এখানে সেভ হয়, পুরনো col1-col4 fields বাদ দেওয়া হয়েছে
        columns: { type: Array, default: [] }
    },
    copyright: {
        text: String,
        // 👈 নতুন কপিরাইট লিংকগুলোর (FAQ, Terms) ডাটা সেভ করার জন্য এই ফিল্ডটি যোগ করা হলো
        links: { type: Array, default: [] } 
    }
}, { 
    timestamps: true, 
    strict: false // 👈 strict: false করে দেওয়া হয়েছে যাতে নতুন কলামের ভেতরের ডাটা স্ট্রাকচার সেভ হতে কোনো সমস্যা না হয়
});

module.exports = mongoose.model('LayoutConfig', layoutConfigSchema);