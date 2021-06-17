import _ from 'lodash';
import Restdone, {
  ActionOptions,
  Controller,
  ExpressTransportData,
  SocketIoTransportData,
  Transport,
} from 'restdone';
import app from 'app';
import { Schema } from 'mongoose';
import { ExtendedActionOptions, Scope, SocketHandshake } from '../domains/app';
import { AppControllerOptions, ExtendedExpressRequest } from '../domains/system';
import { ClientDocument } from '../domains/auth';
import { UserDocument } from '../domains/user';
import createAppError from './createAppError';

const { consts: { AUTH, RULES: { ALLOW_FOR_ADMIN_ONLY_RULE } } } = app;

const defaultAction: ExtendedActionOptions = {
  enabled: true,
  auth: [AUTH.BEARER],
};

/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     Bearer Token:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: You can obtain your token on /auth/login
 *     OauthSecurity:
 *       type: oauth2
 *       flows:
 *         password:
 *           refreshUrl: /oauth
 *           tokenUrl: /oauth
 *
 * tags:
 *  - name: Albums
 *    description: Operations available to Albums model
 *  - name: Chats
 *    description: Operations available to Chats model
 *  - name: Comments
 *    description: Operations available to Comments model
 *  - name: Feedbacks
 *    description: Operations available to Feedbacks model
 *  - name: Goals
 *    description: Operations available to Goals model
 *  - name: LiveStreams
 *    description: Operations available to LiveStreams model
 *  - name: Messages
 *    description: Operations available to Messages model
 *  - name: Meta
 *    description: Operations available to meta data
 *  - name: Notifications
 *    description: Operations available to Notifications model
 *  - name: OAuth
 *    description: Operations available to OAuth
 *  - name: Onboarding
 *    description: Operations available to Onboarding
 *  - name: Photos
 *    description: Operations available to Photos model
 *  - name: Reports
 *    description: Operations available to Reports model
 *  - name: Rewards
 *    description: Operations available to Rewards model
 *  - name: Sessions
 *    description: Operations available to Sessions model
 *  - name: Strikes
 *    description: Operations available to Strikes model
 *  - name: Subscribers
 *    description: Operations available to Subscribers
 *  - name: Upload
 *    description: Operations available to file uploading
 *  - name: Users
 *    description: Operations available to User model
 */

class BaseController<
M = any,
D = any,
R = any
> extends Restdone.Controller<M, D, R, Scope<M>> {
  static AUTH = AUTH;

  expandForAdmin?: boolean;

  constructor(options: Partial<AppControllerOptions>) {
    super(options || { actions: { default: defaultAction } });
  }

  static createAction(options: Partial<ActionOptions>): ActionOptions {
    return _.defaults(options, defaultAction);
  }

  static getName() {
    return this.name.charAt(0).toLowerCase() + this.name.replace('Controller', '').slice(1);
  }

  bind() {
    if (this.expandForAdmin) {
      const adminPaths = this.path.map((path) => `/admin${path}`);
      this.path.push(...adminPaths);
    }
    return super.bind();
  }

  requireAdmin(scope: Scope<M>) {
    if (!scope.isAdminMode) {
      throw createAppError(ALLOW_FOR_ADMIN_ONLY_RULE);
    }
  }

  getUserStrict(scope: Scope<M>) {
    const { user } = scope;
    if (!user) {
      throw new Error('No user');
    }
    return user;
  }

  requireUser(scope: Scope<M>) {
    this.getUserStrict(scope);
  }

  createScope(
    controller: Controller<M, D, R, Scope<M>>,
    transport: Transport<any>,
  ): Scope<M> {
    const result = super.createScope(controller, transport);

    result.isResourceOwner = function isResourceOwner(
      userId: Schema.Types.ObjectId | string,
      otherUserId: Schema.Types.ObjectId | string,
    ) {
      userId = userId.toString();
      otherUserId = otherUserId.toString();
      return userId === otherUserId;
    };

    result.overrideField = function overrideField(
      fieldName: string,
      value: any,
    ) {
      this.params[fieldName] = value;
      this.body[fieldName] = value;
    };

    if (transport.transportName === 'express') {
      const expressTransportData = <ExpressTransportData<ExtendedExpressRequest>>
        result.transportData;
      result.getUser = function getUser() {
        const { user } = expressTransportData.req;
        return user && !(user as ClientDocument).clientId ? <UserDocument>user : null;
      };
      result.setUser = function setUser() {
        // Do nothing, passport will inject user by access token in every request
      };
      result.getClient = function getClient() {
        const { user } = expressTransportData.req;
        return user && (user as ClientDocument).clientId ? <ClientDocument>user : null;
      };
      result.getLocale = function getLocale() {
        return expressTransportData.req.getLocale();
      };
      result.getReferrer = function getReferrer() {
        return expressTransportData.req.headers.referer || null;
      };
      result.getSocket = function getSocket() {
        return null;
      };
      // eslint-disable-next-line @typescript-eslint/naming-convention
      result._isAdminMode = function _isAdminMode() {
        // @ts-ignore
        return !!expressTransportData.req.adminMode;
      };
    } else if (transport.transportName === 'socket.io') {
      const socketIoTransportData = <SocketIoTransportData>result.transportData;
      result.user = null;
      result.getUser = function getUser() {
        return (<SocketHandshake>socketIoTransportData.socket.handshake).user;
      };
      result.getClient = function getClient() {
        return (<SocketHandshake>socketIoTransportData.socket.handshake).client;
      };
      result.setUser = function setUser(user) {
        // TODO: update it, when user is updated
        (<SocketHandshake>socketIoTransportData.socket.handshake).user = user;
        return user;
      };
      result.getReferrer = function getReferrer() {
        return socketIoTransportData.socket.request.headers.referer;
      };
      result.getLocale = function getLocale() {
        // TODO: implement
        return null;
      };
      result.getSocket = function getSocket() {
        return socketIoTransportData.socket;
      };
      // eslint-disable-next-line @typescript-eslint/naming-convention
      result._isAdminMode = function _isAdminMode() {
        return false;
      };
    } else {
      throw new Error(`Unsupported transport: ${transport.transportName}`);
    }

    Object.defineProperties(result, {
      user: {
        get() {
          return this.getUser();
        },
        set() {
          return this.setUser();
        },
      },
      client: {
        get() {
          return this.getClient();
        },
      },
      isAdminMode: {
        get() {
          return this._isAdminMode();
        },
      },
      locale: {
        get() {
          return this.getLocale();
        },
      },
      referrer: {
        get() {
          return this.getReferrer();
        },
      },
      socket: {
        get() {
          return this.getSocket();
        },
      },
    });

    return result;
  }
}

export default BaseController;
