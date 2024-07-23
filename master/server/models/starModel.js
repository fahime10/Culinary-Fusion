const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StarSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipe_id: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    stars: { type: Number, required: true }
});

module.exports = mongoose.model('Star', StarSchema);