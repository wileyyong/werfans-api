export enum BalanceRecordRefModel {
  Album = 'Album',
  BalanceRecord = 'BalanceRecord',
  Goal = 'Goal',
  LiveStream = 'LiveStream',
  Photo = 'Photo',
  Video = 'Video',
  Deposit = 'Deposit'
}

export const BalanceRecordRefModelValues: BalanceRecordRefModel[] = Object
  .values(BalanceRecordRefModel)
  .filter((x) => typeof x === 'string');
