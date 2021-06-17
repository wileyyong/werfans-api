"use strict";
exports[`Feedback : Create : by admin : should contain fields 1`] = {
    "author": "${author}",
    "body": "I cannot upload an album cover",
    "photoUrl": "http://gettyimages1.com",
    "type": "suggestion",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "_id": "${_id}"
};
exports[`Feedback : Create : by user : should contain fields 1`] = {
    "author": "${author}",
    "body": "I cannot upload an album cover",
    "photoUrl": "http://gettyimages1.com",
    "type": "suggestion",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "_id": "${_id}"
};
exports[`Feedback : Create : by unauthorized : should contain error 1`] = {
    "message": "User is not logged in"
};
exports[`Feedback : Get list : by user : should contain fields 1`] = [
    {
        "_id": "${_id[0]}",
        "author": {
            "_id": "${author._id[0]}",
            "username": "username1"
        },
        "body": "I cannot upload an album cover",
        "photoUrl": "http://gettyimages1.com",
        "type": "suggestion",
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    },
    {
        "_id": "${_id[1]}",
        "author": {
            "_id": "${author._id[1]}",
            "username": "username1"
        },
        "body": "I cannot upload an album cover",
        "photoUrl": "http://gettyimages1.com",
        "type": "supportRequest",
        "createdAt": "${createdAt[1]}",
        "updatedAt": "${updatedAt[1]}"
    }
];
exports[`Feedback : Get list : by otherUser : should contain error 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "You do not have permission to access this feedback."
};
exports[`Feedback : Get list : by unauthorized : should contain error 1`] = {
    "message": "User is not logged in"
};
exports[`Feedback : Remove : by admin : should contain error 1`] = {
    "type": "Express",
    "error": "PathNotFound",
    "message": "Not Found",
    "url": "${url}"
};
exports[`Feedback : Remove : by user : should contain error 1`] = {
    "type": "Express",
    "error": "PathNotFound",
    "message": "Not Found",
    "url": "${url}"
};
exports[`Feedback : Remove : by unauthorized : should contain error 1`] = {
    "type": "Express",
    "error": "PathNotFound",
    "message": "Not Found",
    "url": "${url}"
};
exports[`Feedback : Update : by admin : should contain error 1`] = {
    "type": "Express",
    "error": "PathNotFound",
    "message": "Not Found",
    "url": "${url}"
};
exports[`Feedback : Update : by user : should contain error 1`] = {
    "type": "Express",
    "error": "PathNotFound",
    "message": "Not Found",
    "url": "${url}"
};
exports[`Feedback : Update : by unauthorized : should contain error 1`] = {
    "type": "Express",
    "error": "PathNotFound",
    "message": "Not Found",
    "url": "${url}"
};
//# sourceMappingURL=feedback.spec.ts.snap.js.map