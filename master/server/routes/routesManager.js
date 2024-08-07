const express = require('express');
const router = express.Router();

const index_controller = require('../controllers/indexController');
const recipe_controller = require('../controllers/recipeController');
const user_controller = require('../controllers/userController');
const star_controller = require('../controllers/starController');
const group_controller = require('../controllers/groupController');
const join_request_controller = require('../controllers/joinRequestController');
const book_controller = require('../controllers/bookController');

router.get('/', index_controller.index);

router.post('/recipes/add-recipe', recipe_controller.upload, recipe_controller.add_recipe);

router.post('/recipes', recipe_controller.recipes_get_all);

router.post('/recipes/:username', recipe_controller.recipe_get_all_recipes_signed_in);

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

router.post('/groups/add-members/:id', group_controller.create_requests);

router.post('/join-requests', join_request_controller.get_all_notifications);

router.post('/join-requests/accept-request/:id', join_request_controller.accept_request);

router.post('/join-requests/delete-request/:id', join_request_controller.refuse_request);

router.post('/groups/promote/:id', group_controller.promote_user);

router.post('/groups/demote/:id', group_controller.demote_user);

router.delete('/groups/remove/:id', group_controller.remove_user);

router.post('/groups/search/:group_name', group_controller.search_group);

router.post('/books/:id', book_controller.get_all_books);

router.post('/books/create/:id', book_controller.create_book);

module.exports = router;