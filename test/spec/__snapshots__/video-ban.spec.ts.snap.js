exports[`Video Ban : Actions with bannedVideo : get list : should not contain banned item 1`] = [];
exports[`Video Ban : Actions with unbannedVideo : get list : should contain banned item 1`] = [
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
exports[`Video Ban : Ban video : by admin : event should contain params 1`] = {
  "_id": "${_id}",
  "targetUser": "${targetUser}"
};
exports[`Video Ban : Ban video : by admin : should create a strike 1`] = {
  "_id": "${_id}",
  "state": "created",
  "creator": "${creator}",
  "targetUser": "${targetUser}",
  "type": "spam",
  "description": null,
  "ref": "${ref}",
  "refModel": "Video",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "__v": 0
};
