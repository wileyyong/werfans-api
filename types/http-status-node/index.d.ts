declare module 'http-status-node' {
  interface HttpStatusData {
    code: number;
    message: string;
  }
  export interface HttpError extends Error {
    httpStatus: HttpStatusData;
  }
  export interface HttpStatus {
    createError(message?: string, details?: any): HttpError;
  }

  type HttpStatusKey =
'CONTINUE' |
'SWITCHING_PROTOCOLS' |
'OK' |
'CREATED' |
'ACCEPTED' |
'NON_AUTHORITATIVE_INFORMATION' |
'NO_CONTENT' |
'RESET_CONTENT' |
'PARTIAL_CONTENT' |
'MULTIPLE_CHOICES' |
'MOVED_PERMANENTLY' |
'FOUND' |
'SEE_OTHER' |
'NOT_MODIFIED' |
'USE_PROXY' |
'TEMPORARY_REDIRECT' |
'BAD_REQUEST' |
'UNAUTHORIZED' |
'PAYMENT_REQUIRED' |
'FORBIDDEN' |
'NOT_FOUND' |
'METHOD_NOT_ALLOWED' |
'NOT_ACCEPTABLE' |
'PROXY_AUTHENTICATION_REQUIRED' |
'REQUEST_TIMEOUT' |
'CONFLICT' |
'GONE' |
'LENGTH_REQUIRED' |
'PRECONDITION_FAILED' |
'REQUEST_ENTITY_TOO_LARGE' |
'REQUEST_URI_TOO_LONG' |
'UNSUPPORTED_MEDIA_TYPE' |
'REQUESTED_RANGE_NOT_SATISFIABLE' |
'EXPECTATION_FAILED' |
'UNPROCESSABLE_ENTITY' |
'TOO_MANY_REQUESTS' |
'INTERNAL_SERVER_ERROR' |
'NOT_IMPLEMENTED' |
'BAD_GATEWAY' |
'SERVICE_UNAVAILABLE' |
'GATEWAY_TIMEOUT' |
'HTTP_VERSION_NOT_SUPPORTED';

  type HttpStatuses = Record<HttpStatusKey, HttpStatus>;

  const httpStatuses: HttpStatuses;
  export default httpStatuses;
}
