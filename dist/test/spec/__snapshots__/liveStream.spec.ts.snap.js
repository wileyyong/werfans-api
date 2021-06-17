"use strict";
exports[`LiveStream : Create : own : response should contain body 1`] = {
    "duration": -1,
    "price": "${price}",
    "coverUrl": "http://cover.io",
    "url": "http://url.io",
    "publicUrl": "http://url.io",
    "owner": "${owner}",
    "state": "created",
    "likedUsers": [],
    "likedUsersCounter": 0,
    "viewersCounter": 0,
    "viewsCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "_id": "${_id}"
};
exports[`LiveStream : Create : for other user : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`LiveStream : Get list : with owner user : should contain url 1`] = [
    {
        "_id": "${_id[0]}",
        "state": "created",
        "viewsCounter": 0,
        "likedUsers": [],
        "likedUsersCounter": 0,
        "favoritedUsers": [],
        "favoritedUsersCounter": 0,
        "viewersCounter": 0,
        "owner": {
            "_id": "${owner._id[0]}",
            "username": "username1"
        },
        "price": "${price[0]}",
        "coverUrl": "http://cover.io",
        "url": "http://url.io",
        "duration": -1,
        "publicUrl": "http://url.io",
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    }
];
exports[`LiveStream : Get list : with subscriber user : should contain url 1`] = [
    {
        "_id": "${_id[0]}",
        "state": "created",
        "viewsCounter": 0,
        "likedUsers": [],
        "likedUsersCounter": 0,
        "favoritedUsers": [],
        "favoritedUsersCounter": 0,
        "viewersCounter": 0,
        "owner": {
            "_id": "${owner._id[0]}",
            "username": "username1"
        },
        "price": "${price[0]}",
        "coverUrl": "http://cover.io",
        "url": "http://url.io",
        "duration": -1,
        "publicUrl": "http://url.io",
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    }
];
exports[`LiveStream : Get list : with purchased user : should contain url 1`] = [
    {
        "_id": "${_id[0]}",
        "state": "created",
        "viewsCounter": 0,
        "likedUsers": [],
        "likedUsersCounter": 0,
        "favoritedUsers": [],
        "favoritedUsersCounter": 0,
        "viewersCounter": 0,
        "owner": {
            "_id": "${owner._id[0]}",
            "username": "username1"
        },
        "price": "${price[0]}",
        "coverUrl": "http://cover.io",
        "url": "http://url.io",
        "duration": -1,
        "publicUrl": "http://url.io",
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    }
];
exports[`LiveStream : Get list : with NOT subscriber user : should not contain url 1`] = [
    {
        "_id": "${_id[0]}",
        "state": "created",
        "viewsCounter": 0,
        "likedUsers": [],
        "likedUsersCounter": 0,
        "favoritedUsers": [],
        "favoritedUsersCounter": 0,
        "viewersCounter": 0,
        "owner": {
            "_id": "${owner._id[0]}",
            "username": "username1"
        },
        "price": "${price[0]}",
        "coverUrl": "http://cover.io",
        "duration": -1,
        "publicUrl": "http://url.io",
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    }
];
exports[`LiveStream : Get one : with owner user : should contain url 1`] = {
    "state": "created",
    "viewsCounter": 0,
    "likedUsers": [],
    "likedUsersCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "viewersCounter": 0,
    "_id": "${_id}",
    "owner": {
        "_id": "${owner._id}",
        "username": "username1"
    },
    "price": "${price}",
    "coverUrl": "http://cover.io",
    "url": "http://url.io",
    "duration": -1,
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`LiveStream : Get one : with subscriber user : should contain url 1`] = {
    "state": "created",
    "viewsCounter": 0,
    "likedUsers": [],
    "likedUsersCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "viewersCounter": 0,
    "_id": "${_id}",
    "owner": {
        "_id": "${owner._id}",
        "username": "username1"
    },
    "price": "${price}",
    "coverUrl": "http://cover.io",
    "url": "http://url.io",
    "duration": -1,
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`LiveStream : Get one : with purchased user : should contain url 1`] = {
    "state": "created",
    "viewsCounter": 0,
    "likedUsers": [],
    "likedUsersCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "viewersCounter": 0,
    "_id": "${_id}",
    "owner": {
        "_id": "${owner._id}",
        "username": "username1"
    },
    "price": "${price}",
    "coverUrl": "http://cover.io",
    "url": "http://url.io",
    "duration": -1,
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`LiveStream : Get one : with NOT subscriber user : should not contain url 1`] = {
    "state": "created",
    "viewsCounter": 0,
    "likedUsers": [],
    "likedUsersCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "viewersCounter": 0,
    "_id": "${_id}",
    "owner": {
        "_id": "${owner._id}",
        "username": "username1"
    },
    "price": "${price}",
    "coverUrl": "http://cover.io",
    "duration": -1,
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`LiveStream : Schedule : own : response should contain body 1`] = {
    "state": "scheduled",
    "viewsCounter": 0,
    "likedUsers": [],
    "likedUsersCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "viewersCounter": 0,
    "_id": "${_id}",
    "owner": "${owner}",
    "price": "${price}",
    "coverUrl": "http://cover.io",
    "url": "http://url.io",
    "duration": -1,
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "scheduledStartingAt": "${scheduledStartingAt}",
    "scheduledAt": "${scheduledAt}"
};
exports[`LiveStream : Schedule : own : should create notification 1`] = [
    {
        "_id": "${_id[0]}",
        "readable": true,
        "recipients": [
            "${recipients[0][0]}"
        ],
        "unread": [
            "${unread[0][0]}"
        ],
        "notificationType": "LiveStreamScheduled",
        "body": "LiveStream scheduled",
        "metadata": {
            "scheduledStartingAt": "${metadata.scheduledStartingAt[0]}",
            "liveStream": "${metadata.liveStream[0]}",
            "owner": {
                "_id": "${metadata.owner._id[0]}",
                "username": "username1"
            }
        },
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}",
        "__v": 0
    }
];
exports[`LiveStream : Schedule : wrong transition : should fail with Invalid state transition 1`] = {
    "type": "app",
    "status": 400,
    "error": "RulesViolation",
    "message": "Invalid state transition",
    "details": {
        "rule": "InvalidStateTransition",
        "value": {
            "currentState": "onAir",
            "newState": "scheduled"
        }
    }
};
exports[`LiveStream : Schedule : wrong scheduledStartingAt : should fail with Invalid scheduledStartingAt 1`] = {
    "type": "restdone",
    "status": 400,
    "message": "scheduledStartingAt should be an hour after the current time"
};
exports[`LiveStream : Schedule : for other user : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`LiveStream : Start : own : response should contain body 1`] = {
    "state": "onAir",
    "viewsCounter": 0,
    "likedUsers": [],
    "likedUsersCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "viewersCounter": 0,
    "_id": "${_id}",
    "owner": "${owner}",
    "price": "${price}",
    "coverUrl": "http://cover.io",
    "url": "http://updated-url.io",
    "duration": -1,
    "publicUrl": "http://updated-url.io",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "startedAt": "${startedAt}"
};
exports[`LiveStream : Start : own : should create notification 1`] = [
    {
        "_id": "${_id[0]}",
        "readable": true,
        "recipients": [
            "${recipients[0][0]}"
        ],
        "unread": [
            "${unread[0][0]}"
        ],
        "notificationType": "LiveStreamStarted",
        "body": "LiveStream started",
        "metadata": {
            "liveStream": "${metadata.liveStream[0]}",
            "owner": {
                "_id": "${metadata.owner._id[0]}",
                "username": "username1"
            }
        },
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}",
        "__v": 0
    }
];
exports[`LiveStream : Start : wrong transition : should fail with Invalid state transition 1`] = {
    "type": "app",
    "status": 400,
    "error": "RulesViolation",
    "message": "Invalid state transition",
    "details": {
        "rule": "InvalidStateTransition",
        "value": {
            "currentState": "onAir",
            "newState": "onAir"
        }
    }
};
exports[`LiveStream : Start : for other user : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`LiveStream : Stop : own : event should contain params 1`] = {
    "_id": "${_id}"
};
exports[`LiveStream : Stop : own : response should contain body 1`] = {
    "state": "completed",
    "viewsCounter": 0,
    "likedUsers": [],
    "likedUsersCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "viewersCounter": 0,
    "_id": "${_id}",
    "owner": "${owner}",
    "price": "${price}",
    "coverUrl": "http://cover.io",
    "url": "http://url.io",
    "duration": -1,
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "stoppedAt": "${stoppedAt}"
};
exports[`LiveStream : Stop : wrong transition : should fail with Invalid state transition 1`] = {
    "type": "app",
    "status": 400,
    "error": "RulesViolation",
    "message": "Invalid state transition",
    "details": {
        "rule": "InvalidStateTransition",
        "value": {
            "currentState": "created",
            "newState": "completed"
        }
    }
};
exports[`LiveStream : Stop : for other user : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`LiveStream : Update : own : response should contain body 1`] = {
    "state": "created",
    "viewsCounter": 0,
    "likedUsers": [],
    "likedUsersCounter": 0,
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "viewersCounter": 0,
    "_id": "${_id}",
    "owner": {
        "_id": "${owner._id}",
        "username": "username1"
    },
    "price": "${price}",
    "coverUrl": "http://cover.io",
    "url": "http://updated-url.io",
    "duration": -1,
    "publicUrl": "http://updated-url.io",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`LiveStream : Update : for other user : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`LiveStream : Delete : for other user : response should contain body 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
//# sourceMappingURL=liveStream.spec.ts.snap.js.map