/**
 * userController component
 * 
 * This component handles all user features such as signin up and signing in, retrieving user details and be able to edit them, 
 * delete account, restore a forgotten password, send an email message.
 * 
 */

const User = require('../models/userModel');
const Recipe = require('../models/recipeModel');
const Ingredient = require('../models/ingredientModel');
const Group = require('../models/groupModel');
const Book = require('../models/bookModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { groupEnd } = require('console');

require('dotenv').config();

const createArray = (selected_input, optional_input) => {
    let array = [];

    if (selected_input && selected_input.length !== 0 && selected_input !== null) {
        array = selected_input;
    }

    if (optional_input && optional_input !== "" && optional_input !== null) {
        const optional_input_array = optional_input.split(',').map(item => item.trim());
        array = [...array, ...optional_input_array];
    }

    return array;
};

exports.add_user = asyncHandler(async (req, res, next) => {
    try {
        const { name_title, first_name, last_name, username, email, dietary_preferences, preferred_categories, 
                preferred_cuisine_types, allergies, other_diets, other_categories, other_cuisine_types, other_allergies, test } = req.body;

        const user = await User.findOne({ username: username }).lean();

        if (!name_title || !first_name || !last_name || !username || !email || !req.body.password) {
            return res.status(400).json({ error: 'All fields must be filled' });
        }

        if (user) {
            return res.status(400).json({ error: 'Username is already taken' });
        } else {
            let password = req.body.password;

            const allDiets = createArray(dietary_preferences, other_diets);

            const allCategories = createArray(preferred_categories, other_categories);

            const allCuisineTypes = createArray(preferred_cuisine_types, other_cuisine_types);

            const allAllergens = createArray(allergies, other_allergies);

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
                        dietary_preferences: allDiets,
                        preferred_categories: allCategories,
                        preferred_cuisine_types: allCuisineTypes,
                        allergies: allAllergens,
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
                        process.env.SECRET_KEY, 
                        { expiresIn: '1h' }
                    );
                    res.status(200).json({ token });
                }
            });
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
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
            process.env.SECRET_KEY, 
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

    const { name_title, first_name, last_name, email, dietary_preferences, preferred_categories, 
            preferred_cuisine_types, allergies, other_diets, other_categories, other_cuisine_types, other_allergies, test } = req.body;

    try {
        const user = await User.findOne({ username: username }).lean();

        const foundUsername = await User.findOne({ username: req.body.username }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        } 
        
        if (foundUsername && (user.username !== foundUsername.username)) {
            return res.status(404).json({ error: 'Username is already taken' });
        } 

        const allDiets = createArray(dietary_preferences, other_diets);

        const allCategories = createArray(preferred_categories, other_categories);

        const allCuisineTypes = createArray(preferred_cuisine_types, other_cuisine_types);

        const allAllergens = createArray(allergies, other_allergies);

        let updatedData = {
            name_title,
            first_name,
            last_name,
            username: req.body.username,
            email: email,
            dietary_preferences: allDiets,
            preferred_categories: allCategories, 
            preferred_cuisine_types: allCuisineTypes, 
            allergies: allAllergens,
            test
        };

        const editedUser = await User.findByIdAndUpdate(user._id, updatedData, { new: true }).lean();

        const token = 
            jwt.sign({ 
                id: editedUser._id, 
                username: editedUser.username, 
                name_title: editedUser.name_title,
                last_name: editedUser.last_name 
            },
            process.env.SECRET_KEY, 
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
        const user = await User.findOne({ username: username }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const groups = await Group.find({ user_id: user._id }).lean();
        const preservedRecipes = new Set();

        let newAdminId = "";

        if (groups.length > 0) {
            for (let group of groups) {
                let newAdmin;

                if (group.admins.length > 0) {
                    newAdmin = group.admins[Math.floor(Math.random() * group.admins.length)];

                    await Group.updateOne(
                        { _id: group._id },
                        { $pull: { admins: newAdmin } }
                    );

                } else if (group.collaborators.length > 0) {
                    newAdmin = group.collaborators[Math.floor(Math.random() * group.collaborators.length)];

                    await Group.updateOne(
                        { _id: group._id },
                        { $pull: { collaborators: newAdmin } }
                    );
                }

                const newAdminUser = await User.findOne({ username: newAdmin }).lean();
                newAdminId = newAdminUser._id;

                if (newAdmin) {
                    await Group.updateOne(
                        { _id: group._id },
                        { $set: { user_id: newAdminUser._id }}
                    );

                    const books = await Book.find({ group_id: group._id });

                    for (let book of books) {
                        book.recipes_id.forEach(recipeId => preservedRecipes.add(recipeId.toString()));
                    }

                } else if (group.admins.length === 0 && group.collaborators.length === 0) {
                    await Book.deleteMany({ group_id: group._id });
                    await Group.deleteOne({ _id: group._id });
                }
            }
        }

        const recipes = await Recipe.find({ user_id: user._id }).lean();

        for (let recipe of recipes) {
            if (!preservedRecipes.has(recipe._id.toString())) {
                await Ingredient.deleteMany({ recipe_id: recipe._id });
                await Recipe.deleteOne({ _id: recipe._id });
            } else {
                await Recipe.updateOne(
                    { _id: recipe._id },
                    { $set: { user_id: newAdminId }}
                );
            }
        }

        await User.deleteOne({ username: username });

        res.status(200).json({ message: 'Successfully deleted' });

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

exports.direct_message = asyncHandler(async (req, res, next) => {
    const { username, recipient_username, subject, message } = req.body;

    try {
        const sender = await User.findOne({ username: username }).lean();

        if (!sender) {
            return res.status(404).json({ error: 'Sender with that username not found' });
        }

        const recipient = await User.findOne({ username: recipient_username });

        if (!recipient) {
            return res.status(404).json({ error: 'Recipient with that username not found' });
        }

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.USER,
                pass: process.env.PASSWORD
            }
        });

        let resultMessage = `Hello ${recipient.name_title} ${recipient.last_name},\n\n`;
        resultMessage += `This email is from ${sender.username}.\n\n`;
        resultMessage += `${message}\n\n`;
        resultMessage += `Regards,\n${sender.name_title} ${sender.last_name}\n\n`;
        resultMessage += 'Replying to this email will automatically reply to the sender\'s email address';

        let mailOptions = {
            from: process.env.USER,
            to: recipient.email,
            subject: subject,
            text: resultMessage,
            replyTo: sender.email
        }

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ error: 'Error sending email' });
            } else {
                console.log('Email sent: ', info.response);
            }

            res.status(200).json({ message: 'Email sent successfully. You may leave this page' });
        });

    } catch (error) {
        res.status(400).json({ error: error });
    }
});