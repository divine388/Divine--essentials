const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
        type: String,
        enum: ['Crystals', 'Incense', 'Idols', 'Rituals'],
        required: true
    },
    faithTag: { type: String, required: true },
    images: [{ type: String }],
    stock: { type: Number, required: true },
    isFeatured: { type: Boolean, default: false },
    ratings: { type: Number, min: 0, max: 5 },
    reviews: [{
        user: { type: String, required: true },
        comment: { type: String, required: true },
        rating: { type: Number, min: 0, max: 5 }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
