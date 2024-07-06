const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app.js');
const Recipe = require('../models/recipeModel.js');

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
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('Test POST /api/recipes/add-recipe', () => {
        it('should add new recipe', async () => {
            const res = await request
                .post('/api/recipes/add-recipe')
                .set('Content-Type', 'multipart/form-data')
                .field('title', 'Scrambled eggs')
                .field('chef', 'John')
                .field('description', 'Simple, nutritious recipe')
                .field('ingredients', JSON.stringify(['Eggs', 'Water', 'Olive Oil', 'Salt', 'Pepper']))
                .field('steps', JSON.stringify(['Open the eggs, place in a bowl, then whisk', 'Preheat a pan', 'Cook the whisked eggs in the pan']))
                .field('test', true)
                .attach('image', Buffer.from('test image'), 'test-image.jpg');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('title', 'Scrambled eggs');
            expect(res.body).toHaveProperty('chef', 'John');
            expect(res.body).toHaveProperty('description', 'Simple, nutritious recipe');
            expect(res.body.ingredients).toEqual(['Eggs', 'Water', 'Olive Oil', 'Salt', 'Pepper']);
            expect(res.body.steps).toEqual(['Open the eggs, place in a bowl, then whisk', 'Preheat a pan', 'Cook the whisked eggs in the pan']);
            expect(res.body).toHaveProperty('test', true);

            const newRes = await request
                .get(`/api/recipes/${res.body._id}`);

            expect(newRes.status).toBe(200);
        });
    });

    describe('Test DELETE /api/recipes/delete-recipe/:id', () => {
        it('should delete recipe', async () => {
            const res = await request
                .post('/api/recipes/add-recipe')
                .set('Content-Type', 'multipart/form-data')
                .field('title', 'Scrambled eggs')
                .field('chef', 'John')
                .field('description', 'Simple, nutritious recipe')
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
            const res = await request
                .post('/api/recipes/add-recipe')
                .set('Content-Type', 'multipart/form-data')
                .field('title', 'Scrambled eggs')
                .field('chef', 'John')
                .field('description', 'Simple, nutritious recipe')
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
                ingredients: ['Eggs', 'Water', 'Olive Oil', 'Salt'],
                steps: ['Open the eggs, place in a bowl', 'Heat a pan', 'Cook the eggs'],
            };

            const recipe = await Recipe.findById(res.body._id);

            recipe.title = editedRecipe.title;
            recipe.image = editedRecipe.image;
            recipe.chef = editedRecipe.chef;
            recipe.description = editedRecipe.description;
            recipe.ingredients = editedRecipe.ingredients;
            recipe.steps = editedRecipe.steps;

            const newRes = await request
                .post(`/api/recipes/edit-recipe/${recipe._id}`)
                .set('Content-Type', 'multipart/form-data')
                .field('title', editedRecipe.title)
                .field('chef', editedRecipe.chef)
                .field('description', editedRecipe.description)
                .field('ingredients', JSON.stringify(editedRecipe.ingredients))
                .field('steps', JSON.stringify(editedRecipe.steps))
                .attach('image', editedRecipe.image, 'some-image.jpg');

            expect(newRes.status).toBe(200);
            expect(newRes.body).toHaveProperty('title', editedRecipe.title);
            expect(newRes.body).toHaveProperty('chef', editedRecipe.chef);
            expect(newRes.body).toHaveProperty('description', editedRecipe.description);
            expect(newRes.body.ingredients).toEqual(editedRecipe.ingredients);
            expect(newRes.body.steps).toEqual(editedRecipe.steps);

            const extraRes = await request
                .get(`/api/recipes/${res.body._id}`);

            expect(extraRes.status).toBe(200);
            expect(extraRes.body).toHaveProperty('title', editedRecipe.title);
            expect(extraRes.body).toHaveProperty('chef', editedRecipe.chef);
            expect(extraRes.body).toHaveProperty('description', editedRecipe.description);
            expect(extraRes.body.ingredients).toEqual(editedRecipe.ingredients);
            expect(extraRes.body.steps).toEqual(editedRecipe.steps);
        })
    })
});
