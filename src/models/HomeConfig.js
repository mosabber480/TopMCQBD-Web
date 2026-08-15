import mongoose from 'mongoose';

const homeConfigSchema = new mongoose.Schema({
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
    demoSectionInfo: {
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' }
    },
    packageSectionInfo: {
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' }
    },
    missionSectionInfo: {
        sectionTitle: { type: String, default: '' },
        sectionSubtitle: { type: String, default: '' },
        missionTitle: { type: String, default: '' },
        missionDesc: { type: String, default: '' },
        goalTitle: { type: String, default: '' },
        goalDesc: { type: String, default: '' }
    }
}, { timestamps: true });

export default mongoose.models.HomeConfig || mongoose.model('HomeConfig', homeConfigSchema);
