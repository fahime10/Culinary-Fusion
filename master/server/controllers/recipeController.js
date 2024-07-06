const Recipe = require("../models/recipeModel");
const asyncHandler = require("express-async-handler");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.upload = upload.single('image');

exports.add_recipe = asyncHandler(async (req, res, next) => {
    try {
        const { title, chef, description, ingredients, steps, test } = req.body;
        const image = req.file.buffer;

        const newRecipe = new Recipe({
            title,
            image,
            chef,
            description,
            ingredients: JSON.parse(ingredients),
            steps: JSON.parse(steps),
            stars: 0,
            timestamp: new Date(),
            test
        });

        const saveRecipe = await newRecipe.save();
        
        res.status(200).json(saveRecipe);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

exports.recipes_get = asyncHandler(async (req, res, next) => {
    try {
        const allRecipes = await Recipe.find().exec();

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

    try {
        const recipe = await Recipe.findById(id).exec();

        const recipeObj = recipe.toObject();
        recipeObj.image = recipe.image.toString('base64');

        res.status(200).json(recipeObj);

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
})