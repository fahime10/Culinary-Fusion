const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app.js');
const Group = require('../models/groupModel.js');
const User = require('../models/userModel.js');
const Recipe = require('../models/recipeModel.js');
const Book = require('../models/bookModel.js');

const jwt = require('jsonwebtoken');

const request = supertest(app);

describe('Testing Book API', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MongoDB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    afterEach(async () => {
        await Book.deleteMany({ test: true });
        await User.deleteMany({ test: true });
        await Group.deleteMany({ test: true });
        await Recipe.deleteMany({ test: true });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('Test POST /api/books/create/:id', () => {
        it('should create a book', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'randoms',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: [],
                test: true
            };

            const user = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);
            
            const token = user.body.token;

            expect(user.status).toBe(200);

            const decoded = jwt.decode(token);
            const user_id = decoded.id;

            const secondData = {
                user_id: user_id,
                group_name: 'Group12345689',
                group_description: 'test group',
                test: true
            };

            const res = await request
                .post('/api/groups/create')
                .set('Content-Type', 'application/json')
                .send(secondData);

            expect(res.status).toBe(200);

            const thirdData = {
                user_id: user_id,
                book_title: 'New book',
                book_description: 'new book in database',
                test: true
            };

            const secondRes = await request
                .post(`/api/books/create/${res.body._id}`)
                .set('Content-Type', 'application/json')
                .send(thirdData);

            expect(secondRes.status).toBe(200);
            expect(secondRes.body).toHaveProperty('book_title', 'New book');
            expect(secondRes.body).toHaveProperty('book_description', 'new book in database');
            expect(secondRes.body).toHaveProperty('test', true);
        });

        it('should edit book', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'randoms42',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: [],
                test: true
            };

            const user = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);
            
            const token = user.body.token;

            expect(user.status).toBe(200);

            const decoded = jwt.decode(token);
            const user_id = decoded.id;

            const secondData = {
                user_id: user_id,
                group_name: 'Group1234589',
                group_description: 'test group',
                test: true
            };

            const res = await request
                .post('/api/groups/create')
                .set('Content-Type', 'application/json')
                .send(secondData);

            expect(res.status).toBe(200);

            const thirdData = {
                user_id: user_id,
                book_title: 'New book',
                book_description: 'new book in database',
                test: true
            };

            const secondRes = await request
                .post(`/api/books/create/${res.body._id}`)
                .set('Content-Type', 'application/json')
                .send(thirdData);

            expect(secondRes.status).toBe(200);
            
            const fourthData = {
                user_id: user_id,
                book_title: 'Book Random',
                book_description: 'Edited book',
                test: true
            };

            const thirdRes = await request
                .post(`/api/books/edit/${secondRes.body._id}`)
                .set('Content-Type', 'application/json')
                .send(fourthData);

            expect(thirdRes.status).toBe(200);
            expect(thirdRes.body).toHaveProperty('book_title', 'Book Random');
            expect(thirdRes.body).toHaveProperty('book_description', 'Edited book');
            expect(thirdRes.body).toHaveProperty('test', true);
        });

        describe('Test DELETE /api/books/delete/:id', () => {
            it('should delete book', async () => {
                const data = {
                    name_title: 'Mr',
                    first_name: 'James',
                    last_name: 'Smith',
                    username: 'randomss',
                    password: 'pass',
                    email: 'random@gmail.com',
                    passcode: '',
                    dietary_preferences: [],
                    test: true
                };
    
                const user = await request
                    .post('/api/users/add-user')
                    .set('Content-Type', 'application/json')
                    .send(data);
                
                const token = user.body.token;
    
                expect(user.status).toBe(200);
    
                const decoded = jwt.decode(token);
                const user_id = decoded.id;
    
                const secondData = {
                    user_id: user_id,
                    group_name: 'Group2345689',
                    group_description: 'test group',
                    test: true
                };
    
                const res = await request
                    .post('/api/groups/create')
                    .set('Content-Type', 'application/json')
                    .send(secondData);
    
                expect(res.status).toBe(200);
    
                const thirdData = {
                    user_id: user_id,
                    book_title: 'New book',
                    book_description: 'new book in database',
                    test: true
                };
    
                const secondRes = await request
                    .post(`/api/books/create/${res.body._id}`)
                    .set('Content-Type', 'application/json')
                    .send(thirdData);
    
                expect(secondRes.status).toBe(200);
                
                const thirdRes = await request
                    .delete(`/api/books/delete/${secondRes.body._id}`);

                expect(thirdRes.status).toBe(200);
                expect(thirdRes.body).toHaveProperty('message', 'Book deleted successfully')
            });
        });
    });
});