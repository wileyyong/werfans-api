exports[`BalanceRecord : Create : response should contain body 1`] = {
  "type": "Express",
  "error": "PathNotFound",
  "message": "Not Found",
  "url": "/users/me/balance-records"
};
exports[`BalanceRecord : Get list : by owner : response should contain body 1`] = [
  {
    "_id": "${_id[0]}",
    "owner": "${owner[0]}",
    "type": "LoadBalance",
    "sum": 100,
    "createdAt": "${createdAt[0]}"
  }
];
exports[`BalanceRecord : Get list : by other user : response should contain body 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`BalanceRecord : Get one : by recipient : response should contain body 1`] = {
  "_id": "${_id}",
  "owner": "${owner}",
  "type": "LoadBalance",
  "sum": 100,
  "createdAt": "${createdAt}"
};
exports[`BalanceRecord : Get one : by other user : response should contain body 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`BalanceRecord : Update : response should contain body 1`] = {
  "type": "Express",
  "error": "PathNotFound",
  "message": "Not Found",
  "url": "${url}"
};
exports[`BalanceRecord : Delete : response should contain body 1`] = {
  "type": "Express",
  "error": "PathNotFound",
  "message": "Not Found",
  "url": "${url}"
};
