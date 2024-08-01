const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GroupSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    group_name: { type: String, minLength: 4, required: true, unique: true },
    group_description: { type: String, default: "" },
    role: { type: String, enum: ['admin', 'collaborator'], default: 'collaborator', required: true }
});

module.exports = mongoose.model('Group', GroupSchema);