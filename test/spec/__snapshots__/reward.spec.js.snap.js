exports[`Reward : Create : for admin : should contain fields 1`] = {
  "reward": "$300",
  "description": "Top 5 Highest Earned Income",
  "period": "P1M",
  "place": "${place}",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "_id": "${_id}"
};
exports[`Reward : Create : for user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`Reward : Get list : should contain fields 1`] = [
  {
    "_id": "${_id[0]}",
    "reward": "$300",
    "description": "Top 5 Highest Earned Income",
    "period": "P1M",
    "place": "${place[0]}",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Reward : Get one : should contain fields 1`] = {
  "_id": "${_id}",
  "reward": "$300",
  "description": "Top 5 Highest Earned Income",
  "period": "P1M",
  "place": "${place}",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Reward : Update : for admin : should contain fields 1`] = {
  "_id": "${_id}",
  "reward": "$300",
  "description": "Top 5 Highest Earned Income",
  "period": "P1M",
  "place": "${place}",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Reward : Update : for user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
