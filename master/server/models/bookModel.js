const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookSchema = new Schema({
    book_title: { type: String, minLength: 1, maxLength: 50, required: true },
    group_id: { type: Schema.Types.ObjectId },
    recipe: { type: Schema.Types.ObjectId },
    timestamp: { type: Date, default: Date.now, required: true }
});

module.exports = mongoose.model("Book", BookSchema);