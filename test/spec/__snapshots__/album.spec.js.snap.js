exports[`Album : Create : own : should contain fields 1`] = {
  "name": "albumName",
  "coverUrl": "http://cover.io",
  "price": "${price}",
  "photoCounter": 0,
  "viewCounter": 0,
  "owner": "${owner}",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "_id": "${_id}"
};
exports[`Album : Create : for other user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`Album : Get list : with other user : should contain fields 1`] = [
  {
    "_id": "${_id[0]}",
    "photoCounter": 0,
    "viewCounter": 0,
    "owner": {
      "_id": "${owner._id[0]}",
      "username": "username1"
    },
    "name": "albumName",
    "price": "${price[0]}",
    "coverUrl": "http://cover.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}",
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
  }
];
exports[`Album : Get one : with other user : should contain fields 1`] = {
  "photoCounter": 0,
  "viewCounter": 0,
  "_id": "${_id}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "name": "albumName",
  "price": "${price}",
  "coverUrl": "http://cover.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
};
exports[`Album : Update : own : should contain fields 1`] = {
  "photoCounter": 0,
  "viewCounter": 0,
  "_id": "${_id}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "name": "albumName",
  "price": "${price}",
  "coverUrl": "http://cover.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
};
exports[`Album : Update : for other user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
