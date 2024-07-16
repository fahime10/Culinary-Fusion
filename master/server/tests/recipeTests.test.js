const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app.js');
const Recipe = require('../models/recipeModel.js');
const User = require('../models/userModel.js');
const Ingredient = require('../models/ingredientModel.js');

const request = supertest(app);

describe('Testing Recipe API', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MongoDB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    afterEach(async () => {
        await Recipe.deleteMany({ test: true });
        await User.deleteMany({ test: true });
        await Ingredient.deleteMany({ test: true });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('Test POST /api/recipes/add-recipe', () => {
        it('should add new recipe', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james12345678901234',
                password: 'pass',
                dietary_preferences: [],
                test: true
            }
            
            const user = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            const res = await request
                .post('/api/recipes/add-recipe')
                .set('Content-Type', 'multipart/form-data')
                .field('title', 'Scrambled eggs')
                .field('chef', 'John')
                .field('username', 'james12345678901234')
                .field('private', false)
                .field('description', 'Simple, nutritious recipe')
                .field('quantities', JSON.stringify(['3', '200ml', '1 teaspoon', 'a pinch', 'a pinch']))
                .field('ingredients', JSON.stringify(['Eggs', 'Water', 'Olive Oil', 'Salt', 'Pepper']))
                .field('steps', JSON.stringify(['Open the eggs, place in a bowl, then whisk', 'Preheat a pan', 'Cook the whisked eggs in the pan']))
                .field('test', true)
                .attach('image', Buffer.from('test image'), 'test-image.jpg');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('title', 'Scrambled eggs');
            expect(res.body).toHaveProperty('chef', 'John');
            expect(res.body).toHaveProperty('private', false);
            expect(res.body).toHaveProperty('description', 'Simple, nutritious recipe');
            expect(res.body.quantities).toEqual(['3', '200ml', '1 teaspoon', 'a pinch', 'a pinch']);
            expect(res.body.ingredients).toEqual(['Eggs', 'Water', 'Olive Oil', 'Salt', 'Pepper']);
            expect(res.body.steps).toEqual(['Open the eggs, place in a bowl, then whisk', 'Preheat a pan', 'Cook the whisked eggs in the pan']);
            expect(res.body).toHaveProperty('test', true);

            const secondData = {
                username: 'james12345678901234'
            }

            const newRes = await request
                .post(`/api/recipes/recipe/${res.body._id}`)
                .set('Content-Type', 'application/json')
                .send(secondData);

            expect(newRes.status).toBe(200);
        });
    });

    describe('Test POST /api/recipes/add-recipe', () => {
        it('should not add new recipe (missing required title)', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james12345678901234',
                password: 'pass',
                dietary_preferences: [],
                test: true
            }
            
            const user = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            const res = await request
                .post('/api/recipes/add-recipe')
                .set('Content-Type', 'multipart/form-data')
                .field('chef', 'John')
                .field('username', 'james12345678901234')
                .field('private', false)
                .field('description', 'Simple, nutritious recipe')
                .field('quantities', JSON.stringify(['3', '200ml', '1 teaspoon', 'a pinch', 'a pinch']))
                .field('ingredients', JSON.stringify(['Eggs', 'Water', 'Olive Oil', 'Salt', 'Pepper']))
                .field('steps', JSON.stringify(['Open the eggs, place in a bowl, then whisk', 'Preheat a pan', 'Cook the whisked eggs in the pan']))
                .field('test', true)
                .attach('image', Buffer.from('test image'), 'test-image.jpg');

            expect(res.status).toBe(400);
        });
    });

    describe('Test POST /api/recipes/add-recipe', () => {
        it('should not add new recipe (missing required username)', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james12345678901234',
                password: 'pass',
                dietary_preferences: [],
                test: true
            }
            
            const user = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            const res = await request
                .post('/api/recipes/add-recipe')
                .set('Content-Type', 'multipart/form-data')
                .field('title', 'Scrambled eggs')
                .field('chef', 'John')
                .field('private', false)
                .field('description', 'Simple, nutritious recipe')
                .field('quantities', JSON.stringify(['3', '200ml', '1 teaspoon', 'a pinch', 'a pinch']))
                .field('ingredients', JSON.stringify(['Eggs', 'Water', 'Olive Oil', 'Salt', 'Pepper']))
                .field('steps', JSON.stringify(['Open the eggs, place in a bowl, then whisk', 'Preheat a pan', 'Cook the whisked eggs in the pan']))
                .field('test', true)
                .attach('image', Buffer.from('test image'), 'test-image.jpg');

            // expect automatic 404 status because username is not found
            expect(res.status).toBe(404);
        });
    });

    describe('Test DELETE /api/recipes/delete-recipe/:id', () => {
        it('should delete recipe', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james1234567890123',
                password: 'pass',
                dietary_preferences: [],
                test: true
            }
            
            const user = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            const res = await request
                .post('/api/recipes/add-recipe')
                .set('Content-Type', 'multipart/form-data')
                .field('title', 'Scrambled eggs')
                .field('chef', 'John')
                .field('username', 'james1234567890123')
                .field('isPrivate', false)
                .field('description', 'Simple, nutritious recipe')
                .field('quantities', JSON.stringify(['3', '200ml', '1 teaspoon', 'a pinch', 'a pinch']))
                .field('ingredients', JSON.stringify(['Eggs', 'Water', 'Olive Oil', 'Salt', 'Pepper']))
                .field('steps', JSON.stringify(['Open the eggs, place in a bowl, then whisk', 'Preheat a pan', 'Cook the whisked eggs in the pan']))
                .field('test', true)
                .attach('image', Buffer.from('test image'), 'test-image.jpg');
    
            expect(res.status).toBe(200);
    
            const recipe_id = res.body._id;
    
            await request
                .delete(`/api/recipes/delete-recipe/${recipe_id}`)
                .expect(204);
    
            const resQuery = await Recipe.findById(recipe_id);
            expect(resQuery).toBeNull();
        });
    });

    describe('Test POST /api/recipes/edit-recipe/:id', () => {
        it('should edit recipe', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'JAMES1234567890123',
                password: 'pass',
                dietary_preferences: [],
                test: true
            }
            
            const user = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            const res = await request
                .post('/api/recipes/add-recipe')
                .set('Content-Type', 'multipart/form-data')
                .field('title', 'Scrambled eggs')
                .field('chef', 'John')
                .field('username', 'JAMES1234567890123')
                .field('isPrivate', false)
                .field('description', 'Simple, nutritious recipe')
                .field('quantities', JSON.stringify(['3', '200ml', '1 teaspoon', 'a pinch', 'a pinch']))
                .field('ingredients', JSON.stringify(['Eggs', 'Water', 'Olive Oil', 'Salt', 'Pepper']))
                .field('steps', JSON.stringify(['Open the eggs, place in a bowl, then whisk', 'Preheat a pan', 'Cook the whisked eggs in the pan']))
                .field('test', true)
                .attach('image', Buffer.from('test image'), 'test-image.jpg');
    
            expect(res.status).toBe(200);

            const editedRecipe = {
                title: 'Updated Scrambled eggs',
                image: Buffer.from('some image'),
                chef: 'Johnson',
                description: 'Simple recipe',
                quantities: ['5', '400ml', '1 teaspoon', 'a pinch', 'a pinch'],
                ingredients: ['Eggs', 'Water', 'Olive Oil', 'Salt'],
                steps: ['Open the eggs, place in a bowl', 'Heat a pan', 'Cook the eggs'],
            };

            const recipe = await Recipe.findById(res.body._id);

            recipe.title = editedRecipe.title;
            recipe.image = editedRecipe.image;
            recipe.chef = editedRecipe.chef;
            recipe.description = editedRecipe.description;
            recipe.quantities = editedRecipe.quantities;
            recipe.ingredients = editedRecipe.ingredients;
            recipe.steps = editedRecipe.steps;

            const newRes = await request
                .post(`/api/recipes/edit-recipe/${recipe._id}`)
                .set('Content-Type', 'multipart/form-data')
                .field('title', editedRecipe.title)
                .field('chef', editedRecipe.chef)
                .field('description', editedRecipe.description)
                .field('quantities', JSON.stringify(editedRecipe.quantities))
                .field('ingredients', JSON.stringify(editedRecipe.ingredients))
                .field('steps', JSON.stringify(editedRecipe.steps))
                .attach('image', editedRecipe.image, 'some-image.jpg');

            expect(newRes.status).toBe(200);
            expect(newRes.body).toHaveProperty('title', editedRecipe.title);
            expect(newRes.body).toHaveProperty('chef', editedRecipe.chef);
            expect(newRes.body).toHaveProperty('description', editedRecipe.description);
            expect(newRes.body.quantities).toEqual(editedRecipe.quantities);
            expect(newRes.body.ingredients).toEqual(editedRecipe.ingredients);
            expect(newRes.body.steps).toEqual(editedRecipe.steps);

            const secondData = {
                username: 'JAMES1234567890123'
            }
            const extraRes = await request
                .post(`/api/recipes/recipe/${res.body._id}`)
                .set('Content-Type', 'application/json')
                .send(secondData);

            expect(extraRes.status).toBe(200);
            expect(extraRes.body.recipe).toHaveProperty('title', editedRecipe.title);
            expect(extraRes.body.recipe).toHaveProperty('chef', editedRecipe.chef);
            expect(extraRes.body.recipe).toHaveProperty('description', editedRecipe.description);
            expect(extraRes.body.recipe.quantities).toEqual(editedRecipe.quantities);
            expect(extraRes.body.recipe.ingredients).toEqual(editedRecipe.ingredients);
            expect(extraRes.body.recipe.steps).toEqual(editedRecipe.steps);
        });
    });
});
