import { Types } from 'mongoose';

export default (
  id1: string | Types.ObjectId,
  id2: string | Types.ObjectId,
): boolean => {
  if (typeof (<Types.ObjectId>id1).equals === 'function') {
    return (<Types.ObjectId>id1).equals(id2);
  } else if (typeof (<Types.ObjectId>id2).equals === 'function') {
    return (<Types.ObjectId>id2).equals(id1);
  } else {
    return id1 === id2;
  }
};
