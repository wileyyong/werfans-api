"use strict";
exports[`Strike : Create : for admin : event should contain params 1`] = {
    "_id": "${_id}",
    "targetUser": "${targetUser}"
};
exports[`Strike : Create : for admin : response should contain body 1`] = {
    "creator": "${creator}",
    "targetUser": "${targetUser}",
    "type": "${type}",
    "state": "created",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "_id": "${_id}"
};
exports[`Strike : Create : for user : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`Strike : Create : for unauthorized : response should contain body 1`] = {
    "message": "User is not logged in"
};
exports[`Strike : Get list : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "state": "created",
        "creator": {
            "_id": "${creator._id[0]}",
            "username": "admin"
        },
        "type": "abuse",
        "targetUser": {
            "_id": "${targetUser._id[0]}",
            "username": "username1"
        },
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    }
];
exports[`Strike : Get one : for user : response should contain body 1`] = {
    "state": "created",
    "_id": "${_id}",
    "creator": {
        "_id": "${creator._id}",
        "username": "admin"
    },
    "type": "abuse",
    "targetUser": {
        "_id": "${targetUser._id}",
        "username": "username1"
    },
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`Strike : Update : for admin : response should contain body 1`] = {
    "state": "created",
    "_id": "${_id}",
    "creator": {
        "_id": "${creator._id}",
        "username": "admin"
    },
    "type": "nudity",
    "targetUser": {
        "_id": "${targetUser._id}",
        "username": "username1"
    },
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`Strike : Update : for user : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`Strike : Change state : Revoke : valid flow : for admin : response should contain body 1`] = {
    "state": "revoked",
    "_id": "${_id}",
    "creator": {
        "_id": "${creator._id}",
        "username": "admin"
    },
    "type": "abuse",
    "ref": "${ref}",
    "refModel": "${refModel}",
    "targetUser": {
        "_id": "${targetUser._id}",
        "username": "username1"
    },
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`Strike : Change state : Revoke : invalid flow : for admin : response should contain body 1`] = {
    "type": "app",
    "status": 400,
    "error": "RulesViolation",
    "message": "Invalid state transition",
    "details": {
        "rule": "InvalidStateTransition",
        "value": {
            "currentState": "confirmed",
            "newState": "revoked"
        }
    }
};
exports[`Strike : Change state : Confirm : valid flow : for admin : response should contain body 1`] = {
    "state": "confirmed",
    "_id": "${_id}",
    "creator": {
        "_id": "${creator._id}",
        "username": "admin"
    },
    "type": "abuse",
    "ref": "${ref}",
    "refModel": "${refModel}",
    "targetUser": {
        "_id": "${targetUser._id}",
        "username": "username1"
    },
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`Strike : Change state : Confirm : invalid flow : for admin : response should contain body 1`] = {
    "type": "app",
    "status": 400,
    "error": "RulesViolation",
    "message": "Invalid state transition",
    "details": {
        "rule": "InvalidStateTransition",
        "value": {
            "currentState": "revoked",
            "newState": "confirmed"
        }
    }
};
exports[`Strike : Change state : Revoke : valid flow : for admin : event should contain params 1`] = {
    "_id": "${_id}",
    "targetUser": "${targetUser}",
    "ref": "${ref}",
    "refModel": "Album"
};
//# sourceMappingURL=strike.spec.ts.snap.js.map