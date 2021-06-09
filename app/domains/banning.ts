export enum BanningReasonType {
  ByAdmin = 'byAdmin',
  ByStrikes = 'byStrikes'
}

export const BanningReasonTypeValues: BanningReasonType[] = Object
  .values(BanningReasonType)
  .filter((x) => typeof x === 'string');

export interface Banning<T = BanningReasonType> {
  banningReasonType?: T;
  banningReasonDescription?: string;
}

export interface BanningModel {
  ban(id: string, extraValues?: Record<string, any>): Promise<boolean>;
  unban(id: string): Promise<boolean>;
}
