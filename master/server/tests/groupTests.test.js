const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app.js');
const Group = require('../models/groupModel.js');
const User = require('../models/userModel.js');

const jwt = require('jsonwebtoken');

const request = supertest(app);

describe('Testing Group API', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MongoDB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    afterEach(async () => {
        await User.deleteMany({ test: true });
        await Group.deleteMany({ test: true });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('Test POST /api/groups/create', () => {
        it('should add new group', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james1234567wuive',
                password: 'pass',
                passcode: 'pass',
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
                group_name: 'Group123456789',
                group_description: 'test group',
                test: true
            };

            const res = await request
                .post('/api/groups/create')
                .set('Content-Type', 'application/json')
                .send(secondData);
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('group_name', 'Group123456789');
            expect(res.body).toHaveProperty('group_description', 'test group');
            expect(res.body).toHaveProperty('test', true);
        });
    });
});