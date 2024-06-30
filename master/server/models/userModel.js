const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name_title: { type: String, enum: ["Mr", "Mrs", "Miss", "Dr", "Chef"], required: true },
    first_name: { type: String, minLength: 1, maxLength: 50, required: true },
    last_name: { type: String, minLength: 1, maxLength: 50, required: true },
    username: { type: String, minLength: 1, maxLength: 20, required: true },
    password: { type: String, required: true },
    dietary_preferences: { type: String }
});

module.exports = mongoose.model("User", UserSchema);