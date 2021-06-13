import _ from 'lodash';
import { NextFunction, Response } from 'express';
import { Request } from 'express-serve-static-core';
import Restdone from 'restdone';
import { App, AuthOptions, ExtendedActionOptions } from '../domains/app';
import { ExtendedExpressApplication, ExtendedExpressRequest } from '../domains/system';
import { UserDocument, UserDomain } from '../domains/user';
import { ClientDocument, ClientDomain } from '../domains/auth';
import createAppError from '../lib/createAppError';

const { ExpressTransport, SocketIoTransport } = Restdone;

export default (
  expressApp: ExtendedExpressApplication,
  app: App,
) => {
  const {
    config: { banningStrategy: { endpointWhitelist } },
    consts: { AUTH, RULES: { FORBIDDEN_FOR_BANNED_USER } },
    restControllers: Controllers,
  } = app;
  const log = app.createLog(module);
  const expressTransport = new ExpressTransport({ app: expressApp });

  function prepareAuth(options: { auth?: AuthOptions | AuthOptions[] }) {
    if (options.auth) {
      // make options.auth to be an array
      if (!Array.isArray(options.auth)) {
        options.auth = [options.auth];
      } else {
        options.auth = _.uniq(options.auth);
      }

      const auth = <AuthOptions[]>options.auth;

      // always add basic auth to client auth
      if (auth.includes(AUTH.CLIENT) && !auth.includes(AUTH.BASIC)) {
        auth.push(AUTH.BASIC);
      }
    }
  }

  function isBannedUser(req: Request) {
    // @ts-ignore
    const { user } = req;
    return user && !(<ClientDomain>user).clientId && (<UserDomain>user).suspendedAt;
  }

  const isWhitelisted = (req: Request) => endpointWhitelist.includes(req.path);

  // @ts-ignore
  expressTransport.getAuth = function getAuth(options: ExtendedActionOptions) {
    prepareAuth(options);
    const auths = [
      // TODO: Improve typing for oAuthdone
      expressApp.oAuthdone.authenticate(options.auth as AuthOptions),
      (req: Request, res: Response, next: NextFunction) => {
        if (isBannedUser(req) && !isWhitelisted(req)) {
          next(createAppError(FORBIDDEN_FOR_BANNED_USER));
        } else {
          next();
        }
      },
      (
        req: Request & { adminMode?: boolean, user?: UserDocument | ClientDocument },
        res: Response,
        next: NextFunction,
      ) => {
        req.adminMode = false;

        const matchingPath = req.url.match(/^\/admin/);
        if (!matchingPath) {
          return next();
        }

        const { user } = req;
        if (!user
          || (<ClientDocument>user).clientId
          || !(<UserDocument>user).isAdmin
          || !(<UserDocument>user).isAdmin()
        ) {
          return res
            .status(403)
            .send({
              message: 'Allowable for admins only',
            });
        }

        req.adminMode = true;
        return next();
      },
      (req: ExtendedExpressRequest, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
          // options
          return res.status(401).send({
            message: 'User is not logged in',
          });
        }

        return next();
      },
    ];
    return options.auth
      ? auths
      : (req: Express.Request, res: Express.Response, callback: () => void) => {
        callback();
      };
  };

  const socketIoTransport = new SocketIoTransport({
    sio: app.sio,
  });

  const restdone = new Restdone({
    transports: [expressTransport, socketIoTransport],
    // @ts-ignore
    log,
  });

  Controllers.forEach((ControllerClass) => {
    restdone.addController(ControllerClass);
  });

  app.registerProvider('restdone', restdone);
};
