import { NextFunction, Request, Response } from 'express-serve-static-core';
import { HttpError } from 'http-status-node';

import { ExtendedExpressApplication } from '../domains/system';
import { App } from '../domains/app';

export default (expressApp: ExtendedExpressApplication, app: App) => {
  const log = app.createLog(module);
  expressApp.use((err: (Error & {
    error?: string,
    error_description?: string,
    status?: number,
    type?: string,
  }) | null, req: Request, res: Response, next: NextFunction) => {
    // If the error object doesn't exists
    if (!err) {
      return next();
    }

    // Log it
    log.error(err);
    log.error(`Stack: ${err.stack}`);

    // Error page
    res.status(err.status || (<HttpError>err).httpStatus?.code || 500);
    if (req.method === 'HEAD') {
      return res.end();
    }

    return res.send({
      type: err.type || 'Unknown',
      error: err.error || 'Unknown',
      message: err.message || (<HttpError>err).httpStatus?.message,
      error_description: err.error_description,
    });
  });
};
