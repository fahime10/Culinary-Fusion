const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const IngredientSchema = new Schema({
    recipe_id: { type: Schema.Types.ObjectId, ref:'Recipe', required: true },
    ingredient: { type: String, minLength: 1, required: true }
});

module.exports = mongoose.model('Ingredient', IngredientSchema);