const express = require('express');
const router = express.Router();

const index_controller = require('../controllers/indexController');
const recipe_controller = require('../controllers/recipeController');

router.get('/', index_controller.index);

router.post('/recipes/add-recipe', recipe_controller.upload, recipe_controller.add_recipe);

router.get('/recipes', recipe_controller.recipes_get);

module.exports = router;