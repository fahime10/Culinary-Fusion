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

    describe('Test POST /api/groups/create', () => {
        it('should not add new group (user not found)', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james1234567wui',
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
                user_id: "aaaaaaaaaaaaaaaaaaaaaaaa",
                group_name: 'Group123456789',
                group_description: 'test group',
                test: true
            };

            const res = await request
                .post('/api/groups/create')
                .set('Content-Type', 'application/json')
                .send(secondData);
            
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty('error', 'User not found');
        });
    });

    describe('Test POST /api/groups/create', () => {
        it('should not add new group (group already exists)', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james1234567wui',
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
            

            const thirdData = {
                user_id: user_id,
                group_name: 'Group123456789',
                group_description: 'test group',
                test: true
            };

            const secondRes = await request
                .post('/api/groups/create')
                .set('Content-Type', 'application/json')
                .send(thirdData);

            expect(secondRes.status).toBe(400);
            expect(secondRes.body).toHaveProperty('error', 'A group with that name already exists');
        });
    });

    describe('Test POST /api/groups/edit/:id', () => {
        it('should edit group', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james14567wuive',
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

            const thirdData = {
                user_id: user_id,
                group_name: 'Group54321',
                group_description: 'testing group',
                test: true
            };

            const secondRes = await request
                .post(`/api/groups/edit/${res.body._id}`)
                .set('Content-Type', 'application/json')
                .send(thirdData);

            expect(secondRes.status).toBe(200);
            expect(secondRes.body).toHaveProperty('group_name', 'Group54321');
            expect(secondRes.body).toHaveProperty('group_description', 'testing group');
            expect(secondRes.body).toHaveProperty('test', true);
        });
    });

    describe('Test POST /api/groups/edit/:id', () => {
        it('should not edit group (username is wrong)', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james1234567we',
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

            const thirdData = {
                user_id: "aaaaaaaaaaaaaaaaaaaaaaaa",
                group_name: 'Group54321',
                group_description: 'testing group',
                test: true
            };

            const secondRes = await request
                .post(`/api/groups/edit/${res.body._id}`)
                .set('Content-Type', 'application/json')
                .send(thirdData);

            expect(secondRes.status).toBe(404);
            expect(secondRes.body).toHaveProperty('error', 'User not found');
        });
    });
    
    describe('Test DELETE /api/groups/delete/:id', () => {
        it('should delete group', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james4567we',
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

            const secondRes = await request
                .delete(`/api/groups/delete/${res.body._id}`);

            expect(secondRes.status).toBe(200);
            expect(secondRes.body).toHaveProperty('message', 'Group deleted successfully');
        });
    });
});