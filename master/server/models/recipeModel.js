const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const RecipeSchema = new Schema({
    title: { type: String, minLength: 1, maxLength: 100, required: true },
    image: { type: Buffer },
    chef: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: { type: [String], required: true },
    steps: { type: [String], required : true },
    timestamp: { type: Date, default: Date.now, required: true },
    stars: { type: Number, default: 0 }
});

module.exports = mongoose.model("Recipe", RecipeSchema);