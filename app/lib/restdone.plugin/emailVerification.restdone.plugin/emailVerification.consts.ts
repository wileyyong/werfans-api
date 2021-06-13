import httpStatuses from 'http-status-node';

const { NOT_FOUND } = httpStatuses;

const consts = {
  RULES: {
    ALREADY_VERIFIED_RULE: {
      name: 'AlreadyVerified',
      message: 'This user already verified email address',
    },
    WRONG_TOKEN_RULE: {
      name: 'WrongToken',
      message: 'The token is wrong',
    },
    USER_NOT_FOUND: {
      name: 'UserNotFound',
      message: 'User with specified username cannot be found',
      httpStatus: NOT_FOUND,
    },
  },
};

export default consts;
