exports[`LiveStream : Create : own : should contain fields 1`] = {
  "duration": -1,
  "price": "${price}",
  "coverUrl": "http://cover.io",
  "url": "http://url.io",
  "publicUrl": "http://url.io",
  "owner": "${owner}",
  "likedUsers": [],
  "likedUsersCounter": 0,
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "_id": "${_id}"
};
exports[`LiveStream : Create : for other user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`LiveStream : Get list : with other user : should contain fields 1`] = [
  {
    "_id": "${_id[0]}",
    "likedUsers": [],
    "likedUsersCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "owner": {
      "_id": "${owner._id[0]}",
      "username": "username1"
    },
    "price": "${price[0]}",
    "coverUrl": "http://cover.io",
    "url": "http://url.io",
    "duration": -1,
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`LiveStream : Get one : with other user : should contain fields 1`] = {
  "likedUsers": [],
  "likedUsersCounter": 0,
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "_id": "${_id}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "price": "${price}",
  "coverUrl": "http://cover.io",
  "url": "http://url.io",
  "duration": -1,
  "publicUrl": "http://url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`LiveStream : Update : own : should contain fields 1`] = {
  "likedUsers": [],
  "likedUsersCounter": 0,
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "_id": "${_id}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "price": "${price}",
  "coverUrl": "http://cover.io",
  "url": "http://url.io",
  "duration": -1,
  "publicUrl": "http://url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`LiveStream : Update : for other user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`LiveStream : Start : own : should contain fields 1`] = {
  "likedUsers": [],
  "likedUsersCounter": 0,
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "_id": "${_id}",
  "owner": "${owner}",
  "price": "${price}",
  "coverUrl": "http://cover.io",
  "url": "http://url.io",
  "duration": -1,
  "publicUrl": "http://url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`LiveStream : Start : for other user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`LiveStream : Start : own : should create notification 1`] = [
  {
    "_id": "${_id[0]}",
    "readable": true,
    "recipients": [
      "${recipients[0][0]}"
    ],
    "unread": [
      "${unread[0][0]}"
    ],
    "notificationType": "LiveStreamStarted",
    "body": "LiveStream started",
    "metadata": {
      "liveStream": "${metadata.liveStream[0]}"
    },
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}",
    "__v": 0
  }
];
