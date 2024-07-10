const express = require('express');
const router = express.Router();

const index_controller = require('../controllers/indexController');
const recipe_controller = require('../controllers/recipeController');
const user_controller = require('../controllers/userController');

router.get('/', index_controller.index);

router.post('/recipes/add-recipe', recipe_controller.upload, recipe_controller.add_recipe);

router.get('/recipes', recipe_controller.recipes_get_all);

router.post('/recipes/:username', recipe_controller.recipe_get_own);

router.post('/recipes/search/:search', recipe_controller.search_recipe);

router.delete('/recipes/delete-recipe/:id', recipe_controller.recipe_delete);

router.post('/recipes/recipe/:id', recipe_controller.get_recipe);

router.post('/recipes/edit-recipe/:id', recipe_controller.upload, recipe_controller.recipe_edit);

router.post('/users/add-user', user_controller.add_user);

router.post('/users/login', user_controller.login_user);

module.exports = router;