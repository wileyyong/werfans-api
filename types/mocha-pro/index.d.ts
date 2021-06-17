declare module 'mocha-pro' {
  interface ChaiSnapshot extends Chai.ChaiPlugin {
  }

  const chaiSnapshot: ChaiSnapshot;
  export = chaiSnapshot;
}

declare namespace Chai {
  import Context = Mocha.Context;

  interface Assertion {
    isForced: Assertion;
    matchSnapshot(context: Context): void;
  }
}
