exports[`Video : Create : own : response should contain body 1`] = {
  "name": "video name",
  "description": "video description",
  "watermarkUrl": "http://watermark.io",
  "coverUrl": "http://url.io/uploadedFileLocation",
  "url": "http://url.io",
  "publicUrl": "http://url.io",
  "viewsCounter": 0,
  "commentsCounter": 0,
  "owner": "${owner}",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "_id": "${_id}"
};
exports[`Video : Create : own : should create notification 1`] = [
  {
    "_id": "${_id[0]}",
    "readable": true,
    "recipients": [
      "${recipients[0][0]}"
    ],
    "unread": [
      "${unread[0][0]}"
    ],
    "notificationType": "VideoUploaded",
    "body": "Video uploaded",
    "metadata": {
      "owner": "${metadata.owner[0]}",
      "video": "${metadata.video[0]}"
    },
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}",
    "__v": 0
  }
];
exports[`Video : Create : for other user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`Video : Get list : with owner user : should contain url 1`] = [
  {
    "_id": "${_id[0]}",
    "viewsCounter": 0,
    "commentsCounter": 0,
    "owner": {
      "_id": "${owner._id[0]}",
      "username": "username1"
    },
    "name": "video name",
    "description": "video description",
    "watermarkUrl": "http://watermark.io",
    "url": "http://url.io",
    "coverUrl": "http://url.io/uploadedFileLocation",
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Video : Get list : with subscriber user : should contain url 1`] = [
  {
    "_id": "${_id[0]}",
    "viewsCounter": 0,
    "commentsCounter": 0,
    "owner": {
      "_id": "${owner._id[0]}",
      "username": "username1"
    },
    "name": "video name",
    "description": "video description",
    "watermarkUrl": "http://watermark.io",
    "url": "http://url.io",
    "coverUrl": "http://url.io/uploadedFileLocation",
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Video : Get list : with purchased user : should contain url 1`] = [
  {
    "_id": "${_id[0]}",
    "viewsCounter": 0,
    "commentsCounter": 0,
    "owner": {
      "_id": "${owner._id[0]}",
      "username": "username1"
    },
    "name": "video name",
    "description": "video description",
    "watermarkUrl": "http://watermark.io",
    "url": "http://url.io",
    "coverUrl": "http://url.io/uploadedFileLocation",
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Video : Get list : with NOT subscriber user : should not contain url 1`] = [
  {
    "_id": "${_id[0]}",
    "viewsCounter": 0,
    "commentsCounter": 0,
    "owner": {
      "_id": "${owner._id[0]}",
      "username": "username1"
    },
    "name": "video name",
    "description": "video description",
    "watermarkUrl": "http://watermark.io",
    "coverUrl": "http://url.io/uploadedFileLocation",
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Video : Get one : with owner user : should contain url 1`] = {
  "viewsCounter": 0,
  "commentsCounter": 0,
  "_id": "${_id}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "name": "video name",
  "description": "video description",
  "watermarkUrl": "http://watermark.io",
  "url": "http://url.io",
  "coverUrl": "http://url.io/uploadedFileLocation",
  "publicUrl": "http://url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Video : Get one : with subscriber user : should contain url 1`] = {
  "viewsCounter": 0,
  "commentsCounter": 0,
  "_id": "${_id}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "name": "video name",
  "description": "video description",
  "watermarkUrl": "http://watermark.io",
  "url": "http://url.io",
  "coverUrl": "http://url.io/uploadedFileLocation",
  "publicUrl": "http://url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Video : Get one : with purchased user : should contain url 1`] = {
  "viewsCounter": 0,
  "commentsCounter": 0,
  "_id": "${_id}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "name": "video name",
  "description": "video description",
  "watermarkUrl": "http://watermark.io",
  "url": "http://url.io",
  "coverUrl": "http://url.io/uploadedFileLocation",
  "publicUrl": "http://url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Video : Get one : with NOT subscriber user : should not contain url 1`] = {
  "viewsCounter": 0,
  "commentsCounter": 0,
  "_id": "${_id}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "name": "video name",
  "description": "video description",
  "watermarkUrl": "http://watermark.io",
  "coverUrl": "http://url.io/uploadedFileLocation",
  "publicUrl": "http://url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Video : Update : own : response should contain body 1`] = {
  "viewsCounter": 0,
  "commentsCounter": 0,
  "_id": "${_id}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "name": "video name",
  "description": "video description",
  "watermarkUrl": "http://watermark.io",
  "url": "http://updated-url.io",
  "coverUrl": "http://url.io/uploadedFileLocation",
  "publicUrl": "http://updated-url.io",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "price": 2020,
  "duration": 1000
};
exports[`Video : Update : for video of other user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`Video : Delete : for video of other user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
