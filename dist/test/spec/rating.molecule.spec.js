"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("app"));
const chai_1 = require("chai");
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const { modelProvider: { Review, User, }, moleculerBroker, moleculerService, } = app_1.default;
describe('Rating molecule', () => {
    before(() => moleculerService.startBrokerWithServices(['rating']));
    after(() => moleculerService.stopBroker());
    describe('rating.update', () => {
        let reviews;
        let userDocument;
        specHelper_1.default.withUser({
            data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
        });
        specHelper_1.default.withUser({
            key: 'otherUser',
            data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2),
        });
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                reviews = yield Review.create([
                    {
                        targetUser: this.user._id,
                        author: this.otherUser._id,
                        rating: 2,
                        body: 'body 1',
                    },
                    {
                        targetUser: this.user._id,
                        author: this.otherUser._id,
                        rating: 1,
                        body: 'body 2',
                    },
                    {
                        targetUser: this.otherUser._id,
                        author: this.user._id,
                        rating: 5,
                        body: 'body 3',
                    },
                ]);
            });
        });
        after(() => Promise.all(reviews.map((review) => review.remove())));
        before(function () {
            return moleculerBroker.call('rating.update', { targetUser: this.user._id });
        });
        before((done) => {
            setTimeout(done, 500);
        });
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                userDocument = (yield User.findById(this.user._id).lean());
            });
        });
        it('rating should be 1.5', () => chai_1.expect(userDocument.rating).to.be.equal(1.5));
    });
});
//# sourceMappingURL=rating.molecule.spec.js.map