export class IllegalStateError extends Error {
  constructor(message?: string) {
    super(`Illegal state${message ? `: ${message}` : ''}`);
  }
}
