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
const testConfig = require('test/config');
const specHelper = require('test/helper/specHelper');
const { expect } = chakram;
describe('LiveStream Viewers', () => {
    const adminUser = specHelper.getDefaultAdminUser();
    const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1);
    const ownerUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2);
    const liveStream = specHelper.getFixture(specHelper.FIXTURE_TYPES.LIVE_STREAM);
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        yield specHelper.signInUser(adminUser);
        yield Promise.all([user, ownerUser]
            .map((currentUser) => specHelper.createUser(currentUser, true)));
        yield specHelper.createLiveStream(ownerUser, liveStream);
    }));
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all([user, ownerUser]
            .map((currentUser) => specHelper.removeUser(currentUser)));
        yield specHelper.removeLiveStream(liveStream);
    }));
    describe('PutViewers', () => {
        describe('right user', () => {
            let response;
            before('send request', () => __awaiter(void 0, void 0, void 0, function* () {
                response = yield chakram.put(`${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers/me`, {}, { headers: { Authorization: `Bearer ${user.auth.access_token}` } });
            }));
            it('should return status 201', () => expect(response).to.have.status(201));
            it('should be an array', () => expect(response.body).to.be.instanceof(Array));
            it('should contain 1 item', () => expect(response.body.length).to.be.equal(1));
            it('_id should contain the same _id', () => expect(response.body[0]).to.be.equal(user._id));
        });
        describe('wrong user', () => {
            let response;
            before('send request', () => __awaiter(void 0, void 0, void 0, function* () {
                response = yield chakram.put(`${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers/${ownerUser._id}`, {}, { headers: { Authorization: `Bearer ${user.auth.access_token}` } });
            }));
            it('should return status 403', () => expect(response).to.have.status(403));
        });
        describe('unauthorized users', () => {
            let response;
            before('send request', () => __awaiter(void 0, void 0, void 0, function* () {
                response = yield chakram.put(`${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers/me`, {});
            }));
            it('should return status 401', () => expect(response).to.have.status(401));
        });
    });
    describe('GetViewers', () => {
        let response;
        before('send request', () => __awaiter(void 0, void 0, void 0, function* () {
            response = yield chakram.get(`${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers`, {
                headers: {
                    Authorization: `Bearer ${user.auth.access_token}`,
                },
            });
        }));
        it('should return status 200', () => expect(response).to.have.status(200));
        it('should be an array', () => expect(response.body).to.be.instanceof(Array));
        it('should contain 1 item', () => expect(response.body.length).to.be.equal(1));
        it('_id should contain the same _id', () => expect(response.body[0]).to.be.equal(user._id));
    });
    describe('RemoveViewer', () => {
        describe('right user', () => {
            let response;
            before('send request', () => __awaiter(void 0, void 0, void 0, function* () {
                response = yield chakram.delete(`${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers/me`, {}, {
                    headers: {
                        Authorization: `Bearer ${user.auth.access_token}`,
                    },
                });
            }));
            it('should return status 404', () => expect(response).to.have.status(404));
        });
        describe('wrong user', () => {
            let response;
            before('send request', () => __awaiter(void 0, void 0, void 0, function* () {
                response = yield chakram.delete(`${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers/${ownerUser._id}`, {}, { headers: { Authorization: `Bearer ${user.auth.access_token}` } });
            }));
            it('should return status 404', () => expect(response).to.have.status(404));
        });
        describe('unauthorized users', () => {
            let response;
            before('send request', () => __awaiter(void 0, void 0, void 0, function* () {
                response = yield chakram.delete(`${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers/me`, {});
            }));
            it('should return status 404', () => expect(response).to.have.status(404));
        });
    });
});
//# sourceMappingURL=liveStream-viewers.spec.js.map