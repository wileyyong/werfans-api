"use strict";
exports[`Comment : Create : by admin : response should contain body 1`] = {
    "author": "${author}",
    "target": "${target}",
    "targetModel": "LiveStream",
    "body": "hello, world!",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "_id": "${_id}"
};
exports[`Comment : Create : by user : response should contain body 1`] = {
    "author": "${author}",
    "target": "${target}",
    "targetModel": "LiveStream",
    "body": "hello, world!",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "_id": "${_id}"
};
exports[`Comment : Create : by user for unknown target model : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`Comment : Create : by unauthorized : response should contain body 1`] = {
    "message": "User is not logged in"
};
exports[`Comment : Get list : by user : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "target": "${target[0]}",
        "targetModel": "LiveStream",
        "body": "hello, world!",
        "author": {
            "_id": "${author._id[0]}"
        },
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    }
];
exports[`Comment : Get list : by other user : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "target": "${target[0]}",
        "targetModel": "LiveStream",
        "body": "hello, world!",
        "author": {
            "_id": "${author._id[0]}"
        },
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    }
];
exports[`Comment : Get list : by unauthorized : response should contain body 1`] = {
    "message": "User is not logged in"
};
exports[`Comment : Update : by admin : response should contain body 1`] = {
    "_id": "${_id}",
    "target": "${target}",
    "targetModel": "LiveStream",
    "body": "updatedbody",
    "author": "${author}",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`Comment : Update : by user : response should contain body 1`] = {
    "_id": "${_id}",
    "target": "${target}",
    "targetModel": "LiveStream",
    "body": "updatedbody",
    "author": "${author}",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`Comment : Update : by other user : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`Comment : Update : by unauthorized : response should contain body 1`] = {
    "message": "User is not logged in"
};
exports[`Comment : Delete : by other user : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`Comment : Delete : by unauthorized : response should contain body 1`] = {
    "message": "User is not logged in"
};
//# sourceMappingURL=comment.spec.ts.snap.js.map