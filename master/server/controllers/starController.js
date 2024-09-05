/**
 * starController component
 * 
 * This component handles all star features such as adding a rating to a recipe, getting all the ratings to calculate average.
 * 
 */

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
        
        let userRating = await Star.findOne({ user_id: user_id, recipe_id: recipe_id });

        if (!userRating) {
            userRating = 0;
        }

        res.status(200).json({ average: average, user_rating: userRating });

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
        
        let userRating = await Star.findOne({ user_id: user_id, recipe_id: recipe_id });

        if (!userRating) {
            userRating = 0;
        }

        res.status(200).json({ average: average, user_rating: userRating.stars });

    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
});

exports.get_all_ratings = asyncHandler(async (req, res, next) => {
    const { recipe_ids } = req.body;

    if (!recipe_ids) {
        return res.status(400).json({ error: 'Invalid recipe IDs' });
    }

    try {
        const allRatings = await Star.find({ recipe_id: { $in: recipe_ids }});

        const ratingMap = {};
        allRatings.forEach(rating => {
            if (!ratingMap[rating.recipe_id]) {
                ratingMap[rating.recipe_id] = [];
            }
            ratingMap[rating.recipe_id].push(rating.stars);
        });

        const averageRatings = recipe_ids.map(recipe_id => {
            const recipeRatings = ratingMap[recipe_id] || [];
            const average = recipeRatings.length ? recipeRatings.reduce((a, b) => a + b, 0) / recipeRatings.length : 0;
            
            // Return a single tuple
            return { recipe_id, average };
        });

        res.status(200).json(averageRatings);

    } catch (error) {
        console.log(error);
        res.status(404).json(error);
    }
});