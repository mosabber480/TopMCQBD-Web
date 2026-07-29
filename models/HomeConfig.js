const mongoose = require('mongoose');

const homeConfigSchema = new mongoose.Schema({
    // 🌟 SEO মেটা ডেটা (নতুন যুক্ত করা হয়েছে)
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },

    sliders: [{
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        bgImage: { type: String, default: 'images/slider-01.jpg' },
        bgOpacity: { type: Number, default: 0.5 },
        btn1Text: { type: String, default: '' },
        btn1Link: { type: String, default: '' },
        btn2Text: { type: String, default: '' },
        btn2Link: { type: String, default: '' }
    }],
    demoQuizzes: [{
        title: { type: String, default: '' },
        badgeText: { type: String, default: '' },
        desc: { type: String, default: '' },
        link: { type: String, default: '' }
    }],
    packages: [{
        title: { type: String, default: '' },
        price: { type: String, default: '' },
        duration: { type: String, default: '' },
        desc: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        buyLink: { type: String, default: '' }
    }],
    // 🌟 সেকশন হেডার অবজেক্টসমূহ
    demoSectionInfo: {
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' }
    },
    packageSectionInfo: {
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' }
    },
    // 🌟 নতুন যুক্ত করা মিশন ও লক্ষ্য সেকশন অবজেক্ট
    missionSectionInfo: {
        sectionTitle: { type: String, default: '' },
        sectionSubtitle: { type: String, default: '' },
        missionTitle: { type: String, default: '' },
        missionDesc: { type: String, default: '' },
        goalTitle: { type: String, default: '' },
        goalDesc: { type: String, default: '' }
    }
}, { timestamps: true });

module.exports = mongoose.model('HomeConfig', homeConfigSchema);