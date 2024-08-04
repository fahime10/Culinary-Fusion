const Group = require('../models/groupModel');
const User = require('../models/userModel');
const JoinRequest = require('../models/joinRequestModel');
const asyncHandler = require('express-async-handler');

exports.groups_get_all = asyncHandler(async (req, res, next) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: 'No user found' });
        }

        const allGroups = await Group.find().lean();

        res.status(200).json(allGroups);

    } catch (error) {
        console.log(error);
        res.status(404).json({ error: 'No groups found' });
    }
});

exports.create_group = asyncHandler(async (req, res, next) => {
    const { user_id, group_name, group_description, admins, collaborators, test } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundGroup = await Group.findOne({ group_name: group_name });

        if (foundGroup) {
            return res.status(400).json({ error: 'A group with that name already exists' });
        }

        const newGroup = new Group({
            user_id: user_id,
            group_name: group_name,
            group_description: group_description,
            admins: admins,
            collaborators: collaborators,
            test
        });

        const saveGroup = await newGroup.save();

        res.status(200).json(saveGroup);

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.get_group = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { user_id } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const group = await Group.findOne({ _id: id });

        if (!group) {
            res.status(404).json({ error: 'Group not found' });
            return;
        }

        if (group.user_id.toString() === user._id.toString()) {
            res.status(200).json({ group: group, owner: true });
        } else {
            res.status(200).json({ group: group, owner: false });
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.edit_group = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { user_id, group_name, group_description, test } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const updatedData = {
            group_name: group_name,
            group_description: group_description,
            test: test
        };

        const editedGroup = await Group.findByIdAndUpdate(id, updatedData, { new: true }).lean();

        if (!editedGroup) {
            return res.status(404).json({ error: 'Something went wrong' });
        }

        res.status(200).json(editedGroup);

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.delete_group = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const group = await Group.findById(id).lean();

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        await Group.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Group deleted successfully' });
    
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.create_requests = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id, usernames } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newUsernames = JSON.parse(usernames);
        const usernameValues = newUsernames.map(userObj => userObj.value);

        console.log(usernameValues);
        const group = await Group.findById(id).populate('user_id', 'username').lean();

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const currentList = [group.user_id.username, ...group.admins, ...group.collaborators];

        const filteredUsernames = usernameValues.filter(username => !currentList.includes(username));

        const validUsers = await User.find({ username: { $in: filteredUsernames } }).lean();
        const validUsernames = validUsers.map(user => user.username);

        for (let username of validUsernames) {
            const newRequest = await JoinRequest({
                group_id: id,
                user_id: user_id,
                recipient_username: username
            });
            await newRequest.save();
        }

        res.status(200).json({ message: 'Requests have been sent' });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});