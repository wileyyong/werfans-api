"use strict";
exports[`Report : Create : response should contain body 1`] = {
    "author": "${author}",
    "complainUser": "${complainUser}",
    "body": "Testing Report 1",
    "photoUrl": "http://photo.io",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "_id": "${_id}"
};
exports[`Report : Get List : by owner : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "author": "${author[0]}",
        "body": "Testing Report 1",
        "photoUrl": "http://photo.io",
        "complainUser": {
            "_id": "${complainUser._id[0]}",
            "username": "username2"
        },
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    }
];
exports[`Report : Get List : by admin : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "author": "${author[0]}",
        "body": "Testing Report 1",
        "photoUrl": "http://photo.io",
        "complainUser": {
            "_id": "${complainUser._id[0]}",
            "username": "username2"
        },
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    }
];
exports[`Report : Get One : by owner : response should contain body 1`] = {
    "_id": "${_id}",
    "author": "${author}",
    "body": "Testing Report 1",
    "photoUrl": "http://photo.io",
    "complainUser": {
        "_id": "${complainUser._id}",
        "username": "username2"
    },
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`Report : Get One : by admin : response should contain body 1`] = {
    "_id": "${_id}",
    "author": "${author}",
    "body": "Testing Report 1",
    "photoUrl": "http://photo.io",
    "complainUser": {
        "_id": "${complainUser._id}",
        "username": "username2"
    },
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
//# sourceMappingURL=report.spec.ts.snap.js.map