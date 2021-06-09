exports[`Message Ban : Ban message : by admin : should create a strike 1`] = {
  "_id": "${_id}",
  "state": "created",
  "creator": "${creator}",
  "targetUser": "${targetUser}",
  "type": "spam",
  "description": null,
  "ref": "${ref}",
  "refModel": "Message",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "__v": 0
};
exports[`Message Ban : Actions with bannedMessage : get list : should not contain banned item 1`] = [];
exports[`Message Ban : Actions with unbannedMessage : get list : should contain banned item 1`] = [
  {
    "_id": "${_id[0]}",
    "unread": [
      "${unread[0][0]}"
    ],
    "chat": "${chat[0]}",
    "author": "${author[0]}",
    "body": "message body 1",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Message Ban : Ban message : by admin : event should contain params 1`] = {
  "_id": "${_id}",
  "targetUser": "${targetUser}"
};
