const Group = require('../models/groupModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

exports.groups_get_all = asyncHandler(async (req, res, next) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            res.status(404).json({ error: 'No user found' });
            return;
        }

        const allGroups = await Group.find().lean();

        res.status(200).json(allGroups);

    } catch (error) {
        console.log(error);
        res.status(404).json({ error: 'No groups found' });
    }
});

exports.create_group = asyncHandler(async (req, res, next) => {
    const { user_id, group_name, group_description, role, test } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const foundGroup = await Group.findOne({ group_name: group_name });

        if (foundGroup) {
            res.status(400).json({ error: 'A group with that name already exists' });
            return;
        }

        const newGroup = new Group({
            user_id: user_id,
            group_name: group_name,
            group_description: group_description,
            role: role,
            test
        });

        const saveGroup = await newGroup.save();

        res.status(200).json(saveGroup);

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});