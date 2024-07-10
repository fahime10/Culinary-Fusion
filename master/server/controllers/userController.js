const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

exports.add_user = asyncHandler(async (req, res, next) => {
    try {
        const { name_title, first_name, last_name, username, dietary_preferences, test } = req.body;

        const user = await User.findOne({ username: username });

        if (user) {
            return res.json({ error: "Username is already taken" });
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
            res.send({ error: "Incorrect credentials" });
            return;
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            res.send({ error: "Incorrect credentials" });
            return;
        }

        res.status(200).send({ username: user.username, name_title: user.name_title, last_name: user.last_name });

    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err.message });
    }
})