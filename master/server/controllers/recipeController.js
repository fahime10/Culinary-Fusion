/**
 * recipeController component
 * 
 * This component handles all recipe features ranging from retrieving recipes, adding, editing and deleting recipes,
 * getting personalized recipes from the recommendation algorithm, recipe filtering by category and cuisine types,
 * saving favourite recipes and viewing them, searching recipes by their title and ingredients, and retrieve recipes
 * by popularity.
 * 
 */

const Recipe = require('../models/recipeModel');
const User = require('../models/userModel');
const Ingredient = require('../models/ingredientModel');
const Star = require('../models/starModel');
const FavouriteRecipe = require('../models/favouriteRecipeModel');
const Comment = require('../models/commentModel');
const Book = require('../models/bookModel');
const asyncHandler = require('express-async-handler');
const multer = require('multer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const validImageTypes = ['image/jpeg', 'image/png'];
    if (validImageTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 }});

exports.upload = upload.single('image');

// Removes duplicate recipes in a collection
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

// Converts the documents into objects. Images are converted into base64 strings
const convertToObjects = (collection) => {
    const objects = collection.map(item => {
        if (item.image && Buffer.isBuffer(item.image)) {
            item.image = item.image.toString('base64');
        }
        return item;
    });

    return objects;
}

// Recommendation algorithm
// The algorithm filters in popular recipes, and filters out any recipes that the user is allergic to or anything that does
// not match the diet of the user.
// User's preferred categories and cuisine types are also considered.
const recommendedRecipes = async (recipes, user) => {
    const recipe_ids = recipes.map(recipe => recipe._id);

    const allRatings = await Star.find({ recipe_id: { $in: recipe_ids }}).lean();

    const positiveRatings = allRatings.filter(rating => rating.stars > 2);

    const preferredCategories = new Set();
    const preferredCuisineTypes = new Set();

    const userDietaryPreferences = new Set(user.dietary_preferences.map(diet => diet.toLowerCase()));
    const userPreferredCategories = new Set(user.preferred_categories.map(category => category.toLowerCase()));
    const userPreferredCuisineTypes = new Set(user.preferred_cuisine_types.map(cuisine => cuisine.toLowerCase()));
    const userAllergies = user.allergies.map(allergy => allergy.toLowerCase());

    positiveRatings.forEach(rating => {
        const recipe = recipes.find(recipe => recipe._id.equals(rating.recipe_id));

        if (recipe) {
            recipe.categories.forEach(category => preferredCategories.add(category.toLowerCase()));
            recipe.cuisine_types.forEach(cuisine_type => preferredCuisineTypes.add(cuisine_type.toLowerCase()));
        }
    });

    // List popular recipes that the user might be interested in, and take into account the diet and
    // allergies
    const filterPositiveRecipes = recipes.filter(recipe => {
        const diet = recipe.diet.length === 0 || user.dietary_preferences.length === 0 || recipe.diet.some(type_of_diet => userDietaryPreferences.has(type_of_diet.toLowerCase()));
        
        const recipeAllergens = recipe.allergens.map(allergen => allergen.toLowerCase());
        const noAllergies = !userAllergies.some(allergy => recipeAllergens.includes(allergy));

        return noAllergies && diet;
    });

    // Filter recipes by matching the preferred categories and cuisine types, as well as removing any recipes
    // that the user may be allergic to and take into account the type of diet
    const filterRecipes = recipes.filter(recipe => {
        const dietMatch = recipe.diet.length === 0 || user.dietary_preferences.length === 0 || recipe.diet.some(type_of_diet => userDietaryPreferences.has(type_of_diet.toLowerCase()));
        const categoriesMatch = recipe.categories.some(category => userPreferredCategories.has(category) || preferredCategories.has(category.toLowerCase()));
        const cuisineTypesMatch = recipe.cuisine_types.some(cuisine_type => userPreferredCuisineTypes.has(cuisine_type) || preferredCuisineTypes.has(cuisine_type.toLowerCase()));
        
        const recipeAllergens = recipe.allergens.map(allergen => allergen.toLowerCase());
        const noAllergies = !userAllergies.some(allergy => recipeAllergens.includes(allergy));

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

// Creates an array, taking values from both checkbox inputs and typed in user inputs
const createArray = (selected_input, optional_input) => {
    let array = [];

    if (selected_input && selected_input.length !== 0 && selected_input !== null) {
        array = JSON.parse(selected_input);
    }

    if (optional_input && optional_input !== "" && optional_input !== null) {
        const optional_input_array = optional_input.split(',').map(item => item.trim());
        array = [...array, ...optional_input_array];
    }

    return array;
};

exports.add_recipe = asyncHandler(async (req, res, next) => {
    try {
        const { 
            title, chef, username, description, isPrivate, quantities, ingredients, steps, diet, categories, 
            cuisine_types, allergens, other_diets, other_categories, other_cuisine_types, other_allergens, test 
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

        const allDiets = createArray(diet, other_diets);

        const allCategories = createArray(categories, other_categories);

        const allCuisineTypes = createArray(cuisine_types, other_cuisine_types);

        const allAllergens = createArray(allergens, other_allergens);

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
            diet: allDiets,
            categories: allCategories,
            cuisine_types: allCuisineTypes,
            allergens: allAllergens,
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

        const result = {
            ...recipeObj,
            chef_username: user.username
        };
        
        res.status(200).json(result);

    } catch (error) {
        return res.status(400).json({ error: error });
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

    } catch (error) {
        return res.status(400).json({ error: 'Something went wrong' });
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

    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.recipe_delete = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorised' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        const recipe = await Recipe.findById(id).lean();

        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        if (recipe.user_id.toString() === decoded.id) {
            await Ingredient.deleteMany({ recipe_id: id });

            await Comment.deleteMany({ recipe_id: id });

            await Star.deleteMany({ recipe_id: id });

            await Recipe.findByIdAndDelete(id);

            res.status(204).json({ message: 'Recipe deleted successfully' });
        } else {
            return res.status(401).json({ error: 'Unauthorised' });
        }
        
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error });
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

    } catch (error) {
        res.status(404).json({ error: error });
    }
});

exports.recipe_edit = asyncHandler(async (req, res, next) => {
    try {
        const { id } = req.params;

        const { 
            title, chef, description, username, isPrivate, quantities, ingredients, steps, diet, categories,
            cuisine_types, allergens, other_diets, other_categories, other_cuisine_types, other_allergens, test } = req.body;

        const user = await User.findOne({ username: username });

        if (!user) {
            console.log("user issue");
            return res.status(404).json({ error: 'User not found' });
        }

        let image = null;
        if (req.file && req.file.buffer) {
            image = req.file.buffer;
        }

        const allIngredients = JSON.parse(ingredients);

        const allDiets = createArray(diet, other_diets);

        const allCategories = createArray(categories, other_categories);

        const allCuisineTypes = createArray(cuisine_types, other_cuisine_types);

        const allAllergens = createArray(allergens, other_allergens);

        const updatedData = {
            title: title,
            chef: chef,
            private: isPrivate,
            description: description,
            quantities: JSON.parse(quantities),
            ingredients: JSON.parse(ingredients),
            steps: JSON.parse(steps),
            diet: allDiets,
            categories: allCategories,
            cuisine_types: allCuisineTypes,
            allergens: allAllergens
        };

        if (image) {
            updatedData.image = image;
        }

        const editedRecipe = await Recipe.findByIdAndUpdate(id, updatedData, { new: true }).lean();

        if (editedRecipe.image && Buffer.isBuffer(editedRecipe.image)) {
            editedRecipe.image = editedRecipe.image.toString('base64');
        }

        const result = {
            ...editedRecipe,
            chef_username: user.username
        };

        await Ingredient.deleteMany({ recipe_id: id });

        for (let ingredient of allIngredients) {
            const newIngredient = await Ingredient({
                recipe_id: id,
                ingredient: ingredient,
                test: test
            });
            await newIngredient.save();
        }

        res.status(200).json(result);

    } catch (error) {
        res.status(400).json({ error: error });
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

    } catch (error) {
        res.status(400).json({ error: error });
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

    } catch (error) {
        res.status(404).json({ error: error });
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

        const books = await Book.find().lean();
        const recipeIds = new Set();

        for (const book of books) {
            for (const recipeId of book.recipes_id) {
                recipeIds.add(recipeId.toString());
            }
        }

        const filteredRecipes = userRecipes.filter(recipe => !recipeIds.has(recipe._id.toString()));

        const result = await convertToObjects(filteredRecipes);

        res.status(200).json(result);

    } catch (error) {
        res.status(404).json({ error: error });
    }
});

exports.check_favourite = asyncHandler(async (req, res, next) => {
    const { user_id, recipe_id } = req.body;

    try {
        const user = await User.findOne({ _id: user_id }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundFavourite = await FavouriteRecipe.findOne({ user_id: user_id, recipe_id: recipe_id }).lean();

        const isFavourite = foundFavourite ? true : false;

        return res.status(200).json(isFavourite);

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.toggle_favourite = asyncHandler(async (req, res, next) => {
    const { user_id, recipe_id } = req.body;

    try {
        const user = await User.findOne({ _id: user_id }).lean();

        if (!user) {
            console.log(user);
            return res.status(404).json({ error: 'User not found' });
        }

        const foundFavourite = await FavouriteRecipe.findOne({ user_id: user_id, recipe_id: recipe_id }).lean();

        if (foundFavourite) {
            await FavouriteRecipe.findByIdAndDelete(foundFavourite._id);

            return res.status(200).json({ message: 'No longer set to favourite' });
        }

        const saveFavouriteRecipe = new FavouriteRecipe({
            user_id,
            recipe_id
        });

        const saveFavourite = await saveFavouriteRecipe.save();

        res.status(200).json(saveFavourite);

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.get_all_favourites = asyncHandler(async (req, res, next) => {
    const { user_id } = req.params;

    try {
        const favourites = await FavouriteRecipe.find({ user_id: user_id }).populate('recipe_id').lean();

        const recipes = favourites.map(favourite => favourite.recipe_id);

        const result = await convertToObjects(recipes);

        res.status(200).json(result);

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.sort_by_popularity = asyncHandler(async (req, res, next) => {
    const { page_count } = req.body;

    try {
        const recipes = await Recipe.find({ private: false }).lean();

        const recipeIds = recipes.map(recipe => recipe._id);

        const allRatings = await Star.find({ recipe_id: { $in: recipeIds }});

        const ratingMap = {};

        allRatings.forEach(rating => {
            if (!ratingMap[rating.recipe_id]) {
                ratingMap[rating.recipe_id] = [];
            }
            ratingMap[rating.recipe_id].push(rating);
        });

        const recipesWithAverage = recipes.map(recipe => {
            const ratings = ratingMap[recipe._id] || [];
            const totalRating = ratings.reduce((a, b) => a + b.stars, 0);
            const average = ratings.length > 0 ? totalRating / ratings.length : 0;

            return {
                ...recipe,
                average: average
            };
        });

        const sortedRecipes = recipesWithAverage.sort((a, b) => b.average - a.average);

        const startIndex = (page_count * 20) - 20;
        const endIndex = page_count * 20;

        const page = sortedRecipes.slice(startIndex, endIndex);

        const limit = page.length < 20 ? true : false;

        res.status(200).json({ page: page, limit: limit });

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});