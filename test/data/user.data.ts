import { UserType } from '../../app/domains/user';

module.exports = (seed: number, options?: { username?: string; type?: UserType }) => {
  const { type = UserType.Entrepreneur, username = `username${seed}` } = options || {};
  return ({
    username,
    password: `password${seed}`,
    email: `${username}@email.com`,
    type,
  });
};
