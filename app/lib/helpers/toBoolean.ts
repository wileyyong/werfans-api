export default (param: string | undefined, defaultValue: boolean): boolean => {
  if (param === undefined) {
    return defaultValue;
  } else if (param === 'true') {
    return true;
  } else if (param === 'false') {
    return false;
  } else {
    return !!parseInt(param, 10);
  }
};
