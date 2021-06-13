import { Mongoose, Schema } from 'mongoose';
import validate from 'mongoose-validator';
import banContentPlugin from 'app/lib/restdone.plugin/banContent.restdone.plugin';
import arrayWithCounterPlugin from 'app/lib/restdone.plugin/array-with-counter.restdone.plugin';
import { PhotoDocument } from '../domains/photo';
import { StrikeTypeValues } from '../domains/strike';

const modelName = 'Photo';

const urlValidator = validate({
  validator: 'isURL',
  message: '{PATH} must be URL',
});

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     PhotoModel:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isCover:
 *           type: string
 *         watermarkUrl:
 *           type: string
 *         watermarkOpacity:
 *           type: integer
 *           enum:
 *             - 0
 *             - 1
 *             - 2
 *             - 3
 *             - 4
 *             - 5
 *         blurIntensity:
 *           type: integer
 *           enum:
 *             - 0
 *             - 1
 *             - 2
 *             - 3
 *             - 4
 *             - 5
 *         url:
 *           type: string
 *         publicUrl:
 *           type: string
 *     PhotoModelResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isCover:
 *           type: string
 *         watermarkUrl:
 *           type: string
 *         watermarkOpacity:
 *           type: integer
 *         blurIntensity:
 *           type: integer
 *         url:
 *           type: string
 *         publicUrl:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         owner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         viewsCounter:
 *           type: integer
 *         album:
 *           type: object
 *           $ref: '#/components/schemas/AlbumModelResponse'
 */

export default (mongoose: Mongoose) => {
  const schema = new Schema({
    name: {
      type: String,
      required: true,
    },
    description: String,
    isCover: String,
    watermarkUrl: {
      type: String,
      validate: urlValidator,
    },
    watermarkOpacity: {
      type: Number,
      min: 0,
      max: 5,
    },
    blurIntensity: {
      type: Number,
      min: 0,
      max: 5,
    },
    url: {
      type: String,
      required: true,
      validate: urlValidator,
    },
    publicUrl: {
      type: String,
      validate: urlValidator,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    album: {
      type: Schema.Types.ObjectId,
      ref: 'Album',
      required: true,
    },
    viewsCounter: {
      type: Number,
      default: 0,
    },
    banningReasonType: {
      type: String,
      enum: StrikeTypeValues,
    },
    banningReasonDescription: {
      type: String,
    },
  }, {
    timestamps: true,
  });

  schema.plugin(arrayWithCounterPlugin.mongoose, {
    array: {
      path: 'favoritedUsers',
      options: [{
        ref: 'User',
      }],
    },
    mongoose,
  });

  schema.statics.findFavoritePhotosForUser = async function findFavoritePhotosForUser(
    userId: string,
  ) {
    const query = { favoritedUsers: { $in: [userId] } };
    const photos = await mongoose.model('Photo').find(query).lean();

    return photos;
  };

  schema.pre<PhotoDocument>('save', function preSave(next) {
    this.wasNew = this.isNew;
    next();
  });

  /**
   * suspendedAt: Date,
   */
  schema.plugin(banContentPlugin.mongoose);

  return mongoose.model<PhotoDocument>(modelName, schema);
};
