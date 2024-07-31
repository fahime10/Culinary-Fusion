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
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james123456789012345',
                password: 'pass',
                passcode: 'pass',
                dietary_preferences: [],
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('token');
        });
    });

    describe('Test POST /api/users/add-user', () => {
        it('should not add new user (username missing)', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: '',
                password: 'pass',
                passcode: 'pass',
                dietary_preferences: [],
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            expect(res.status).toBe(400);
        });
    });

    describe('Test POST /api/users/login', () => {
        it('should login', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james12345678901',
                password: 'pass',
                passcode: 'pass',
                dietary_preferences: [],
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            expect(res.status).toBe(200);

            const newData = {
                username: 'james12345678901',
                password: 'pass'
            }

            const newRes = await request
                .post('/api/users/login')
                .set('Content-Type', 'application/json')
                .send(newData);

            expect(newRes.status).toBe(200);
        });
    });

    describe('Test POST /api/users/login', () => {
        it('should not login (wrong username)', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'james12345678901',
                password: 'pass',
                passcode: 'pass',
                dietary_preferences: [],
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            expect(res.status).toBe(200);

            const newData = {
                username: 'james12345678',
                password: 'pass'
            }

            const newRes = await request
                .post('/api/users/login')
                .set('Content-Type', 'application/json')
                .send(newData);

            // expect automatic 401 to indicate unauthorized access
            expect(newRes.status).toBe(401);
        });
    });

    describe('Test POST /api/users/:username', () => {
        it('should provide user details', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'jAmEs123456789012345',
                password: 'pass',
                passcode: 'pass',
                dietary_preferences: [],
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            expect(res.status).toBe(200);
            
            const newRes = await request
                .post(`/api/users/${data.username}`)
                .set('Content-Type', 'application/json');
            
            expect(newRes.status).toBe(200);
            expect(newRes.body).toHaveProperty('first_name', 'James');
            expect(newRes.body).toHaveProperty('last_name', 'Smith');
            expect(newRes.body).toHaveProperty('username', 'jAmEs123456789012345');
            expect(newRes.body.dietary_preferences).toEqual([]);
        });
    });

    describe('Test POST /api/users/edit-user/:username', () => {
        it('should edit user', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'jAs123456789012345',
                password: 'pass',
                passcode: 'pass',
                dietary_preferences: [],
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            expect(res.status).toBe(200);
            
            const newRes = await request
                .post(`/api/users/${data.username}`)
                .set('Content-Type', 'application/json');
            
            expect(newRes.status).toBe(200);
            
            const secondData = {
                name_title: 'Mr',
                first_name: 'John',
                last_name: 'S',
                username: 'jAs123456789012345',
                password: 'pass',
                passcode: 'pass',
                dietary_preferences: ['Dairy-free'],
                test: true
            }

            const extraRes = await request
                .post(`/api/users/edit-user/${data.username}`)
                .set('Content-Type', 'application/json')
                .send(secondData);

            expect(extraRes.status).toBe(200);
            expect(extraRes.body).toHaveProperty('message', 'Updated successfully');
            expect(extraRes.body).toHaveProperty('token');
        });
    });

    describe('Test POST /api/users/delete-user/:username', () => {
        it('should delete user', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'James',
                last_name: 'Smith',
                username: 'mEs1234567890123457',
                password: 'pass',
                passcode: 'pass',
                dietary_preferences: '',
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            expect(res.status).toBe(200);
            
            const newRes = await request
                .post(`/api/users/${data.username}`)
                .set('Content-Type', 'application/json');
            
            expect(newRes.status).toBe(200);
            
            await request
                .delete(`/api/users/delete-user/${data.username}`)
                .expect(204);

            const resQuery = await User.findOne({ username: data.username });
            expect(resQuery).toBeNull();
        });
    });

    describe('Test POST /api/forgotten-password/change', () => {
        it('should change the password', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'Jameson',
                last_name: 'Smith',
                username: 'Es1234567890123457',
                password: 'pass',
                passcode: 'pass',
                dietary_preferences: '',
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            expect(res.status).toBe(200);
            
            const newRes = await request
                .post(`/api/users/${data.username}`)
                .set('Content-Type', 'application/json');
            
            expect(newRes.status).toBe(200);

            const secondData = {
                username: 'Es1234567890123457',
                passcode: 'pass',
                new_password: 'password',
            };

            const extraRes = await request
                .post('/api/users/forgotten-password/change')
                .set('Content-Type', 'application/json')
                .send(secondData);

            expect(extraRes.status).toBe(200);
            expect(extraRes.body).toHaveProperty('message', 'Password updated');
        });
    });

    describe('Test POST /api/forgotten-password/change', () => {
        it('should not change the password (passcode is wrong)', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'Jameson',
                last_name: 'Smith',
                username: 's1234567890123457',
                password: 'pass',
                passcode: 'pass',
                dietary_preferences: '',
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            expect(res.status).toBe(200);
            
            const newRes = await request
                .post(`/api/users/${data.username}`)
                .set('Content-Type', 'application/json');
            
            expect(newRes.status).toBe(200);

            const secondData = {
                username: 's1234567890123457',
                passcode: 'password',
                new_password: 'password',
            };

            const extraRes = await request
                .post('/api/users/forgotten-password/change')
                .set('Content-Type', 'application/json')
                .send(secondData);

            expect(extraRes.status).toBe(401);
        });
    });

    describe('Test POST /api/forgotten-password/change', () => {
        it('should not change the password (username is wrong)', async () => {
            const data = {
                name_title: 'Mr',
                first_name: 'Jameson',
                last_name: 'Smith',
                username: 'qwe1234567890123457',
                password: 'pass',
                passcode: 'pass',
                dietary_preferences: '',
                test: true
            }
            
            const res = await request
                .post('/api/users/add-user')
                .set('Content-Type', 'application/json')
                .send(data);

            expect(res.status).toBe(200);
            
            const newRes = await request
                .post(`/api/users/${data.username}`)
                .set('Content-Type', 'application/json');
            
            expect(newRes.status).toBe(200);

            const secondData = {
                username: 'qwert1234567890123457',
                passcode: 'password',
                new_password: 'password',
            };

            const extraRes = await request
                .post('/api/users/forgotten-password/change')
                .set('Content-Type', 'application/json')
                .send(secondData);

            expect(extraRes.status).toBe(401);
        });
    });
});