const Book = require('../models/bookModel');
const Recipe = require('../models/recipeModel');
const Group = require('../models/groupModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

exports.get_all_books = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundGroup = await Group.findOne({ _id: id });

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const allBooks = await Book.find({ group_id: foundGroup._id });

        res.status(200).json(allBooks);

    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.create_book = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id, book_title, book_description, test } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newBook = new Book({
            book_title: book_title,
            book_description: book_description,
            group_id: id,
            recipes_id: [],
            test
        });

        const saveBook = await newBook.save();

        res.status(200).json(saveBook);

    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.get_book = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id } = req.body;

    try {
        const user = await User.findOne({ _id: user_id }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const book = await Book.findOne({ _id: id }).lean();

        const foundGroup = await Group.findOne({ _id: book.group_id }).lean();

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

        const recipeIds = book.recipes_id || [];

        const recipes = await Promise.all(
            recipeIds.map(async (recipeId) => {
                return await Recipe.findOne({ _id: recipeId }).lean();
            })
        );

        res.status(200).json({
            book: book,
            recipes: recipes,
            is_main_admin: isMainAdmin, 
            is_admin: isAdmin, 
            is_collaborator: isCollaborator 
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.edit_book = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id, book_title, book_description, test } = req.body;

    try {
        const user = await User.findOne({ _id: user_id }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const book = await Book.findOne({ _id: id }).lean();

        const foundGroup = await Group.findOne({ _id: book.group_id }).lean();

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        let isMainAdmin = false;
        let isAdmin = false;

        if (foundGroup.user_id._id.toString() === user._id.toString()) {
            isMainAdmin = true;
        } else if (foundGroup.admins && foundGroup.admins.includes(user.username)) {
            isAdmin = true;
        }

        if (isMainAdmin || isAdmin) {
            const updatedData = {
                book_title: book_title,
                book_description: book_description,
                test: test
            };

            const editedBook = await Book.findByIdAndUpdate(id, updatedData, { new: true });

            if (!editedBook) {
                return res.status(404).json({ error: 'Something went wrong' });
            }

            res.status(200).json(editedBook);
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.delete_book = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        await Book.findByIdAndDelete(id);

        res.status(200).json({ message: 'Book deleted successfully' });

    } catch (error) {
        res.status(400).json({ error: error });
    }
});