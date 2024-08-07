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