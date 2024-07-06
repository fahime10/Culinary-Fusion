const express = require('express');
const router = express.Router();

const index_controller = require('../controllers/indexController');
const recipe_controller = require('../controllers/recipeController');

router.get('/', index_controller.index);

router.post('/recipes/add-recipe', recipe_controller.upload, recipe_controller.add_recipe);

router.get('/recipes', recipe_controller.recipes_get);

router.delete('/recipes/delete-recipe/:id', recipe_controller.recipe_delete);

router.get('/recipes/:id', recipe_controller.get_recipe);

router.post('/recipes/edit-recipe/:id', recipe_controller.upload, recipe_controller.recipe_edit);

module.exports = router;