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
        
        console.log("Received data: ", { title, chef, description, ingredients, steps, image });

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