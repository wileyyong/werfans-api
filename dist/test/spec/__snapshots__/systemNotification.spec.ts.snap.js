"use strict";
exports[`SystemNotification : Create : for admin : should contain fields 1`] = {
    "notificationType": "Testing",
    "author": "${author}",
    "sentAt": "${sentAt}",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "_id": "${_id}"
};
exports[`SystemNotification : Create : for non-admin : should contain error 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`SystemNotification : Create : for unauthorized : should contain error 1`] = {
    "message": "User is not logged in"
};
exports[`SystemNotification : Get list : for admin : should contain fields 1`] = [
    {
        "_id": "${_id[0]}",
        "sentAt": "${sentAt[0]}",
        "notificationType": "Testing",
        "author": {
            "_id": "${author._id[0]}"
        },
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    }
];
exports[`SystemNotification : Get list : for non-admin : should contain error 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`SystemNotification : Update : for admin : should contain fields 1`] = {
    "sentAt": "${sentAt}",
    "_id": "${_id}",
    "notificationType": "PrivateMessageReceived",
    "author": {
        "_id": "${author._id}"
    },
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`SystemNotification : Update : for non-admin : should contain error 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
//# sourceMappingURL=systemNotification.spec.ts.snap.js.map