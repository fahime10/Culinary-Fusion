const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FavouriteRecipeSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipe_id: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true }
});

module.exports = mongoose.model('FavoutiteRecipe', FavouriteRecipeSchema);