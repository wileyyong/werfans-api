// @ts-ignore
import OAuthdone from 'oauthdone';
import AuthDelegate from 'app/lib/authDelegate';
import { ExtendedExpressApplication } from '../domains/system';

export default (expressApp: ExtendedExpressApplication) => {
  const authDelegate = new AuthDelegate();
  // @ts-ignore
  const oAuthdone = new OAuthdone(authDelegate);
  expressApp.route('/oauth').post(oAuthdone.getToken());
  expressApp.oAuthdone = oAuthdone;
};
