import consolidate from 'consolidate';

import { ExtendedExpressApplication } from '../domains/system';

export default (expressApp: ExtendedExpressApplication) => {
  // Set up engine
  expressApp.engine('server.view.html', consolidate.swig);

  // Set views path and view engine
  expressApp.set('view engine', 'server.view.html');
  expressApp.set('views', './app/views');
};
