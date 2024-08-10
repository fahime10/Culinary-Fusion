const Recipe = require('../models/recipeModel');
const User = require('../models/userModel');
const Ingredient = require('../models/ingredientModel');
const Star = require('../models/starModel');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const mongoose = require('mongoose');

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
        if (item.image && Buffer.isBuffer(item.image)) {
            item.image = item.image.toString('base64');
        }
        return item;
    });

    return objects;
}

const recommendedRecipes = async (recipes, user) => {
    const recipe_ids = recipes.map(recipe => recipe._id);

    const allRatings = await Star.find({ recipe_id: { $in: recipe_ids }}).lean();

    const positiveRatings = allRatings.filter(rating => rating.stars > 2);

    const preferredCategories = new Set();
    const preferredCuisineTypes = new Set();

    const userDietaryPreferences = new Set(user.dietary_preferences);
    const userPreferredCategories = new Set(user.preferred_categories);
    const userPreferredCuisineTypes = new Set(user.preferred_cuisine_types);

    positiveRatings.forEach(rating => {
        const recipe = recipes.find(recipe => recipe._id.equals(rating.recipe_id));

        if (recipe) {
            recipe.categories.forEach(category => preferredCategories.add(category));
            recipe.cuisine_types.forEach(cuisine_type => preferredCuisineTypes.add(cuisine_type));
        }
    });

    // List popular recipes that the user might be interested in, and take into account the diet and
    // allergies
    const filterPositiveRecipes = recipes.filter(recipe => {
        const diet = recipe.diet.length === 0 || user.dietary_preferences.length === 0 || recipe.diet.some(type_of_diet => userDietaryPreferences.has(type_of_diet));
        const noAllergies = !user.allergies.some(allergy => recipe.allergens.includes(allergy));

        return noAllergies && diet;
    });

    // Filter recipes by matching the preferred categories and cuisine types, as well as removing any recipes
    // that the user may be allergic to and take into account the type of diet
    const filterRecipes = recipes.filter(recipe => {
        const dietMatch = recipe.diet.length === 0 || user.dietary_preferences.length === 0 || recipe.diet.some(type_of_diet => userDietaryPreferences.has(type_of_diet));
        const categoriesMatch = recipe.categories.some(category => userPreferredCategories.has(category) || preferredCategories.has(category));
        const cuisineTypesMatch = recipe.cuisine_types.some(cuisine_type => userPreferredCuisineTypes.has(cuisine_type) || preferredCuisineTypes.has(cuisine_type));
        const noAllergies = !user.allergies.some(allergy => recipe.allergens.includes(allergy));

        return (categoriesMatch || cuisineTypesMatch) && noAllergies && dietMatch;
    });

    let randomRecipes = [];
    let randomPositiveRecipes = [];
    let result = [];
    
    if (filterRecipes.length === 0 && filterPositiveRecipes.length === 0) {
        randomRecipes = randomizeRecipes(recipes, 20);
        result.push(...randomRecipes);
    } else {
        let pickedRecipes = [...filterRecipes, ...filterPositiveRecipes];
        let distinctRecipes = makeDistinct(pickedRecipes);
        randomPositiveRecipes = randomizeRecipes(distinctRecipes, 20);
        result.push(...randomPositiveRecipes);
    }

    return result;
}

// Simpler variation of the Fisher-Yates Shuffle algorithm
const randomizeRecipes = (recipes, count) => {
    const result = [];

    while (result.length < count && recipes.length > 0) {
        const randomIndex = Math.floor(Math.random() * recipes.length);
        result.push(recipes.splice(randomIndex, 1)[0]);
    }

    return result;
}

exports.add_recipe = asyncHandler(async (req, res, next) => {
    try {
        const { 
            title, chef, username, description, isPrivate, quantities, 
            ingredients, steps, diet, categories, cuisine_types, allergens, test 
        } = req.body;
        
        let image = null;
        if (req.file && req.file.buffer) {
            image = req.file.buffer;
        }

        const user = await User.findOne({ username: username }).lean();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user_id = user._id;

        let newIngredients = JSON.parse(ingredients);

        let newDiet = [];
        if (diet) {
            newDiet = JSON.parse(diet);
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
            diet: newDiet,
            categories: newCategories,
            cuisine_types: newCuisineTypes,
            allergens: newAllergens,
            timestamp: new Date(),
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
    const { cache } = req.body;

    try {
        let allRecipes;

        const match = { private: false };
        if (cache.length !== 0) {
            const cacheObjectIds = cache
                .filter(id => mongoose.Types.ObjectId.isValid(id))
                .map(id => new mongoose.Types.ObjectId(id));
            
            match._id = { $nin: cacheObjectIds };
        }

        allRecipes = await Recipe.aggregate([
            { $match: match },
            { $sort: { timestamp: -1 }},
            { $sample: { size: 100 }}
        ]);

        const recipeIds = allRecipes.map(recipe => recipe._id);
        const recipesWithUser = await Recipe.find({ _id: { $in: recipeIds } })
            .populate('user_id', 'username')
            .lean();
        
        const randomRecipes = randomizeRecipes(recipesWithUser, 20);

        const recipeObjects = await convertToObjects(randomRecipes);

        const result = recipeObjects.map(recipe => ({
            ...recipe,
            chef_username: recipe.user_id.username
        }));

        let limit = false;
        if (result.length < 20) {
            limit = true;
        }

        res.status(200).json({ result: result, limit: limit });

    } catch (err) {
        res.status(400).json({ error: 'Something went wrong' });
    }
});

exports.recipe_get_all_recipes_signed_in = asyncHandler(async (req, res, next) => {
    const { username } = req.params;
    const { cache } = req.body;

    try {
        const user = await User.findOne({ username: username }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const match = { private: false };
        if (cache.length !== 0) {
            const cacheObjectIds = cache
                .filter(id => mongoose.Types.ObjectId.isValid(id))
                .map(id => new mongoose.Types.ObjectId(id));
            
            match._id = { $nin: cacheObjectIds };
        }

        let allRecipes = await Recipe.aggregate([
            { $match: match },
            { $sort: { timestamp: -1 }},
            { $sample: { size: 100 }}
        ]);

        const recipeIds = allRecipes.map(recipe => recipe._id);
        const recipesWithUser = await Recipe.find({ _id: { $in: recipeIds } })
            .populate('user_id', 'username')
            .lean();

        const recommended = await recommendedRecipes(recipesWithUser, user);

        const recipeObjects = await convertToObjects(recommended);

        const result = recipeObjects.map(recipe => ({
            ...recipe,
            chef_username: recipe.user_id.username
        }));

        let limit = false;
        if (result.length < 20) {
            limit = true;
        }

        res.status(200).json({ result: result, limit: limit });

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message });
    }
});

exports.recipe_delete = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    try {
        const recipe = await Recipe.findById(id).lean();

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        await Ingredient.deleteMany({ recipe_id: id });

        await Recipe.findByIdAndDelete(id);

        res.status(204).json({ message: 'Recipe deleted successfully' });
        
    } catch (err) {
        console.log(err);
    }
});

