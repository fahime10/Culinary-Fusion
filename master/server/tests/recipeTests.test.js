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
        });
    });

    describe('Test DELETE /api/recipes/delete', () => {
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
                .delete(`/api/recipes/delete/${recipe_id}`)
                .expect(204);
    
            const resQuery = await Recipe.findById(recipe_id);
            expect(resQuery).toBeNull();
        });
    });
});
