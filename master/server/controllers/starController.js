const Star = require('../models/starModel');
const User = require('../models/userModel');
const Recipe = require('../models/recipeModel');
const asyncHandler = require('express-async-handler');

exports.add_star_rating = asyncHandler(async (req, res, next) => {
    const { user_id, recipe_id, stars } = req.body;

    try {
        const recipeFound = await Recipe.findOne({ _id: recipe_id });

        if (!recipeFound) {
            res.status(404).json({ message: 'Recipe not found' });
            return;
        }

        const userFound = await User.findOne({ _id: user_id });

        if (!userFound) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const ratingFound = await Star.findOne({ user_id: user_id, recipe_id: recipe_id });

        if (ratingFound) {
            const updatedData = {
                stars: stars
            };

            await Star.findByIdAndUpdate(ratingFound._id, updatedData, { new: true });

        } else {
            const newRating = new Star({
                user_id, 
                recipe_id,
                stars
            });

            await newRating.save();
        }

        const findStars = await Star.find({ recipe_id: recipe_id });

        const starsList = findStars.map(rating => rating.stars);

        const average = starsList.reduce((a, b) => a + b, 0) / starsList.length;

        res.status(200).json(average);

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.rating_average = asyncHandler(async (req, res, next) => {
    const { user_id, recipe_id } = req.body;

    try {
        const findStars = await Star.find({ recipe_id: recipe_id });

        const starsList = findStars.map(rating => rating.stars);

        const average = starsList.reduce((a, b) => a + b, 0) / starsList.length;

        const userRating = await Star.findOne({ user_id: user_id, recipe_id: recipe_id });

        res.status(200).json({ average: average, user_rating: userRating.stars });

    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
});