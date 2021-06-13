import { HttpStatus } from 'http-status-node';

export interface Rule {
  name: string;
  message: string;
  httpStatus?: HttpStatus;
}
