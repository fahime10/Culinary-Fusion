const Recipe = require("../models/recipeModel");
const User = require('../models/userModel');
const Ingredient = require('../models/ingredientModel');
const asyncHandler = require("express-async-handler");
const multer = require("multer");
const { index } = require("./indexController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.upload = upload.single('image');

const makeDistinct = (collection) => {
    const distinctItems = [];
    const seenIds = new Set();

    for (const item of collection) {
        if (!seenIds.has(item._id.toString())) {
            seenIds.add(item._id.toString());
            distinctItems.push(item);
        }
    }

    return distinctItems;
}

const convertToObjects = (collection) => {
    const objects = collection.map(item => {
        const itemObj = item.toObject();
        if (item.image) {
            itemObj.image = item.image.toString('base64');
        }
        return itemObj;
    });

    return objects;
}

exports.add_recipe = asyncHandler(async (req, res, next) => {
    try {
        const { title, chef, username, description, isPrivate, quantities, ingredients, steps, categories, cuisine_types, allergens, test } = req.body;
        
        let image = null;
        if (req.file && req.file.buffer) {
            image = req.file.buffer;
        }

        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user_id = user._id;

        let newIngredients = JSON.parse(ingredients);

        let newCategories = [];
        if (categories) {
            newCategories = JSON.parse(categories);
        }

        let newCuisineTypes = [];
        if (cuisine_types) {
            newCuisineTypes = JSON.parse(cuisine_types);
        }

        let newAllergens = [];
        if (allergens) {
            newAllergens = JSON.parse(allergens);
        }

        const newRecipe = new Recipe({
            user_id,
            title,
            image,
            chef,
            private: isPrivate,
            description,
            quantities: JSON.parse(quantities),
            ingredients: newIngredients,
            steps: JSON.parse(steps),
            categories: newCategories,
            cuisine_types: newCuisineTypes,
            allergens: newAllergens,
            timestamp: new Date(),
            stars: 0,
            test
        });

        const saveRecipe = await newRecipe.save();

        const recipeObj = saveRecipe.toObject();
        if (recipeObj.image) {
            recipeObj.image = recipeObj.image.toString('base64');
        }

        for (let ingredient of newIngredients) {
            const newIngredient = await Ingredient({
                recipe_id: saveRecipe._id,
                ingredient: ingredient,
                test: test
            });
            await newIngredient.save();
        }
        
        res.status(200).json(recipeObj);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


exports.recipes_get_all = asyncHandler(async (req, res, next) => {
    try {
        const allRecipes = await Recipe.find({ private: false }).exec();

        const result = convertToObjects(allRecipes);

        res.status(200).json(result);

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
            console.log(user);
            return res.status(404).json({ error: 'User not found' });
        }

        const publicRecipes = await Recipe.find({ private: false });
        const userRecipes = await Recipe.find({ user_id: user._id });

        const recipes = [...publicRecipes, ...userRecipes];

        const distinctRecipes = makeDistinct(recipes);

        const result = convertToObjects(distinctRecipes);

        res.status(200).json(result);

    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

exports.recipe_delete = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    try {
        const recipe = await Recipe.findById(id);

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        await Ingredient.deleteMany({ recipe_id: id });

        await Recipe.findByIdAndDelete(id);

        res.status(204).json({ message: 'Recipe deleted successfully' });;
        
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

        if (user) {
            if (user._id.toString() === recipe.user_id.toString()) {
                res.status(200).json({ recipe: recipeObj, owner: true });
            } else {
                res.status(200).json({ recipe: recipeObj, owner: false });
            }
        } else {
            res.status(200).json({ recipe: recipeObj, owner: false });
        }

    } catch (err) {
        console.log(err);
        res.status(404);
    }
});

exports.recipe_edit = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, chef, username, description, isPrivate, quantities, ingredients, steps, categories, cuisine_types, allergens } = req.body;

        let image = null;
        if (req.file && req.file.buffer) {
            image = req.file.buffer;
        }

        let newCategories = [];
        if (categories) {
            newCategories = JSON.parse(categories);
        }

        let newCuisineTypes = [];
        if (cuisine_types) {
            newCuisineTypes = JSON.parse(cuisine_types);
        }

        let newAllergens = [];
        if (allergens) {
            newAllergens = JSON.parse(allergens);
        }

        const updatedData = {
            title,
            chef,
            private: isPrivate,
            description,
            quantities: JSON.parse(quantities),
            ingredients: JSON.parse(ingredients),
            steps: JSON.parse(steps),
            categories: newCategories,
            cuisine_types: newCuisineTypes,
            allergens: newAllergens
        };

        if (image) {
            updatedData.image = image;
        }

        const editedRecipe = await Recipe.findByIdAndUpdate(id, updatedData, { new: true });

        const recipeObj = editedRecipe.toObject();
        if (recipeObj.image) {
            recipeObj.image = recipeObj.image.toString('base64');
        }

        if (!editedRecipe) {
            return res.status(404).json({ err: 'Something went wrong' });
        }

        res.status(200).json(recipeObj);

    } catch (err) {
        console.log(err);
        res.status(404).json({ err: err.message });
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

        const byIngredients = await Ingredient.find({ ingredient: new RegExp(search, 'i') }).populate('recipe_id');

        let ingredientRecipes = [];
        if (byIngredients.length > 0) {
            ingredientRecipes = byIngredients.map(ingredient => ingredient.recipe_id).filter(recipe => !recipe.private);
        }

        let userRecipesByTitle = [];
        let userRecipesByIngredients = [];

        if (user) {
            userRecipesByTitle = await Recipe.find({ user_id: user._id, title: new RegExp(search, 'i') });
            
            userRecipesByIngredients = byIngredients
                .map(ingredient => ingredient.recipe_id)
                .filter(recipe => recipe && recipe.user_id.toString() === user._id.toString() && recipe.private === true);
        }

        const recipes = [...publicRecipes, ...ingredientRecipes, ...userRecipesByTitle, ...userRecipesByIngredients];

        if (!recipes) {
            return;
        }

        const distinctRecipes = makeDistinct(recipes);

        const result = convertToObjects(distinctRecipes);

        res.status(200).json(result);

    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

exports.filter_recipes = asyncHandler(async (req, res, next) => {
    const { username, categories, cuisine_types } = req.body;

    try {
        let filterConditions = { private: false };

        if (categories.length > 0) {
            filterConditions.categories = { $in: categories };
        }

        if (cuisine_types.length > 0) {
            filterConditions.cuisine_types = { $in: cuisine_types };
        }

        let recipes = await Recipe.find(filterConditions);

        if (username) {
            const user = await User.findOne({ username: username });

            if (user) {
                const userFilter = {
                    ...filterConditions,
                    user_id: user._id
                };

                const userRecipes = await Recipe.find(userFilter);

                recipes = [...recipes, ...userRecipes];
            }
        }

        const distinctRecipes = makeDistinct(recipes);

        const result = convertToObjects(distinctRecipes);

        res.status(200).json({ recipes: result, status: 200 });

    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err.message });
    }
});

exports.personal_recipes = asyncHandler(async (req, res, next) => {
    const { username } = req.params;
    
    try {
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userRecipes = await Recipe.find({ user_id: user._id });

        const result = convertToObjects(userRecipes);

        res.status(200).json(result);

    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err.message });
    }
});