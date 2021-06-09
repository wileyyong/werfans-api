/**
 * Created by mk on 09/12/18.
 */

'use strict';

const _ = require('lodash');
const Controldone = require('controldone');

const { consts: { AUTH } } = require('app/app');

const defaultAction = {
  enabled: true,
  auth: [AUTH.BEARER],
};

class BaseControldoneController extends Controldone.Controller {
  constructor(options) {
    super(options || { actions: { default: defaultAction } });
  }

  static createAction(options) {
    return _.defaults(options, defaultAction);
  }

  static getName() {
    return this.name.charAt(0).toLowerCase() + this.name.replace('Controller', '').slice(1);
  }

  createScope(controller, transport) {
    const result = super.createScope(controller, transport);

    result.isResourceOwner = function isResourceOwner(userId, otherUserId) {
      userId = userId.toString();
      otherUserId = otherUserId.toString();
      return userId === otherUserId;
    };

    if (transport.transportName === 'express') {
      result.getUser = function getUser() {
        return result.transportData.req.user;
      };
      result.setUser = function setUser() {
        // Do nothing, passport will inject user by access token in every request
      };
      result.getClient = function getClient() {
        const user = this.getUser();
        return user && user.clientId ? user : undefined;
      };
      result.getLocale = function getLocale() {
        return result.transportData.req.getLocale();
      };
      result.getReferrer = function getReferrer() {
        return result.transportData.req.headers.referer;
      };
      result.getSocket = function getSocket() {
        return null;
      };
    } else if (transport.transportName === 'socket.io') {
      result.user = false;
      result.getUser = function getUser() {
        return result.transportData.socket.handshake.user;
      };
      result.getClient = function getClient() {
        return result.transportData.socket.handshake.client;
      };
      result.setUser = function setUser(user) {
        // TODO: update it, when user is updated
        result.transportData.socket.handshake.user = user;
        return user;
      };
      result.getReferrer = function getReferrer() {
        return result.transportData.socket.request.headers.referer;
      };
      result.getLocale = function getLocale() {
        // TODO: implement
      };
      result.getSocket = function getSocket() {
        return result.transportData.socket;
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

BaseControldoneController.AUTH = AUTH;

module.exports = BaseControldoneController;
