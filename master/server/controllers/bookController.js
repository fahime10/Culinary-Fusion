const Book = require('../models/bookModel');
const Recipe = require('../models/recipeModel');
const Group = require('../models/groupModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.upload = upload.single('image');

const convertToObjects = (collection) => {
    const objects = collection.map(item => {
        if (item.image && Buffer.isBuffer(item.image)) {
            item.image = item.image.toString('base64');
        }
        return item;
    });

    return objects;
}

exports.get_all_books = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const foundGroup = await Group.findOne({ _id: id });

        if (!foundGroup) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const allBooks = await Book.find({ group_id: foundGroup._id });

        res.status(200).json(allBooks);

    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.create_book = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { user_id, book_title, book_description, test } = req.body;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newBook = new Book({
            book_title: book_title,
            book_description: book_description,
            group_id: id,
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
        await Book.findByIdAndDelete(id);

        res.status(200).json({ message: 'Book deleted successfully' });

    } catch (error) {
        res.status(400).json({ error: error });
    }
});

exports.add_recipe = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const { 
        title, chef, username, description, quantities, ingredients, 
        steps, diet, categories, cuisine_types, allergens, test 
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
            private: true,
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