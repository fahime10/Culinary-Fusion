const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app.js');
const User = require('../models/userModel.js');

const request = supertest(app);

describe('Testing User API', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MongoDB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    afterEach(async () => {
        await User.deleteMany({ test: true });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('Test POST /api/users/add-user', () => {
        it('should add new user', async () => {
            const userData = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james123456789012345',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: [],
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(userData);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
    });

    describe('Test POST /api/users/add-user', () => {
        it('should not add new user (username missing)', async () => {
            const userData = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: '',
                password: 'pass',
                passcode: '',
                email: 'random@gmail.com',
                dietary_preferences: [],
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(userData);

            expect(res.status).toBe(400);
        });
    });

    describe('Test POST /api/users/login', () => {
        it('should login', async () => {
            const userData = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james12345678901',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: [],
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(userData);

            expect(res.status).toBe(200);

            const existingUserData = {
                username: 'james12345678901',
                password: 'pass'
            }

            const secondRes = await request
                .post('/api/users/login')
                .set('Content-Type', 'application/json')
                .send(existingUserData);

            expect(secondRes.status).toBe(200);
        });
    });

    describe('Test POST /api/users/login', () => {
        it('should not login (wrong username)', async () => {
            const userData = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james12345678901',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: [],
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(userData);

            expect(res.status).toBe(200);

            const nonExistingUserData = {
                username: 'james12345678',
                password: 'pass'
            }

            const secondRes = await request
                .post('/api/users/login')
                .set('Content-Type', 'application/json')
                .send(nonExistingUserData);

            // expect automatic 401 to indicate unauthorized access
            expect(secondRes.status).toBe(401);
        });
    });

    describe('Test POST /api/users/:username', () => {
        it('should provide user details', async () => {
            const userData = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'jAmEs123456789012345',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: [],
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(userData);

            expect(res.status).toBe(200);
            
            const secondRes = await request
                .post(`/api/users/${userData.username}`)
                .set('Content-Type', 'application/json');
            
            expect(secondRes.status).toBe(200);
            expect(secondRes.body).toHaveProperty('first_name', 'James');
            expect(secondRes.body).toHaveProperty('last_name', 'Smith');
            expect(secondRes.body).toHaveProperty('username', 'jAmEs123456789012345');
            expect(secondRes.body.dietary_preferences).toEqual([]);
        });
    });

    describe('Test POST /api/users/edit-user/:username', () => {
        it('should edit user', async () => {
            const userData = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'jAs123456789012345',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: [],
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(userData);

            expect(res.status).toBe(200);
            
            const secondRes = await request
                .post(`/api/users/${userData.username}`)
                .set('Content-Type', 'application/json');
            
            expect(secondRes.status).toBe(200);
            
            const updatedUserData = {
                name_title: 'Mr',
                first_name: 'John',
                last_name: 'S',
                username: 'jAs123456789012345',
                password: 'pass',
                passcode: 'pass',
                dietary_preferences: ['Dairy-free'],
                test: true
            }

            const thirdRes = await request
                .post(`/api/users/edit-user/${userData.username}`)
                .set('Content-Type', 'application/json')
                .send(updatedUserData);

            expect(thirdRes.status).toBe(200);
            expect(thirdRes.body).toHaveProperty('message', 'Updated successfully');
            expect(thirdRes.body).toHaveProperty('token');
        });
    });

    describe('Test POST /api/users/delete-user/:username', () => {
        it('should delete user', async () => {
            const userData = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'mEs1234567890123457',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: '',
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(userData);

            expect(res.status).toBe(200);
            
            const secondRes = await request
                .post(`/api/users/${userData.username}`)
                .set('Content-Type', 'application/json');
            
            expect(secondRes.status).toBe(200);
            
            await request
                .delete(`/api/users/delete-user/${userData.username}`)
                .expect(200);

            const resQuery = await User.findOne({ username: userData.username });
            expect(resQuery).toBeNull();
        });
    });
});