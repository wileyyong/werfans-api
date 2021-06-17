/**
 * Created by mk on 02/07/16.
 */

import crypto from 'crypto';
import { URL } from 'url';
import { Model as MongooseModel, Schema } from 'mongoose';
import { Controller } from 'restdone';
import app from 'app';

import createAppError from 'app/lib/createAppError';
import fromCallback from 'app/lib/helpers/fromCallback';
import verificationConsts from './emailVerification.consts';
import { Scope } from '../../../domains/app';
import { UserDocument } from '../../../domains/user';
import { EmailType } from '../../../domains/email';

const {
  RULES: {
    ALREADY_VERIFIED_RULE,
    WRONG_TOKEN_RULE,
  },
} = verificationConsts;

const { config } = app;

export interface RestdoneOptions {
  Model: MongooseModel<any>;
}

function mongooseFn(schema: Schema) {
  schema.add({
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerification: {
      token: String,
      expires: Date,
    },
  });
}

function restdoneFn(restdoneController: Controller, options: RestdoneOptions) {
  const { Model } = options;

  // @ts-ignore
  restdoneController.sendEmailVerification = async function sendEmailVerification(
    scope: Scope,
    user: UserDocument,
  ) {
    const buffer: Buffer = await fromCallback((callback) => {
      crypto.randomBytes(20, callback);
    });

    user.emailVerification = {
      token: buffer.toString('hex'),
      expires: `${Date.now() + (1000 * config.security.emailVerificationTokenLife)}`,
    };

    const { origin } = new URL(scope.referrer || '');
    const baseUrl = `${origin}/${config.urls.verifyEmail}`;

    await user.save();
    await app.emailService.sendEmail(
      EmailType.EmailVerification,
      {
        email: user.email,
        payload: {
          baseUrl,
          email: user.email,
          token: user.emailVerification.token,
        },
      },
    );
  };

  restdoneController.actions.resendVerification = restdoneController.normalizeAction({
    auth: ['bearer'],
    method: 'put',
    path: 'resend-verification',
    priority: -1,
    handler: async function resendVerification(scope: Scope) {
      const { user } = scope;

      if (user!.emailVerified) {
        throw createAppError(ALREADY_VERIFIED_RULE);
      }

      await this.sendEmailVerification(scope, user!);

      return undefined;
    },
  }, 'resendVerification');

  restdoneController.actions.verifyEmail = restdoneController.normalizeAction({
    auth: ['oauth2-client-password'],
    method: 'post',
    path: 'verify-email/:token',
    handler: async function verifyEmail(scope: Scope) {
      const { params: { token } } = scope;

      const user = await Model
        .findOne({
          'emailVerification.token': token,
          'emailVerification.expires': {
            $gt: new Date(),
          },
        });
      if (!user) {
        throw createAppError(WRONG_TOKEN_RULE);
      }

      user.emailVerified = true;
      user.emailVerification = undefined;
      await user.save();
      return undefined;
    },
  }, 'verifyEmail');
}

const plugin = {
  mongoose: mongooseFn,
  restdone: restdoneFn,
};

export default plugin;
