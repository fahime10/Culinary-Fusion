const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const joinRequestSchema = new Schema({
    group_id: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient_username: { type: String, required: true },
    timestamp: { type: Date, default: Date.now(), required: true },
    test: { type: Boolean, default: false }
});

module.exports = mongoose.model('JoinRequest', joinRequestSchema);