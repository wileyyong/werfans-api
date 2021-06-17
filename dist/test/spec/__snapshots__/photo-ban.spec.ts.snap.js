"use strict";
exports[`Photo Ban : Actions with bannedPhoto : get list : should not contain banned item 1`] = [];
exports[`Photo Ban : Actions with unbannedPhoto : get list : should contain banned item 1`] = [
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
exports[`Photo Ban : Ban photo : by admin : should create a strike 1`] = {
    "_id": "${_id}",
    "state": "created",
    "creator": "${creator}",
    "targetUser": "${targetUser}",
    "type": "spam",
    "description": null,
    "ref": "${ref}",
    "refModel": "Photo",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "__v": 0
};
exports[`Photo Ban : Ban photo : by admin : event should contain params 1`] = {
    "_id": "${_id}",
    "targetUser": "${targetUser}"
};
//# sourceMappingURL=photo-ban.spec.ts.snap.js.map