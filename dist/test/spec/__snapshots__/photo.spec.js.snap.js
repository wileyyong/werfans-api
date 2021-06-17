"use strict";
exports[`Photo : Create : own : should contain fields 1`] = {
    "name": "photo name",
    "description": "photo description",
    "watermarkUrl": "http://watermark.io",
    "url": "http://url.io",
    "publicUrl": "http://url.io",
    "owner": "${owner}",
    "album": "${album}",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "_id": "${_id}"
};
exports[`Photo : Create : for album of other user : should contain error 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`Photo : Get list : with other user : should contain fields 1`] = [
    {
        "_id": "${_id[0]}",
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
        "updatedAt": "${updatedAt[0]}",
        "favoritedUsers": [],
        "favoritedUsersCounter": 0,
    },
    {
        "_id": "${_id[1]}",
        "album": {
            "_id": "${album._id[1]}",
            "name": "albumName"
        },
        "owner": {
            "_id": "${owner._id[1]}",
            "username": "username1"
        },
        "name": "photo name",
        "description": "photo description",
        "watermarkUrl": "http://watermark.io",
        "url": "http://url.io",
        "publicUrl": "http://url.io",
        "createdAt": "${createdAt[1]}",
        "updatedAt": "${updatedAt[1]}",
        "favoritedUsers": [],
        "favoritedUsersCounter": 0,
    }
];
exports[`Photo : Get one : with other user : should contain fields 1`] = {
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
    "updatedAt": "${updatedAt}",
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
};
exports[`Photo : Update : own : should contain fields 1`] = {
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
    "updatedAt": "${updatedAt}",
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
};
exports[`Photo : Update : for album of other user : should contain error 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
//# sourceMappingURL=photo.spec.js.snap.js.map