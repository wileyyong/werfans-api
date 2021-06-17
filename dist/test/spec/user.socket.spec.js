'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const chakram = require('chakram');
const specHelper = require('test/helper/specHelper');
const { expect } = chakram;
describe('User Socket', () => {
    const adminUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
    const otherAdminUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
    const defaultAdminUser = specHelper.getDefaultAdminUser();
    before('sign in admin', () => specHelper.signInUser(defaultAdminUser));
    let defaultAdminUserSocket;
    let adminUserSocket;
    before('connect', () => __awaiter(void 0, void 0, void 0, function* () {
        defaultAdminUserSocket = yield specHelper.connectToSocket({
            extraHeaders: { Authorization: `Bearer ${defaultAdminUser.auth.access_token}` },
        });
    }));
    describe('Sign up', () => {
        let response;
        before('send request', (done) => {
            defaultAdminUserSocket.once('restdone', (data) => {
                response = data.result;
                done();
            });
            defaultAdminUserSocket.emit('restdone', {
                route: 'post:/users',
                body: adminUser,
            });
        });
        it('should return status 201', () => expect(response.statusCode).to.be.equal(201));
        it('should contain _id', () => {
            adminUser._id = response.body._id;
            return expect(response.body._id).to.exist;
        });
    });
    describe('Get adminUser list', () => {
        let response;
        before('create and sign in adminUser', () => specHelper.signInUser(adminUser));
        before('create and sign in adminUser', () => __awaiter(void 0, void 0, void 0, function* () {
            adminUserSocket = yield specHelper.connectToSocket({
                extraHeaders: { Authorization: `Bearer ${adminUser.auth.access_token}` },
            });
        }));
        before('create and sign in otherAdminUser', () => __awaiter(void 0, void 0, void 0, function* () {
            yield specHelper.createUser(otherAdminUser);
            return specHelper.signInUser(otherAdminUser);
        }));
        before('send request', (done) => {
            adminUserSocket.once('restdone', (data) => {
                response = data.result;
                done();
            });
            adminUserSocket.emit('restdone', { route: 'get:/users' });
        });
        it('should return status 403', () => expect(response.statusCode).to.be.equal(403));
    });
    describe('Get Profile', () => {
        let response;
        before('send request', (done) => {
            adminUserSocket.once('restdone', (data) => {
                response = data.result;
                done();
            });
            adminUserSocket.emit('restdone', { route: 'get:/users/:_id', params: { _id: 'me' } });
        });
        it('should return status 200', () => expect(response.statusCode).to.be.equal(200));
        it('should be the same _id', () => expect(response.body._id).to.be.equal(adminUser._id));
        it('should be the same username', () => expect(response.body.username).to.be.equal(adminUser.username.toLowerCase()));
        it('should be the same email', () => expect(response.body.email).to.be.equal(adminUser.email));
    });
    describe('Change Profile', () => {
        const NEW_VALUE = 'new@email.com';
        let response;
        before('send request', (done) => {
            adminUserSocket.once('restdone', (data) => {
                response = data.result;
                done();
            });
            adminUserSocket.emit('restdone', {
                route: 'patch:/users/:_id',
                params: { _id: 'me' },
                body: {
                    email: NEW_VALUE,
                },
            });
        });
        it('should return status 200', () => expect(response.statusCode).to.be.equal(200));
        it('should change email', () => expect(response).to.have.json('email', NEW_VALUE));
    });
    describe('Remove Profile', () => {
        let response;
        before('send request', (done) => {
            adminUserSocket.once('restdone', (data) => {
                response = data.result;
                done();
            });
            adminUserSocket.emit('restdone', { route: 'delete:/users/:_id', params: { _id: 'me' } });
        });
        it('should return status 204', () => expect(response.statusCode).to.be.equal(204));
    });
    after('remove adminUser', () => specHelper.removeUser(adminUser));
    after('remove otherAdminUser', () => specHelper.removeUser(otherAdminUser));
});
//# sourceMappingURL=user.socket.spec.js.map