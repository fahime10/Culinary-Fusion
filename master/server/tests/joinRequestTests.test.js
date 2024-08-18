const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app.js');
const JoinRequest = require('../models/joinRequestModel.js');
const User = require('../models/userModel.js');
const Group = require('../models/groupModel.js');

const jwt = require('jsonwebtoken');

const request = supertest(app);

describe('Testing JoinRequest API', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MongoDB, {
            userNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    afterEach(async () => {
        await User.deleteMany({ test : true });
        await Group.deleteMany({ test: true });
        await JoinRequest.deleteMany({ test: true });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    describe('Test POST /api/join-requests/create/:id', () => {
        it('should create a new join request', async () => {
            const firstUserData = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james1234567wujoe',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: [],
                test: true
            };

            const firstUser = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(firstUserData);
            
            const firstToken = firstUser.body.token;

            expect(firstUser.status).toBe(200);
        
            const decoded = jwt.decode(firstToken);
            const user_id = decoded.id;

            const secondUserData = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james1234567vue',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: [],
                test: true
            };

            const secondUser = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(secondUserData);
            
            const secondToken = secondUser.body.token;

            expect(secondUser.status).toBe(200);
        
            const secondDecoded = jwt.decode(secondToken);
            const recipient_username = secondDecoded.username;

            const groupData = {
                user_id: user_id,
                group_name: 'Group123456gcu',
                group_description: 'test group',
                test: true
            };

            const res = await request
                .post('/api/groups/create')
                .set('Content-Type', 'application/json')
                .send(groupData);
            
            expect(res.status).toBe(200);

            const usernames = [{ id: 1, value: recipient_username }];

            const joinRequestData = {
                user_id: decoded.id,
                usernames: JSON.stringify(usernames),
                test: true
            };

            const secondRes = await request
                .post(`/api/join-requests/create/${groupData.group_name}`)
                .set('Content-Type', 'application/json')
                .send(joinRequestData);

            
            expect(secondRes.status).toBe(200);
            expect(secondRes.body).toHaveProperty('message', 'Requests have been sent');
        });
    });

    describe('Test POST /api/join-requests/create/:id', () => {
        it('should create a new join request for multiple users', async () => {
            const firstUserData = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james1234567wuooe',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: [],
                test: true
            };

            const firstUser = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(firstUserData);
            
            const firstToken = firstUser.body.token;

            expect(firstUser.status).toBe(200);
        
            const decoded = jwt.decode(firstToken);
            const user_id = decoded.id;

            const secondUserData = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james1234567bvvue',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: [],
                test: true
            };

            const secondUser = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(secondUserData);
            
            const secondToken = secondUser.body.token;

            expect(secondUser.status).toBe(200);
        
            const secondDecoded = jwt.decode(secondToken);
            const first_recipient_username = secondDecoded.username;

            const thirdUserData = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james1234567bvlke',
                password: 'pass',
                email: 'random@gmail.com',
                passcode: '',
                dietary_preferences: [],
                test: true
            };

            const thirdUser = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(thirdUserData);
            
            const thirdToken = secondUser.body.token;

            expect(thirdUser.status).toBe(200);
        
            const thirdDecoded = jwt.decode(thirdToken);
            const second_recipient_username = thirdDecoded.username;

            const groupData = {
                user_id: user_id,
                group_name: 'Group123456gpu',
                group_description: 'test group',
                test: true
            };

            const res = await request
                .post('/api/groups/create')
                .set('Content-Type', 'application/json')
                .send(groupData);
            
            expect(res.status).toBe(200);

            const usernames = [{ id: 1, value: first_recipient_username }, { id: 2, value: second_recipient_username }];

            const joinRequestData = {
                user_id: decoded.id,
                usernames: JSON.stringify(usernames),
                test: true
            };

            const secondRes = await request
                .post(`/api/join-requests/create/${groupData.group_name}`)
                .set('Content-Type', 'application/json')
                .send(joinRequestData);

            
            expect(secondRes.status).toBe(200);
            expect(secondRes.body).toHaveProperty('message', 'Requests have been sent');

            const first_recipient = {
                username: first_recipient_username
            };

            const second_recipient = {
                username: second_recipient_username
            };

            const fourthRes = await request
                .post('/api/join-requests')
                .set('Content-Type', 'application/json')
                .send(first_recipient);

            expect(fourthRes.status).toBe(200);
            expect(fourthRes.body.length).toBeGreaterThan(0);

            const fifthRes = await request
                .post('/api/join-requests')
                .set('Content-Type', 'application/json')
                .send(second_recipient);

            expect(fifthRes.status).toBe(200);
            expect(fifthRes.body.length).toBeGreaterThan(0);
        });

        describe('Test POST /api/join-requests/create/:id', () => {
            it('should not create a join request (username does not exist)', async () => {
                const firstUserData = {
                    name_title: 'Mr',
                    first_name: 'James',
                    last_name: 'Smith',
                    username: 'james1234567wujoe',
                    password: 'pass',
                    email: 'random@gmail.com',
                    passcode: '',
                    dietary_preferences: [],
                    test: true
                };
    
                const firstUser = await request
                    .post('/api/users/add-user')
                    .set('Content-Type', 'application/json')
                    .send(firstUserData);
                
                const firstToken = firstUser.body.token;
    
                expect(firstUser.status).toBe(200);
            
                const decoded = jwt.decode(firstToken);
                const user_id = decoded.id;
    
                const secondUserData = {
                    name_title: 'Mr',
                    first_name: 'James',
                    last_name: 'Smith',
                    username: 'james1289al',
                    password: 'pass',
                    email: 'random@gmail.com',
                    passcode: '',
                    dietary_preferences: [],
                    test: true
                };
    
                const secondUser = await request
                    .post('/api/users/add-user')
                    .set('Content-Type', 'application/json')
                    .send(secondUserData);
                
                const secondToken = secondUser.body.token;
    
                expect(secondUser.status).toBe(200);
            
                const secondDecoded = jwt.decode(secondToken);
                const recipient_username = secondDecoded.username + 'w';
    
                const groupData = {
                    user_id: user_id,
                    group_name: 'Group123456gcu',
                    group_description: 'test group',
                    test: true
                };
    
                const res = await request
                    .post('/api/groups/create')
                    .set('Content-Type', 'application/json')
                    .send(groupData);
                
                expect(res.status).toBe(200);
    
                const usernames = [{ id: 1, value: recipient_username }];
    
                const joinRequestData = {
                    user_id: decoded.id,
                    usernames: JSON.stringify(usernames),
                    test: true
                };
    
                const secondRes = await request
                    .post(`/api/join-requests/create/${groupData.group_name}`)
                    .set('Content-Type', 'application/json')
                    .send(joinRequestData);
    
                
                expect(secondRes.status).toBe(200);
                expect(secondRes.body).toHaveProperty('message', 'Requests have been sent');

                const recipient = {
                    username: secondDecoded.username
                };

                const thirdRes = await request
                    .post('/api/join-requests')
                    .set('Content-Type', 'application/json')
                    .send(recipient);

                expect(thirdRes.status).toBe(200);
                expect(thirdRes.body.length).toBe(0);
            });
        });

        describe('Test POST /api/join-requests/accept-request/:id', () => {
            it('should accept a join request', async () => {
                const firstUserData = {
                    name_title: 'Mr',
                    first_name: 'James',
                    last_name: 'Smith',
                    username: 'james1234567wuje',
                    password: 'pass',
                    email: 'random@gmail.com',
                    passcode: '',
                    dietary_preferences: [],
                    test: true
                };
    
                const firstUser = await request
                    .post('/api/users/add-user')
                    .set('Content-Type', 'application/json')
                    .send(firstUserData);
                
                const firstToken = firstUser.body.token;
    
                expect(firstUser.status).toBe(200);
            
                const decoded = jwt.decode(firstToken);
                const user_id = decoded.id;
    
                const secondUserData = {
                    name_title: 'Mr',
                    first_name: 'James',
                    last_name: 'Smith',
                    username: 'james12347vue',
                    password: 'pass',
                    email: 'random@gmail.com',
                    passcode: '',
                    dietary_preferences: [],
                    test: true
                };
    
                const secondUser = await request
                    .post('/api/users/add-user')
                    .set('Content-Type', 'application/json')
                    .send(secondUserData);
                
                const secondToken = secondUser.body.token;
    
                expect(secondUser.status).toBe(200);
            
                const secondDecoded = jwt.decode(secondToken);
                const recipient_username = secondDecoded.username;
    
                const groupData = {
                    user_id: user_id,
                    group_name: 'Group123456gcu',
                    group_description: 'test group',
                    test: true
                };
    
                const res = await request
                    .post('/api/groups/create')
                    .set('Content-Type', 'application/json')
                    .send(groupData);
                
                expect(res.status).toBe(200);
    
                const usernames = [{ id: 1, value: recipient_username }];
    
                const joinRequestData = {
                    user_id: decoded.id,
                    usernames: JSON.stringify(usernames),
                    test: true
                };
    
                const secondRes = await request
                    .post(`/api/join-requests/create/${groupData.group_name}`)
                    .set('Content-Type', 'application/json')
                    .send(joinRequestData);
    
                
                expect(secondRes.status).toBe(200);
                
                const acceptRequestData = {
                    group_id: res.body._id,
                    user_id: decoded.id,
                    username: secondDecoded.username
                };

                const joinRequest = await JoinRequest.findOne({ user_id: user_id });

                const thirdRes = await request
                    .post(`/api/join-requests/accept-request/${joinRequest._id}`)
                    .set('Content-Type', 'application/json')
                    .send(acceptRequestData);

                expect(thirdRes.status).toBe(200);
                expect(thirdRes.body).toHaveProperty('message', `Request accepted to join ${res.body.group_name}`);
            });
        });

        describe('Test POST /api/join-requests/delete-request/:id', () => {
            it('should refuse a join request', async () => {
                const firstUserData = {
                    name_title: 'Mr',
                    first_name: 'James',
                    last_name: 'Smith',
                    username: 'james123567wuje',
                    password: 'pass',
                    email: 'random@gmail.com',
                    passcode: '',
                    dietary_preferences: [],
                    test: true
                };
    
                const firstUser = await request
                    .post('/api/users/add-user')
                    .set('Content-Type', 'application/json')
                    .send(firstUserData);
                
                const firstToken = firstUser.body.token;
    
                expect(firstUser.status).toBe(200);
            
                const decoded = jwt.decode(firstToken);
                const user_id = decoded.id;
    
                const secondUserData = {
                    name_title: 'Mr',
                    first_name: 'James',
                    last_name: 'Smith',
                    username: 'jame12347vue',
                    password: 'pass',
                    email: 'random@gmail.com',
                    passcode: '',
                    dietary_preferences: [],
                    test: true
                };
    
                const secondUser = await request
                    .post('/api/users/add-user')
                    .set('Content-Type', 'application/json')
                    .send(secondUserData);
                
                const secondToken = secondUser.body.token;
    
                expect(secondUser.status).toBe(200);
            
                const secondDecoded = jwt.decode(secondToken);
                const recipient_username = secondDecoded.username;
    
                const groupData = {
                    user_id: user_id,
                    group_name: 'Group12456gcu',
                    group_description: 'test group',
                    test: true
                };
    
                const res = await request
                    .post('/api/groups/create')
                    .set('Content-Type', 'application/json')
                    .send(groupData);
                
                expect(res.status).toBe(200);
    
                const usernames = [{ id: 1, value: recipient_username }];
    
                const joinRequestData = {
                    user_id: decoded.id,
                    usernames: JSON.stringify(usernames),
                    test: true
                };
    
                const secondRes = await request
                    .post(`/api/join-requests/create/${groupData.group_name}`)
                    .set('Content-Type', 'application/json')
                    .send(joinRequestData);
                
                expect(secondRes.status).toBe(200);
                
                const acceptRequestData = {
                    group_id: res.body._id,
                    user_id: decoded.id,
                    username: secondDecoded.username
                };

                const joinRequest = await JoinRequest.findOne({ user_id: user_id });

                const thirdRes = await request
                    .post(`/api/join-requests/delete-request/${joinRequest._id}`)
                    .set('Content-Type', 'application/json')
                    .send(acceptRequestData);

                expect(thirdRes.status).toBe(200);
                expect(thirdRes.body).toHaveProperty('message', `Request refused to join ${res.body.group_name}`);
            });
        });
    });
});