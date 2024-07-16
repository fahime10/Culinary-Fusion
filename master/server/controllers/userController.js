const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

exports.add_user = asyncHandler(async (req, res, next) => {
    try {
        const { name_title, first_name, last_name, username, dietary_preferences, preferred_categories, 
                preferred_cuisine_types, allergies, test } = req.body;

        const user = await User.findOne({ username: username });
        
        if (!name_title || !first_name || !last_name || !username || !req.body.password) {
            return res.status(400).json({ error: 'All fields must be filled' });
        }

        if (user) {
            return res.status(400).json({ error: 'Username is already taken' });
        } else {
            let password = req.body.password;
            bcrypt.hash(password, 10, async (err, hashedPassword) => {
                if (err) {
                    res.status(500);
                    return;
                } else {
                    const newUser = new User({
                        name_title,
                        first_name,
                        last_name,
                        username,
                        password: hashedPassword,
                        dietary_preferences,
                        preferred_categories,
                        preferred_cuisine_types,
                        allergies,
                        test
                    });

                    const saveUser = await newUser.save();

                    res.status(200).json(saveUser);
                }
            });
        }

    } catch (err) {
        res.status(404).json({ error: err.message });
        console.log(err);
    }
});

exports.login_user = asyncHandler(async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username: username });

        if (!user) {
            res.status(401).send({ error: "Incorrect credentials" });
            return;
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            res.status(401).send({ error: "Incorrect credentials" });
            return;
        }

        res.status(200).send({ 
            username: user.username, 
            name_title: user.name_title, 
            last_name: user.last_name,
            status: 200
        });

    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err.message });
    }
});

exports.user_details = asyncHandler(async (req, res, next) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json({ 
            name_title: user.name_title, 
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            dietary_preferences: user.dietary_preferences,
            preferred_categories: user.preferred_categories,
            preferred_cuisine_types: user.preferred_cuisine_types,
            allergies: user.allergies
        });

    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err.message });
    }
});

exports.edit_user = asyncHandler(async (req, res, next) => {
    const { username } = req.params;

    const { name_title, first_name, last_name, dietary_preferences, 
            preferred_categories, preferred_cuisine_types, allergies } = req.body;

    try {
        const user = await User.findOne({ username: username });

        const foundUsername = await User.findOne({ username: req.body.username });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        } else if (foundUsername && (user.username !== foundUsername.username)) {
            res.status(404).json({ error: 'Username is already taken' });
            return;
        } else {
            const updatedData = {
                name_title,
                first_name,
                last_name,
                username: req.body.username,
                dietary_preferences,
                preferred_categories, 
                preferred_cuisine_types, 
                allergies
            };

            const editedUsername = await User.findByIdAndUpdate(user._id, updatedData, { new: true });

            res.status(200).json({ 
                message: 'Updated successfully',
                name_title: editedUsername.name_title,
                last_name: editedUsername.last_name,
                username: editedUsername.username
            });
        }

    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err.message });
    }
});

exports.delete_user = asyncHandler(async (req, res, next) => {
    const { username } = req.params;

    try {
        await User.deleteOne({ username: username });

        res.status(204).json({ message: 'Successfully deleted' });

    } catch (err) {
        console.log(err);
        res.status(404).json({ error: 'Unable to delete account' });
    }
});