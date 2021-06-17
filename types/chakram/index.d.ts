declare module 'chakram' {
  export const expect: any;
  export interface RequestOptions {
    headers: Record<string, string>
  }
  export interface Response {
    body: any;
  }

  interface Chakram extends Chai.ChaiPlugin {
    expect: Chai.ExpectStatic;
    get(url: string, options: RequestOptions): Promise<Response>;
    patch(url: string, body: any, options: RequestOptions): Promise<Response>;
    post(url: string, body: any, options: RequestOptions): Promise<Response>;
    put(url: string, body: any, options: RequestOptions): Promise<Response>;
    delete(url: string, body: any, options: RequestOptions): Promise<Response>;
  }

  const chakram: Chakram;
  export default chakram;
}

declare namespace Chai {
  interface Assertion {
    status(statusCode: number): void;
  }
}
