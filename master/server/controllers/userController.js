const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

exports.add_user = asyncHandler(async (req, res, next) => {
    try {
        const { name_title, first_name, last_name, username, email, dietary_preferences, preferred_categories, 
                preferred_cuisine_types, allergies, test } = req.body;

        const user = await User.findOne({ username: username }).lean();

        if (!name_title || !first_name || !last_name || !username || !email || !req.body.password) {
            return res.status(400).json({ error: 'All fields must be filled' });
        }

        if (user) {
            return res.status(400).json({ error: 'Username is already taken' });
        } else {
            let password = req.body.password;

            bcrypt.hash(password, 10, async (err, hashedPassword) => {
                if (err) {
                    return res.status(500);
                } else {
                    const newUser = new User({
                        name_title,
                        first_name,
                        last_name,
                        username,
                        password: hashedPassword,
                        email: email,
                        passcode: "",
                        dietary_preferences,
                        preferred_categories,
                        preferred_cuisine_types,
                        allergies,
                        test
                    });

                    const savedUser = await newUser.save();

                    const token = 
                        jwt.sign({ 
                            id: savedUser._id, 
                            username: savedUser.username, 
                            name_title: savedUser.name_title,
                            last_name: savedUser.last_name 
                        }, 
                        SECRET_KEY, 
                        { expiresIn: '1h' }
                    );
                    res.status(200).json({ token });
                }
            });
        }

    } catch (error) {
        res.status(404).json({ error: error });
    }
});

exports.login_user = asyncHandler(async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username: username }).lean();

        if (!user) {
            res.status(401).send({ error: 'Incorrect credentials' });
            return;
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            res.status(401).send({ error: 'Incorrect credentials' });
            return;
        }

        const token = 
            jwt.sign({ 
                id: user._id, 
                username: user.username, 
                name_title: user.name_title,
                last_name: user.last_name 
            },
            SECRET_KEY, 
            { expiresIn: '1h' }
        );
        res.status(200).send({ token: token });

    } catch (error) {
        res.status(404).json({ error: error });
    }
});

exports.user_details = asyncHandler(async (req, res, next) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username: username }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ 
            name_title: user.name_title, 
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            dietary_preferences: user.dietary_preferences,
            preferred_categories: user.preferred_categories,
            preferred_cuisine_types: user.preferred_cuisine_types,
            allergies: user.allergies
        });

    } catch (error) {
        res.status(404).json({ error: error });
    }
});

exports.edit_user = asyncHandler(async (req, res, next) => {
    const { username } = req.params;

    const { name_title, first_name, last_name, email, dietary_preferences, 
            preferred_categories, preferred_cuisine_types, allergies } = req.body;

    try {
        const user = await User.findOne({ username: username }).lean();

        const foundUsername = await User.findOne({ username: req.body.username }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        } 
        
        if (foundUsername && (user.username !== foundUsername.username)) {
            return res.status(404).json({ error: 'Username is already taken' });
        } 

        let updatedData = {
            name_title,
            first_name,
            last_name,
            username: req.body.username,
            email: email,
            dietary_preferences,
            preferred_categories, 
            preferred_cuisine_types, 
            allergies
        };

        const editedUser = await User.findByIdAndUpdate(user._id, updatedData, { new: true }).lean();

        const token = 
            jwt.sign({ 
                id: editedUser._id, 
                username: editedUser.username, 
                name_title: editedUser.name_title,
                last_name: editedUser.last_name 
            },
            SECRET_KEY, 
            { expiresIn: '1h' }
        );

        res.status(200).send({ message: 'Updated successfully' , token: token });

    } catch (error) {
        res.status(404).json({ error: error });
    }
});

exports.delete_user = asyncHandler(async (req, res, next) => {
    const { username } = req.params;

    try {
        await User.deleteOne({ username: username });

        res.status(204).json({ message: 'Successfully deleted' });

    } catch (error) {
        res.status(404).json({ error: 'Unable to delete account' });
    }
});

exports.forgotten_password = asyncHandler(async (req, res, next) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username: username }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User with that username not found' });
        }

        const emailAddress = user.email;
        const generatedPasscode = crypto.randomBytes(3).toString('hex');

        const updatedUser = {
            passcode: generatedPasscode
        }

        const update = await User.findByIdAndUpdate(user._id, updatedUser, { new: true });

        if (update) {
            let transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.USER,
                    pass: process.env.PASSWORD
                }
            });
    
            let mailOptions = {
                from: process.env.USER,
                to: emailAddress,
                subject: 'Culinary Fusion Password Reset',
                text: `Please use this passcode ${generatedPasscode} when attempting to change the password.\n\nThanks,\nThe Culinary Fusion Team`
            }

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ error: 'Error sending email' });
                } else {
                    console.log('Email sent: ', info.response);
                }

                res.status(200).json({ sent: true });
            });
        }

    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.forgotten_password_restore = asyncHandler(async (req, res, next) => {
    const { username, passcode, new_password } = req.body;

    try {
        const user = await User.findOne({ username: username }).lean();

        if (!user) {
            return res.status(401).send({ error: 'User not found' });
        }

        if (passcode === user.passcode) {
            bcrypt.hash(new_password, 10, async (err, hashedPassword) => {
                if (err) {
                    res.status(500);
                    return;
                } else {
                    const updatedData = {
                        password: hashedPassword,
                        passcode: ''
                    };
    
                    await User.findByIdAndUpdate(user._id, updatedData, { new: true }).lean();
    
                    res.status(200).json({ message: 'Password updated' });
                }
            });
        } else {
            return res.status(401).json({ error: 'Passcode does not match' });
        }

    } catch (error) {
        res.status(404).json({ error: error });
    }
});