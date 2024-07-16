const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name_title: { type: String, enum: ['Mr', 'Mrs', 'Miss', 'Dr', 'Chef'], required: true },
    first_name: { type: String, minLength: 1, maxLength: 50, required: true },
    last_name: { type: String, minLength: 1, maxLength: 50, required: true },
    username: { type: String, minLength: 1, maxLength: 20, required: true, unique: true },
    password: { type: String, required: true },
    dietary_preferences: { type: [String], default: [] },
    preferred_categories: { type: [String], default: [] },
    preferred_cuisine_types: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    test: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);