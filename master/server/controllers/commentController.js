const Comment = require('../models/commentModel');
const User = require('../models/userModel');
const Recipe = require('../models/recipeModel');
const asyncHandler = require('express-async-handler');

exports.get_comments = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { comments } = req.body;

    try {
        let newComments = await Comment.find({
            recipe_id: id,
            _id: { $nin: comments || [] }
        })
        .populate('user_id', 'username')
        .lean()
        .limit(10);

        let limit = newComments.length < 10;

        let previousComments = [];
        if (comments && comments.length > 0) {
            previousComments = await Comment.find({
                recipe_id: id, 
                _id: { $in: comments } 
            })
            .populate('user_id', 'username')
            .lean();
        }

        const allComments = [...previousComments, ...newComments];

        res.status(200).json({ allComments: allComments, limit: limit });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.add_comment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id, text, test } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
        }

        const recipe = await Recipe.findOne({ _id: id });

        if (!recipe) {
            res.status(404).json({ error: 'Recipe not found' });
        }

        const newComment = new Comment({
            user_id: user_id,
            recipe_id: id,
            text: text,
            test: test
        });

        const saveComment = await newComment.save();

        let allComments = [];
        allComments = await Comment.find({ recipe_id: id }).populate('user_id', 'username').lean();

        res.status(200).json(allComments);

    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.delete_comment = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        await Comment.deleteOne({ _id: id });

        res.status(200).json({ message: 'Successfully deleted comment' });

    } catch (error) {
        res.status(400).json({ error: error });
    }
});