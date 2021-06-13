exports[`Notification : Create : response should contain body 1`] = {
  "type": "Express",
  "error": "PathNotFound",
  "message": "Not Found",
  "url": "/users/me/notifications"
};
exports[`Notification : Get list : by owner : response should contain body 1`] = [
  {
    "_id": "${_id[0]}",
    "readable": true,
    "notificationType": "Testing",
    "body": "notification body",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Notification : Get list : by other user : response should contain body 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`Notification : Get one : for personal : by recipient : response should contain body 1`] = {
  "readable": true,
  "_id": "${_id}",
  "notificationType": "Testing",
  "body": "notification body",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Notification : Get one : for global : response should contain body 1`] = {
  "readable": false,
  "_id": "${_id}",
  "notificationType": "Testing",
  "body": "notification body",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Notification : Update : response should contain body 1`] = {
  "type": "Express",
  "error": "PathNotFound",
  "message": "Not Found",
  "url": "${url}"
};
exports[`Notification : Delete : response should contain body 1`] = {
  "type": "Express",
  "error": "PathNotFound",
  "message": "Not Found",
  "url": "${url}"
};
exports[`Notification : Get one : for personal : by other user : response should contain body 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
