exports[`REST /users - User generate payment forms : GET /:_id/generateFormUrl/:period : Generate form URL : with right period : should match snapshot 1`] = {
  "url": "https://api.ccbill.com/wap-frontflex/flexforms/d91601e7-ffaf-452c-b9b2-21ee77abc662?initialPrice=49.99&initialPeriod=30&currencyCode=840&metadata=xxx&recurringPrice=49.99&recurringPeriod=30&numRebills=99&clientAccnum=951492&formDigest=fd7b8c7a6bbc2cd9a0d1786f1e6ebc4e&clientSubacc=0021"
};
exports[`REST /users - User generate payment forms : GET /:_id/generateFormUrl/:period : Generate form URL : with wrong period : response should contain body 1`] = {
  "type": "restdone",
  "status": 400,
  "message": "Wrong period"
};
exports[`REST /users - User generate payment forms : GET /:_id/deposit/:summ : Generate form URL : with right summ : should match snapshot 1`] = {
  "url": "https://api.ccbill.com/wap-frontflex/flexforms/d91601e7-ffaf-452c-b9b2-21ee77abc662?initialPrice=30.00&initialPeriod=90&currencyCode=840&metadata=xxx&clientAccnum=951492&formDigest=67ff44121618ccd7953de9940383e5f6&clientSubacc=0021"
};
exports[`REST /users - User generate payment forms : GET /:_id/deposit/:summ : Generate form URL : with wrong summ lower than 3 : response should contain body 1`] = {
  "type": "restdone",
  "status": 400,
  "message": "Summ should be between $3 and $100"
};
exports[`REST /users - User generate payment forms : GET /:_id/deposit/:summ : Generate form URL : with wrong summ greater than 100 : response should contain body 1`] = {
  "type": "restdone",
  "status": 400,
  "message": "Summ should be between $3 and $100"
};
