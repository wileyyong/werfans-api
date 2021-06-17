"use strict";
exports[`User subscribersStats : by owner : response should contain body 1`] = {
    "showSubscribersCounter": true,
    "subscribersCounter": 2,
    "_id": "${_id}",
    "subscribersStats": {
        "activeCounter": 2,
        "expiredCounter": 1
    }
};
exports[`User subscribersStats : in public one : with enabled showSubscribersCounter : response should contain body 1`] = {
    "subscribersCounter": 2,
    "_id": "${_id}"
};
exports[`User subscribersStats : in public one : with disabled showSubscribersCounter : response should contain body 1`] = {
    "_id": "${_id}"
};
exports[`User subscribersStats : in public list : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "subscribersCounter": 0
    },
    {
        "_id": "${_id[1]}",
    },
    {
        "_id": "${_id[2]}",
        "subscribersCounter": 0
    },
    {
        "_id": "${_id[3]}",
        "subscribersCounter": 2
    },
    {
        "_id": "${_id[4]}",
        "subscribersCounter": 0
    },
    {
        "_id": "${_id[5]}",
        "subscribersCounter": 0
    }
];
//# sourceMappingURL=user-subscribersStats.spec.ts.snap.js.map