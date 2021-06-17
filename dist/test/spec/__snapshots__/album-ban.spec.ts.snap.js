"use strict";
exports[`Album Ban : Actions with bannedAlbum : get list : should not contain banned item 1`] = [];
exports[`Album Ban : Actions with unbannedAlbum : get list : should contain banned item 1`] = [
    {
        "_id": "${_id[0]}",
        "photosCounter": 0,
        "viewsCounter": 0,
        "favoritedUsers": [],
        "favoritedUsersCounter": 0,
        "owner": {
            "_id": "${owner._id[0]}",
            "username": "username1"
        },
        "name": "albumName",
        "price": 100,
        "coverUrl": "http://cover.io",
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    }
];
exports[`Album Ban : Ban album : by admin : event should contain params 1`] = {
    "_id": "${_id}",
    "targetUser": "${targetUser}"
};
exports[`Album Ban : Ban album : by admin : should create a strike 1`] = {
    "_id": "${_id}",
    "state": "created",
    "creator": "${creator}",
    "targetUser": "${targetUser}",
    "type": "spam",
    "description": null,
    "ref": "${ref}",
    "refModel": "Album",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "__v": 0
};
//# sourceMappingURL=album-ban.spec.ts.snap.js.map