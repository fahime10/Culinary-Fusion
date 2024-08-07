const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const BookSchema = new Schema({
    book_title: { type: String, minLength: 1, maxLength: 50, required: true },
    book_description: { type: String },
    group_id: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    recipes_id: { type: [String], required: true },
    timestamp: { type: Date, default: Date.now, required: true },
    test: { type: Boolean, default: false }
});

module.exports = mongoose.model('Book', BookSchema);