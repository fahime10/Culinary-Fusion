const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipe_id: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
    text: { type: String, minLength: 1, required: true },
    timestamp: { type: Date, default: Date.now, required: true },
    test: { type: Boolean, default: false }
});

module.exports = mongoose.model('Comment', CommentSchema);