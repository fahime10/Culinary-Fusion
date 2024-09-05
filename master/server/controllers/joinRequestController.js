/**
 * joinRequestController component
 * 
 * This component handles all features of join requests such as getting all notifications for a specific user,
 * creating, accepting and refusing requests.
 * 
 */

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

exports.create_requests = asyncHandler(async (req, res, next) => {
    const { group_name } = req.params;

    const { user_id, usernames, test } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newUsernames = JSON.parse(usernames);
        const usernameValues = newUsernames.map(userObj => userObj.value);

        const group = await Group.findOne({ group_name: group_name }).populate('user_id', 'username').lean();

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const currentList = [group.user_id.username, ...group.admins, ...group.collaborators];

        const filteredUsernames = usernameValues.filter(username => !currentList.includes(username));

        const validUsers = await User.find({ username: { $in: filteredUsernames } }).lean();
        const validUsernames = validUsers.map(user => user.username);

        for (let username of validUsernames) {
            const existingRequest = await JoinRequest.findOne({ group_id: group._id, recipient_username: username });

            if (!existingRequest) {
                const newRequest = await JoinRequest({
                    group_id: group._id,
                    user_id: user_id,
                    recipient_username: username,
                    test: test
                });
                await newRequest.save();
            }
        }

        res.status(200).json({ message: 'Requests have been sent' });

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