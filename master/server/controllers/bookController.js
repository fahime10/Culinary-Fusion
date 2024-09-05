/**
 * bookController component
 * 
 * This component handles all the book features ranging from retrieving all books, creating, editing and deleting new books, 
 * retrieving a single book, adding, editing and deleting recipes in a book and searching books by their titles.
 *  
 */

const Book = require('../models/bookModel');
const Recipe = require('../models/recipeModel');
const Group = require('../models/groupModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.upload = upload.single('image');

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

// Merges two collections to produce a single array
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

exports.get_all_books = asyncHandler(async (req, res, next) => {
    const { group_name } = req.params;

    const { user_id } = req.body;

    try {
        const user = await User.findOne({ _id: user_id }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundGroup = await Group.findOne({ group_name: group_name }).lean();

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const allBooks = await Book.find({ group_id: foundGroup._id }).lean();

        res.status(200).json(allBooks);

    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.create_book = asyncHandler(async (req, res, next) => {
    const { group_name } = req.params;

    const { user_id, book_title, book_description, test } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundGroup = await Group.findOne({ group_name: group_name }).lean();

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const newBook = new Book({
            book_title: book_title,
            book_description: book_description,
            group_id: foundGroup._id,
            recipes_id: [],
            test
        });

        const saveBook = await newBook.save();

        res.status(200).json(saveBook);

    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.get_book = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id } = req.body;

    try {
        const user = await User.findOne({ _id: user_id }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const book = await Book.findOne({ _id: id }).lean();

        const foundGroup = await Group.findOne({ _id: book.group_id }).lean();

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        let isMainAdmin = false;
        let isAdmin = false;
        let isCollaborator = false;

        if (foundGroup.user_id._id.toString() === user._id.toString()) {
            isMainAdmin = true;
        } else if (foundGroup.admins && foundGroup.admins.includes(user.username)) {
            isAdmin = true;
        } else if (foundGroup.collaborators && foundGroup.collaborators.includes(user.username)) {
            isCollaborator = true;
        }

        const recipeIds = book.recipes_id || [];

        const recipes = await Promise.all(
            recipeIds.map(async (recipeId) => {
                return await Recipe.findOne({ _id: recipeId }).populate('user_id', 'username').lean();
            })
        );

        const recipeObjects = await convertToObjects(recipes);

        const result = recipeObjects.map(recipe => ({
            ...recipe,
            chef_username: recipe.user_id.username
        }));

        res.status(200).json({
            book: book,
            recipes: result,
            is_main_admin: isMainAdmin, 
            is_admin: isAdmin, 
            is_collaborator: isCollaborator 
        });

    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.edit_book = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id, book_title, book_description, test } = req.body;

    try {
        const user = await User.findOne({ _id: user_id }).lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const book = await Book.findOne({ _id: id }).lean();

        const foundGroup = await Group.findOne({ _id: book.group_id }).lean();

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        let isMainAdmin = false;
        let isAdmin = false;

        if (foundGroup.user_id._id.toString() === user._id.toString()) {
            isMainAdmin = true;
        } else if (foundGroup.admins && foundGroup.admins.includes(user.username)) {
            isAdmin = true;
        }

        if (isMainAdmin || isAdmin) {
            const updatedData = {
                book_title: book_title,
                book_description: book_description,
                test: test
            };

            const editedBook = await Book.findByIdAndUpdate(id, updatedData, { new: true });

            if (!editedBook) {
                return res.status(404).json({ error: 'Something went wrong' });
            }

            res.status(200).json(editedBook);
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.delete_book = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    try {
        const book = await Book.findOne({ _id: id });
        
        const recipeIds = book.recipes_id;
        
        for (let recipeId of recipeIds) {
            await Recipe.findByIdAndDelete({ _id: recipeId });
        }

        await Book.findByIdAndDelete(id);

        res.status(200).json({ message: 'Book deleted successfully' });

    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.add_recipe = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { 
        title, chef, username, description, quantities, ingredients, steps, diet, categories,
        cuisine_types, allergens, other_diets, other_categories, other_cuisine_types, other_allergens, test 
    } = req.body;

    try {
        const book = await Book.findOne({ _id: id });

        const group_id = book.group_id;

        const foundGroup = await Group.findOne({ _id: group_id });

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const user = await User.findOne({ username: username }).lean();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let image = null;
        if (req.file && req.file.buffer) {
            image = req.file.buffer;
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
            private: true,
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

        await Book.findByIdAndUpdate(
            id,
            { $push: { recipes_id: saveRecipe._id }},
            { new: true }        
        );

        res.status(200).json(recipeObj);

    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.delete_recipe = asyncHandler(async (req, res, next) => {
    const { recipe_id } = req.params;

    const { book_id } = req.body;

    try {
        await Recipe.findByIdAndDelete(recipe_id);

        await Book.findByIdAndUpdate(
            book_id,
            { $pull: { recipes_id: recipe_id }},
            { new: true }
        );

        res.status(200).json({ message: 'Successfully deleted the recipe from the book' });
        
    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.edit_recipe = asyncHandler(async (req, res, next) => {
    const { id, recipe_id } = req.params;

    const { 
        title, chef, description, user_id, quantities, ingredients, steps, diet, categories,
        cuisine_types, allergens, other_diets, other_categories, other_cuisine_types, other_allergens, test 
    } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            console.log("user")
            res.status(404).json({ error: 'User not found' });
        }

        const book = await Book.findOne({ _id: id });

        const group_id = book.group_id;

        const foundGroup = await Group.findOne({ _id: group_id });

        if (!foundGroup) {
            console.log("group")
            return res.status(404).json({ error: 'Group not found' });
        }

        let isMainAdmin = false;
        let isAdmin = false;
        let isCollaborator = false;

        if (foundGroup.user_id._id.toString() === user._id.toString()) {
            isMainAdmin = true;
        } else if (foundGroup.admins && foundGroup.admins.includes(user.username)) {
            isAdmin = true;
        } else if (foundGroup.collaborators && foundGroup.collaborators.includes(user.username)) {
            isCollaborator = true;
        }

        if (isMainAdmin || isAdmin || isCollaborator) {
            let image = null;
            if (req.file && req.file.buffer) {
                image = req.file.buffer;
            }

            const allDiets = createArray(diet, other_diets);

            const allCategories = createArray(categories, other_categories);

            const allCuisineTypes = createArray(cuisine_types, other_cuisine_types);

            const allAllergens = createArray(allergens, other_allergens);

            const updatedData = {
                title,
                chef,
                description,
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

            const editedRecipe = await Recipe.findByIdAndUpdate(recipe_id, updatedData, { new: true }).lean();

            if (editedRecipe.image && Buffer.isBuffer(editedRecipe.image)) {
                editedRecipe.image = editedRecipe.image.toString('base64');
            }

            if (!editedRecipe) {
                return res.status(404).json({ err: 'Something went wrong' });
            }

            res.status(200).json(editedRecipe);
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});

exports.search_book = asyncHandler(async (req, res, next) => {
    const { book_title } = req.params;

    const { group_name } = req.body;

    try {
        const foundGroup = await Group.findOne({ group_name: group_name }).lean();

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const books = await Book.find({ group_id: foundGroup._id, book_title: new RegExp(book_title, 'i') }).lean();

        res.status(200).json(books);

    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error });
    }
});