exports.get_recipe = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { username } = req.body;

    try {
        const recipe = await Recipe.findById(id).populate('user_id', 'username').lean();

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        if (recipe.image && Buffer.isBuffer(recipe.image)) {
            recipe.image = recipe.image.toString('base64');
        }

        const user = await User.findOne({ username: username }).lean();

        if (user) {
            if (user.username === recipe.user_id.username) {
                res.status(200).json({ recipe: recipe, owner: true, chef_username: recipe.user_id.username });
            } else {
                res.status(200).json({ recipe: recipe, owner: false, chef_username: recipe.user_id.username });
            }
        } else {
            res.status(200).json({ recipe: recipe, owner: false, chef_username: recipe.user_id.username });
        }

    } catch (err) {
        console.log(err);
        res.status(404);
    }
});

exports.recipe_edit = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;
        const { 
            title, chef, description, isPrivate, quantities, 
            ingredients, steps, diet, categories, cuisine_types, allergens } = req.body;

        let image = null;
        if (req.file && req.file.buffer) {
            image = req.file.buffer;
        }

        let newDiet = [];
        if (diet) {
            newDiet = JSON.parse(diet);
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
            diet: newDiet,
            categories: newCategories,
            cuisine_types: newCuisineTypes,
            allergens: newAllergens
        };

        if (image) {
            updatedData.image = image;
        }

        const editedRecipe = await Recipe.findByIdAndUpdate(id, updatedData, { new: true }).lean();

        if (editedRecipe.image && Buffer.isBuffer(editedRecipe.image)) {
            editedRecipe.image = editedRecipe.image.toString('base64');
        }

        if (!editedRecipe) {
            return res.status(404).json({ err: 'Something went wrong' });
        }

        res.status(200).json(editedRecipe);

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
            user = await User.findOne({ name_title: name_title, last_name: last_name, username: username }).lean();
        }

        const publicRecipes = await Recipe.find({ title: new RegExp(search, 'i'), private: false }).lean();

        const byIngredients = await Ingredient.find({ ingredient: new RegExp(search, 'i') }).populate('recipe_id').lean();

        let ingredientRecipes = [];
        if (byIngredients.length > 0) {
            ingredientRecipes = byIngredients.map(ingredient => ingredient.recipe_id).filter(recipe => !recipe.private);
        }

        let userRecipesByTitle = [];
        let userRecipesByIngredients = [];

        if (user) {
            userRecipesByTitle = await Recipe.find({ user_id: user._id, title: new RegExp(search, 'i') }).lean();
            
            userRecipesByIngredients = byIngredients
                .map(ingredient => ingredient.recipe_id)
                .filter(recipe => recipe && recipe.user_id.toString() === user._id.toString() && recipe.private === true);
        }

        const recipes = [...publicRecipes, ...ingredientRecipes, ...userRecipesByTitle, ...userRecipesByIngredients];

        if (!recipes) {
            return;
        }

        const distinctRecipes = makeDistinct(recipes);

        const result = await convertToObjects(distinctRecipes);

        const randomRecipes = randomizeRecipes(result, 20);

        res.status(200).json(randomRecipes);

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

        let recipes = await Recipe.find(filterConditions).lean();

        if (username) {
            const user = await User.findOne({ username: username }).lean();

            if (user) {
                const userFilter = {
                    ...filterConditions,
                    user_id: user._id
                };

                const userRecipes = await Recipe.find(userFilter).lean();

                recipes = [...recipes, ...userRecipes];
            }
        }

        const distinctRecipes = makeDistinct(recipes);

        const result = await convertToObjects(distinctRecipes);

        res.status(200).json({ recipes: result, status: 200 });

    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err.message });
    }
});

exports.personal_recipes = asyncHandler(async (req, res, next) => {
    const { username } = req.params;
    
    try {
        const user = await User.findOne({ username: username }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userRecipes = await Recipe.find({ user_id: user._id }).lean();

        const result = await convertToObjects(userRecipes);

        res.status(200).json(result);

    } catch (err) {
        console.log(err);
        res.status(404).json({ error: err.message });
    }
});