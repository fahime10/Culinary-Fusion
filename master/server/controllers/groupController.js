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
        const user = await User.findOne({ _id: user_id }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundGroup = await Group.findOne({ _id: id }).populate('user_id', 'username').lean();

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        let isMainAdmin = false;
        let isAdmin = false;
        let isCollaborator = false;

        if (foundGroup.user_id._id.toString() === user._id.toString()) {
            isMainAdmin = true;
        } else if (foundGroup.admins && foundGroup.admins.includes(user.username)) {
            isAdmin = true;
        } else if (foundGroup.collaborators && foundGroup.collaborators.includes(user.username)) {
            isCollaborator = true;
        }

        res.status(200).json({ group: foundGroup, is_main_admin: isMainAdmin, is_admin: isAdmin, is_collaborator: isCollaborator });

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
            return res.status(404).json({ error: 'User not found' });
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

exports.promote_user = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id, username } = req.body;

    try {
        const user = await User.findOne({ _id: user_id }).lean();
        const foundUsername = await User.findOne({ username: username }).lean();
        
        if (!user || !foundUsername) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundGroup = await Group.findOne({ _id: id }).lean();

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        await Group.findByIdAndUpdate(
            foundGroup._id,
            { $push: { admins: username }},
            { new: true }
        );

        await Group.findByIdAndUpdate(
            foundGroup._id,
            { $pull: { collaborators: username }},
            { new: true }
        );

        const allMembers = await Group.findOne({ _id: id }).lean();
        
        res.status(200).json({ collaborators: allMembers.collaborators, admins: allMembers.admins });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.demote_user = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id, username } = req.body;

    try {
        const user = await User.findOne({ _id: user_id }).lean();
        const foundUsername = await User.findOne({ username: username }).lean();
        
        if (!user || !foundUsername) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundGroup = await Group.findOne({ _id: id }).lean();

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        await Group.findByIdAndUpdate(
            foundGroup._id,
            { $push: { collaborators: username }},
            { new: true }
        );

        await Group.findByIdAndUpdate(
            foundGroup._id,
            { $pull: { admins: username }},
            { new: true }
        );

        const allMembers = await Group.findOne({ _id: id }).lean();
        
        res.status(200).json({ collaborators: allMembers.collaborators, admins: allMembers.admins });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.remove_user = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id, username } = req.body;

    try {
        const user = await User.findOne({ _id: user_id }).lean();
        const foundUsername = await User.findOne({ username: username }).lean();
        
        if (!user || !foundUsername) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundGroup = await Group.findOne({ _id: id }).lean();

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        await Group.findByIdAndUpdate(
            foundGroup._id,
            { $pull: { collaborators: username }},
            { new: true }
        );

        await Group.findByIdAndUpdate(
            foundGroup._id,
            { $pull: { admins: username }},
            { new: true }
        );

        const allMembers = await Group.findOne({ _id: id }).lean();
        
        res.status(200).json({ collaborators: allMembers.collaborators, admins: allMembers.admins });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.search_group = asyncHandler(async (req, res, next) => {
    const { group_name } = req.params;

    const { username } = req.body;

    try {
        const user = await User.findOne({ username: username }).lean();
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundGroup = await Group.find({ group_name: new RegExp(group_name, 'i') }).lean();

        res.status(200).json(foundGroup);

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});