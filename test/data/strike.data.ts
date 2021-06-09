import { StrikeState, StrikeType } from '../../app/domains/strike';

export = module.exports = () => ({
  state: StrikeState.Created,
  type: StrikeType.Abuse,
});
