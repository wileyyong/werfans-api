/**
 * Created by mk on 19/11/2016.
 */
export const VERIFY_EMAIL_SCHEMA = {
  properties: {
    password: {
      type: 'string',
    },
  },
  required: ['password'],
  additionalProperties: true,
};
