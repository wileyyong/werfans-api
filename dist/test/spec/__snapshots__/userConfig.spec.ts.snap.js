"use strict";
exports[`User Config : Create : response should contain body 1`] = {
    "user": "${user}",
    "key": "config#1",
    "data": {
        "field1": "value1"
    },
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`User Config : Get List : by owner : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "user": "${user[0]}",
        "key": "config",
        "data": {
            "field1": "value1"
        },
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    },
    {
        "_id": "${_id[1]}",
        "user": "${user[1]}",
        "key": "config#1",
        "data": {
            "field1": "value1"
        },
        "createdAt": "${createdAt[1]}",
        "updatedAt": "${updatedAt[1]}"
    }
];
exports[`User Config : Get List : by admin : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "user": "${user[0]}",
        "key": "config",
        "data": {
            "field1": "value1"
        },
        "createdAt": "${createdAt[0]}",
        "updatedAt": "${updatedAt[0]}"
    },
    {
        "_id": "${_id[1]}",
        "user": "${user[1]}",
        "key": "config#1",
        "data": {
            "field1": "value1"
        },
        "createdAt": "${createdAt[1]}",
        "updatedAt": "${updatedAt[1]}"
    }
];
exports[`User Config : Get List : by otherUser : should return Forbidden 1`] = {
    "type": "restdone",
    "status": 403,
    "message": "Forbidden"
};
exports[`User Config : Get One : by owner : response should contain body 1`] = {
    "_id": "${_id}",
    "user": "${user}",
    "key": "config",
    "data": {
        "field1": "value1"
    },
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`User Config : Get One : by admin : response should contain body 1`] = {
    "_id": "${_id}",
    "user": "${user}",
    "key": "config",
    "data": {
        "field1": "value1"
    },
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
exports[`User Config : Change : response should contain body 1`] = {
    "_id": "${_id}",
    "user": "${user}",
    "key": "config",
    "data": "new-data",
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}"
};
//# sourceMappingURL=userConfig.spec.ts.snap.js.map