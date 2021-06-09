import app from 'app';
import { expect } from 'chai';
import { UserDocument } from 'app/domains/user';
import specHelper from 'test/helper/specHelper';
import { ReviewDocument } from '../../app/domains/review';

const {
  modelProvider: {
    Review,
    User,
  },
  moleculerBroker,
  moleculerService,
} = app;

describe('Rating molecule', () => {
  before(() => moleculerService.startBrokerWithServices(['rating']));
  after(() => moleculerService.stopBroker());

  describe('rating.update', () => {
    let reviews: ReviewDocument[];
    let userDocument: UserDocument;

    specHelper.withUser({
      data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
    });
    specHelper.withUser({
      key: 'otherUser',
      data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2),
    });

    before(async function () {
      reviews = await Review.create([
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

    after(() => Promise.all(reviews.map((review) => review.remove())));

    before(function () {
      return moleculerBroker.call('rating.update', { targetUser: this.user._id });
    });

    before((done) => {
      setTimeout(done, 500);
    });

    before(async function () {
      userDocument = (await User.findById(this.user._id).lean())!;
    });

    it('rating should be 1.5', () => expect(userDocument.rating).to.be.equal(1.5));
  });
});
