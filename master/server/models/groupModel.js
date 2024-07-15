const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
    group_id: { type: String, minLength: 4, maxLength: 50, required: true, unique: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'collaborator'], default: 'collaborator', required: true }
});

module.exports = mongoose.model('Group', GroupSchema);