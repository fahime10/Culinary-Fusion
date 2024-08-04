const Group = require('../models/groupModel');
const User = require('../models/userModel');
const JoinRequest = require('../models/joinRequestModel');
const asyncHandler = require('express-async-handler');

exports.get_all_notifications = asyncHandler(async (req, res, next) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: 'No user found' });
        }

        const allNotifications = await JoinRequest.find({ recipient_username: username })
            .populate('user_id', 'username')
            .populate('group_id', 'group_name')
            .lean();

        res.status(200).json(allNotifications);

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.accept_request = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { group_id, user_id, username } = req.body;

    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundJoinRequest = await JoinRequest.findOne({ _id: id, group_id: group_id, user_id: user_id, recipient_username: username });

        if (!foundJoinRequest) {
            return res.status(404).json({ error: 'Join request not found' });
        }

        const foundGroup = await Group.findOne({ _id: group_id });

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const updatedGroup = await Group.findByIdAndUpdate(
            group_id, 
            { $push: { collaborators: username } },
            { new: true }
        );

        await JoinRequest.findByIdAndDelete(foundJoinRequest._id);

        res.status(200).json({ message: `Request accepted to join ${updatedGroup.group_name}`, group: updatedGroup });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.refuse_request = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { group_id, user_id, username } = req.body;

    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundJoinRequest = await JoinRequest.findOne({ _id: id, group_id: group_id, user_id: user_id, recipient_username: username });

        if (!foundJoinRequest) {
            return res.status(404).json({ error: 'Join request not found' });
        }

        const foundGroup = await Group.findOne({ _id: group_id });

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        await JoinRequest.findByIdAndDelete(foundJoinRequest._id);

        res.status(200).json({ message: `Request refused to join ${foundGroup.group_name}`});

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});