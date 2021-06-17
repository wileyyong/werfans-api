"use strict";
exports[`Review : Create : by admin : should contain fields 1`] = {
    "author": "${author}",
    "targetUser": "${targetUser}",
    "rating": 5,
    "body": "Great content 1!",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "_id": "${_id}"
};
exports[`Review : Create : by user : should contain fields 1`] = {
    "author": "${author}",
    "targetUser": "${targetUser}",
    "rating": 5,
    "body": "Great content 1!",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "_id": "${_id}"
};
exports[`Review : Create : by unauthorized : should contain error 1`] = {
    "message": "User is not logged in"
};
exports[`Review : Get list : by user : should contain fields 1`] = [
    {
        "_id": "${_id[0]}",
        "targetUser": {
            "_id": "${targetUser._id[0]}",
            "username": "username2"
        },
        "author": {
            "_id": "${author._id[0]}"
        },
        "body": "Great content 1!",
        "rating": 5,
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    }
];
exports[`Review : Get list : by unauthorized : should contain error 1`] = {
    "message": "User is not logged in"
};
exports[`Review : Update : by admin : should contain fields 1`] = {
    "_id": "${_id}",
    "targetUser": {
        "_id": "${targetUser._id}",
        "username": "username2"
    },
    "author": {
        "_id": "${author._id}"
    },
    "body": "updated",
    "rating": 5,
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`Review : Update : by user : should contain fields 1`] = {
    "_id": "${_id}",
    "targetUser": {
        "_id": "${targetUser._id}",
        "username": "username2"
    },
    "author": "${author}",
    "body": "updated",
    "rating": 5,
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`Review : Update : by targetUser : should contain fields 1`] = {
    "type": "restdone",
    "status": 404,
    "error": "ResourceNotFound",
    "message": "Cannot locate resource"
};
exports[`Review : Update : by unauthorized : should contain error 1`] = {
    "message": "User is not logged in"
};
exports[`Review : Remove : by targetUser : should contain error 1`] = {
    "type": "restdone",
    "status": 404,
    "error": "ResourceNotFound",
    "message": "Cannot locate resource"
};
exports[`Review : Remove : by unauthorized : should contain error 1`] = {
    "message": "User is not logged in"
};
//# sourceMappingURL=review.spec.ts.snap.js.map