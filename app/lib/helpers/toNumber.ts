export default (param: string | undefined, defaultValue: number): number => (
  param !== undefined ? parseInt(param, 10) : defaultValue
);
