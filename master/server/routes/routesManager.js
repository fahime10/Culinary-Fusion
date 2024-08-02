const express = require('express');
const router = express.Router();

const index_controller = require('../controllers/indexController');
const recipe_controller = require('../controllers/recipeController');
const user_controller = require('../controllers/userController');
const star_controller = require('../controllers/starController');
const group_controller = require('../controllers/groupController');

router.get('/', index_controller.index);

router.post('/recipes/add-recipe', recipe_controller.upload, recipe_controller.add_recipe);

router.post('/recipes', recipe_controller.recipes_get_all);

router.post('/recipes/:username', recipe_controller.recipe_get_own);

router.post('/recipes/search/:search', recipe_controller.search_recipe);

router.post('/recipes/filter/set', recipe_controller.filter_recipes);

router.delete('/recipes/delete-recipe/:id', recipe_controller.recipe_delete);

router.post('/recipes/recipe/:id', recipe_controller.get_recipe);

router.post('/recipes/edit-recipe/:id', recipe_controller.upload, recipe_controller.recipe_edit);

router.post('/recipes/own/:username', recipe_controller.personal_recipes);

router.post('/users/add-user', user_controller.add_user);

router.post('/users/login', user_controller.login_user);

router.post('/users/:username', user_controller.user_details);

router.post('/users/edit-user/:username', user_controller.edit_user);

router.delete('/users/delete-user/:username', user_controller.delete_user);

router.post('/users/forgotten-password/change', user_controller.forgotten_password);

router.post('/stars', star_controller.add_star_rating);

router.post('/stars/rating-recipe', star_controller.rating_average);

router.post('/stars/get-all-ratings', star_controller.get_all_ratings);

router.post('/groups', group_controller.groups_get_all);

router.post('/groups/create', group_controller.create_group);

router.post('/groups/:id', group_controller.get_group);

router.post('/groups/edit/:id', group_controller.edit_group);

router.delete('/groups/delete/:id', group_controller.delete_group);

module.exports = router;