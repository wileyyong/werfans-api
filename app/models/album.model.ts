import { Mongoose, Schema } from 'mongoose';
import validate from 'mongoose-validator';
import banContentPlugin from 'app/lib/restdone.plugin/banContent.restdone.plugin';
import arrayWithCounterPlugin from 'app/lib/restdone.plugin/array-with-counter.restdone.plugin';
import { AlbumDocument } from '../domains/album';
import { StrikeTypeValues } from '../domains/strike';

const modelName = 'Album';

const urlValidator = validate({
  validator: 'isURL',
  message: '{PATH} must be URL',
});

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     AlbumModel:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         coverUrl:
 *           type: string
 *         price:
 *           type: integer
 *     AlbumModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         coverUrl:
 *           type: string
 *         price:
 *           type: integer
 *         photosCounter:
 *           type: integer
 *         viewsCounter:
 *           type: integer
 *         owner:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     AlbumModelResponseList:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         coverUrl:
 *           type: string
 *         price:
 *           type: integer
 *         photosCounter:
 *           type: integer
 *         viewsCounter:
 *           type: integer
 *         owner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

export default (mongoose: Mongoose) => {
  const schema = new Schema({
    name: {
      type: String,
      required: true,
    },
    coverUrl: {
      type: String,
      validate: urlValidator,
    },
    price: {
      type: Number,
      required: true,
    },
    photosCounter: {
      type: Number,
      default: 0,
    },
    viewsCounter: {
      type: Number,
      default: 0,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

  schema.statics.findFavoriteAlbumsForUser = async function findFavoriteAlbumsForUser(
    userId: string,
  ): Promise<AlbumDocument[]> {
    const query = { favoritedUsers: { $in: [userId] } };
    const albums = await mongoose.model('Album').find(query).lean();

    return albums;
  };

  schema.statics.incPhotoCounter = async function incPhotoCounter(
    id: string, value: number,
  ): Promise<AlbumDocument> {
    return this
      .updateOne(
        { _id: id },
        { $inc: { photosCounter: value } },
      );
  };

  schema.plugin(arrayWithCounterPlugin.mongoose, {
    array: {
      path: 'favoritedUsers',
      options: [{
        ref: 'User',
      }],
    },
    mongoose,
  });

  /**
   * suspendedAt: Date,
   */
  schema.plugin(banContentPlugin.mongoose);

  return mongoose.model<AlbumDocument>(modelName, schema);
};
