exports[`Photo : Create : own : response should contain body 1`] = {
  "name": "photo name",
  "description": "photo description",
  "watermarkUrl": "http://watermark.io",
  "url": "http://url.io",
  "publicUrl": "http://url.io",
  "owner": "${owner}",
  "album": "${album}",
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "viewsCounter": 0,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "_id": "${_id}"
};
exports[`Photo : Create : for album of other user : response should contain body 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`Photo : Get list : with owner user : should contain url 1`] = [
  {
    "_id": "${_id[0]}",
    "viewsCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "album": {
      "_id": "${album._id[0]}",
      "name": "albumName"
    },
    "owner": {
      "_id": "${owner._id[0]}",
      "username": "username1"
    },
    "name": "photo name",
    "description": "photo description",
    "watermarkUrl": "http://watermark.io",
    "url": "http://url.io",
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Photo : Get list : with subscriber user : should contain url 1`] = [
  {
    "_id": "${_id[0]}",
    "viewsCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "album": {
      "_id": "${album._id[0]}",
      "name": "albumName"
    },
    "owner": {
      "_id": "${owner._id[0]}",
      "username": "username1"
    },
    "name": "photo name",
    "description": "photo description",
    "watermarkUrl": "http://watermark.io",
    "url": "http://url.io",
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Photo : Get list : with purchased user : should contain url 1`] = [
  {
    "_id": "${_id[0]}",
    "viewsCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "album": {
      "_id": "${album._id[0]}",
      "name": "albumName"
    },
    "owner": {
      "_id": "${owner._id[0]}",
      "username": "username1"
    },
    "name": "photo name",
    "description": "photo description",
    "watermarkUrl": "http://watermark.io",
    "url": "http://url.io",
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Photo : Get list : with NOT subscriber user : should not contain url 1`] = [
  {
    "_id": "${_id[0]}",
    "viewsCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "album": {
      "_id": "${album._id[0]}",
      "name": "albumName"
    },
    "owner": {
      "_id": "${owner._id[0]}",
      "username": "username1"
    },
    "name": "photo name",
    "description": "photo description",
    "watermarkUrl": "http://watermark.io",
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Photo : Get one : with owner user : should contain url 1`] = {
  "viewsCounter": 0,
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "_id": "${_id}",
  "album": {
    "_id": "${album._id}",
    "name": "albumName"
  },
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "name": "photo name",
  "description": "photo description",
  "watermarkUrl": "http://watermark.io",
  "url": "http://url.io",
  "publicUrl": "http://url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Photo : Get one : with subscriber user : should contain url 1`] = {
  "viewsCounter": 0,
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "_id": "${_id}",
  "album": {
    "_id": "${album._id}",
    "name": "albumName"
  },
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "name": "photo name",
  "description": "photo description",
  "watermarkUrl": "http://watermark.io",
  "url": "http://url.io",
  "publicUrl": "http://url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Photo : Get one : with purchased user : should contain url 1`] = {
  "viewsCounter": 0,
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "_id": "${_id}",
  "album": {
    "_id": "${album._id}",
    "name": "albumName"
  },
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "name": "photo name",
  "description": "photo description",
  "watermarkUrl": "http://watermark.io",
  "url": "http://url.io",
  "publicUrl": "http://url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Photo : Get one : with NOT subscriber user : should not contain url 1`] = {
  "viewsCounter": 0,
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "_id": "${_id}",
  "album": {
    "_id": "${album._id}",
    "name": "albumName"
  },
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "name": "photo name",
  "description": "photo description",
  "watermarkUrl": "http://watermark.io",
  "publicUrl": "http://url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Photo : Update : own : response should contain body 1`] = {
  "viewsCounter": 0,
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "_id": "${_id}",
  "album": {
    "_id": "${album._id}",
    "name": "albumName"
  },
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "name": "photo name",
  "description": "photo description",
  "watermarkUrl": "http://watermark.io",
  "url": "http://updated-url.io",
  "publicUrl": "http://updated-url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Photo : Update : for album of other user : response should contain body 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`Photo : Delete : for album of other user : response should contain body 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
