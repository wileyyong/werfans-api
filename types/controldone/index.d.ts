// eslint-disable-next-line max-classes-per-file
declare module 'controldone' {
  import { Application, IRouterMatcher, Request } from 'express';
  import { Socket } from 'socket.io';

  export type ActionOptions = {
    enabled?: boolean;
    [key: string]: any;
  };

  export type ControllerOptions = {
    actions: {
      [key: string]: ActionOptions;
    };
    [key: string]: any;
  };

  export class Controller<S = Scope> {
    transports: Transport[];

    actions: Record<string, any>;

    constructor(options: Partial<ControllerOptions>);

    createScope<T>(controller: Controller<S>, transport: Transport<T>): S;

    sendResult(scope: S): void;

    setResError(err: Error, scope: S): void;
  }

  export type Scope<B = Record<string, any>, P = Record<string, any>, T = AllTransportData> = {
    action: Controller;
    actionName: string;
    body: Record<string, any>;
    owner: Controller;
    params: P;
    query: Record<string, any>;
    transport: Transport;
    transportData: T;
    checkActionName(...actionNames: string[]): boolean;
  };

  export class Transport<T = AllTransportData> {
    transportName: string;

    transportData: T;
  }

  export type ExpressTransportData<R = Request> = {
    req: R;
  };

  type ExpressTransportOptions = {

  };

  export class ExpressTransport extends Transport<ExpressTransportData> {
    app: Application;

    constructor(options: ExpressTransportOptions);

    getAuth(options: ControllerOptions): IRouterMatcher<this>;
  }

  export type SocketIoTransportData<P = any> = {
    payload: P;
    result?: SocketIoResponseResult;
    socket: Socket;
  };

  export type SocketIoRequest = {
    route: string;
    params?: Record<string, any>;
    filter?: Record<string, any>;
  };

  export type SocketIoResponseResult = {
    body: any;
    statusCode: number;
  };

  type SocketIoTransportOptions = {
  };

  export interface SocketIoTransportResponse {
    method: string;
    path: string;
    result: SocketIoResponseResult;
  }

  export class SocketIoTransport extends Transport<SocketIoTransportData> {
    constructor(options: SocketIoTransportOptions);
  }

  export type AllTransportData = ExpressTransportData | SocketIoTransportData;

  export interface LoggerInstance extends NodeJS.EventEmitter {
    error: LeveledLogMethod;
    warn: LeveledLogMethod;
    help: LeveledLogMethod;
    data: LeveledLogMethod;
    info: LeveledLogMethod;
    debug: LeveledLogMethod;
    prompt: LeveledLogMethod;
    verbose: LeveledLogMethod;
    input: LeveledLogMethod;
    silly: LeveledLogMethod;
  }

  interface LeveledLogMethod {
    (msg: string, ...meta: any[]): LoggerInstance;
  }

  type Options = {
    transports: Transport[];
    log: LoggerInstance | Console;
  };

  export default class Controldone {
    static Controller: typeof Controller;

    static ExpressTransport: typeof ExpressTransport;

    static SocketIoTransport: typeof SocketIoTransport;

    constructor(options: Options);

    addController(controller: typeof Controller, options : Options): void;
  }
}
