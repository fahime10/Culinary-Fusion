const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, minLength: 1, maxLength: 100, required: true },
    image: { type: Buffer, default: null },
    chef: { type: String, required: true },
    private: { type: Boolean, default: false },
    description: { type: String, required: true },
    quantities: { type: [String] },
    ingredients: { type: [String], required: true },
    steps: { type: [String], required : true },
    timestamp: { type: Date, default: Date.now, required: true },
    diet: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    cuisine_types: { type: [String], default: [] },
    allergens: { type: [String], default: [] },
    test: { type: Boolean, default: false }
});

module.exports = mongoose.model('Recipe', RecipeSchema);
