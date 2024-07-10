const Recipe = require("../models/recipeModel");
const User = require('../models/userModel');
const asyncHandler = require("express-async-handler");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.upload = upload.single('image');

exports.add_recipe = asyncHandler(async (req, res, next) => {
    try {
        const { title, chef, username, description, private, ingredients, steps, test } = req.body;
        
        let image = null;
        if (req.file.buffer) {
            image = req.file.buffer;
        }

        const user = await User.findOne({ username: username });
        const user_id = user._id;

        const newRecipe = new Recipe({
            user_id,
            title,
            image,
            chef,
            private,
            description,
            ingredients: JSON.parse(ingredients),
            steps: JSON.parse(steps),
            timestamp: new Date(),
            stars: 0,
            test
        });

        const saveRecipe = await newRecipe.save();
        
        res.status(200).json(saveRecipe);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

exports.recipes_get_all = asyncHandler(async (req, res, next) => {
    try {
        const allRecipes = await Recipe.find({ private: false }).exec();

        // Retrieve all Base64 images from each record
        const Base64Images = allRecipes.map(recipe => {
            const recipeObj = recipe.toObject();
            recipeObj.image = recipe.image.toString('base64');
            return recipeObj;
        });

        res.status(200).json(Base64Images);

    } catch (err) {
        res.status(400).json({ error: 'Something went wrong' });
        console.log(err);
    }
});

exports.recipe_get_own = asyncHandler(async (req, res, next) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const publicRecipes = await Recipe.find({ private: false });
        const userRecipes = await Recipe.find({ user_id: user._id });

        const recipes = [...publicRecipes, ...userRecipes];

        const distinctRecipes = [];
        const seenIds = new Set();

        for (const recipe of recipes) {
            if (!seenIds.has(recipe._id.toString())) {
                seenIds.add(recipe._id.toString());
                distinctRecipes.push(recipe);
            }
        }

        const Base64Images = distinctRecipes.map(recipe => {
            const recipeObj = recipe.toObject();
            recipeObj.image = recipe.image.toString('base64');
            return recipeObj;
        });

        res.status(200).json(Base64Images);

    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

exports.recipe_delete = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    try {
        await Recipe.findByIdAndDelete(id);

        res.sendStatus(204);
        
    } catch (err) {
        console.log(err);
    }
});

exports.get_recipe = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { username } = req.body;

    try {
        const recipe = await Recipe.findById(id).exec();

        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found" });
        }

        const recipeObj = recipe.toObject();
        if (recipe.image) {
            recipeObj.image = recipe.image.toString('base64');
        }

        const user = await User.findOne({ username: username });

        if (user._id.toString() === recipe.user_id.toString()) {
            res.status(200).json({ recipe: recipeObj, owner: true });
        } else {
            res.status(200).json({ recipe: recipeObj, owner: false });
        }

    } catch (err) {
        console.log(err);
    }
});

exports.recipe_edit = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, chef, description, ingredients, steps } = req.body;

        let image = null;
        if (req.file && req.file.buffer) {
            image = req.file.buffer;
        }

        const updatedData = {
            title,
            chef,
            description,
            ingredients: JSON.parse(ingredients),
            steps: JSON.parse(steps)
        };

        if (image) {
            updatedData.image = image;
        }

        const editedRecipe = await Recipe.findByIdAndUpdate(id, updatedData, { new: true });

        if (!editedRecipe) {
            return res.status(404).json({ err: 'Something went wrong' });
        }

        res.status(200).json(editedRecipe);

    } catch (err) {
        console.log(err);
    }
});

exports.search_recipe = asyncHandler(async (req, res, next) => {
    try {
        const { search } = req.params;

        const { username, last_name, name_title } = req.body;

        let user = null;
        if (username && last_name && name_title) {
            user = await User.findOne({ name_title: name_title, last_name: last_name, username: username });
        }

        const publicRecipes = await Recipe.find({ title: new RegExp(search, 'i'), private: false });

        let userRecipes = [];
        if (user) {
            userRecipes = await Recipe.find({ user_id: user._id, title: new RegExp(search, 'i') });
        }

        const recipes = [...publicRecipes, ...userRecipes];

        if (!recipes) {
            return;
        }

        const distinctRecipes = [];
        const seenIds = new Set();

        for (const recipe of recipes) {
            if (!seenIds.has(recipe._id.toString())) {
                seenIds.add(recipe._id.toString());
                distinctRecipes.push(recipe);
            }
        }

        const Base64Images = distinctRecipes.map(recipe => {
            const recipeObj = recipe.toObject();
            recipeObj.image = recipe.image.toString('base64');
            return recipeObj;
        });

        res.status(200).json(Base64Images);

    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});