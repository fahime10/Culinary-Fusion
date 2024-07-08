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

    describe('Test POST /api/user/add-user', () => {
        it('should add new user', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james123456789012345',
                password: 'pass',
                dietary_preferences: '',
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name_title', 'Mr');
            expect(res.body).toHaveProperty('first_name', 'James');
            expect(res.body).toHaveProperty('last_name', 'Smith');
            expect(res.body).toHaveProperty('username', 'james123456789012345');
            expect(res.body).toHaveProperty('test', true);
        });
    });

    describe('Test POST /api/users/login', () => {
        it('should add new user', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james123456789012345',
                password: 'pass',
                dietary_preferences: '',
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            expect(res.status).toBe(200);

            const newData = {
                username: res.username,
                password: res.password
            }

            const newRes = await request
                .post('/api/users/login')
                .set('Content-Type', 'application/json')
                .send(newData);

            expect(newRes.status).toBe(200);
        });
    })
});