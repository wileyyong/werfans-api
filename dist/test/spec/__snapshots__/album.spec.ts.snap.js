"use strict";
exports[`Album : Create : own : response should contain body 1`] = {
    "name": "albumName",
    "coverUrl": "http://cover.io",
    "price": 100,
    "photosCounter": 0,
    "viewsCounter": 0,
    "owner": "${owner}",
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "_id": "${_id}"
};
exports[`Album : Create : for other user : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`Album : Get list : response should contain body 1`] = [
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
exports[`Album : Get one : response should contain body 1`] = {
    "photosCounter": 0,
    "viewsCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "_id": "${_id}",
    "owner": {
        "_id": "${owner._id}",
        "username": "username1"
    },
    "name": "albumName",
    "price": 100,
    "coverUrl": "http://cover.io",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`Album : Update : own : response should contain body 1`] = {
    "photosCounter": 0,
    "viewsCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "_id": "${_id}",
    "owner": {
        "_id": "${owner._id}",
        "username": "username1"
    },
    "name": "albumName",
    "price": 2020,
    "coverUrl": "http://cover.io",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`Album : Update : by admin : response should contain body 1`] = {
    "photosCounter": 0,
    "viewsCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "_id": "${_id}",
    "owner": {
        "_id": "${owner._id}",
        "username": "username1"
    },
    "name": "albumName",
    "price": 2020,
    "coverUrl": "http://cover.io",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`Album : Update : with other user : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
//# sourceMappingURL=album.spec.ts.snap.js.map