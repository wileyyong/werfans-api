"use strict";
exports[`Chat Socket : type private : Open chat 1st time by user : response should contain body 1`] = {
    "_id": "${_id}",
    "chatType": "private",
    "__v": 0,
    "createdAt": "${createdAt}",
    "messagesCounter": 0,
    "participants": "${participants}",
    "updatedAt": "${updatedAt}"
};
exports[`Chat Socket : type private : Open chat 2nd time by user : response should contain body 1`] = {
    "_id": "${_id}",
    "chatType": "private",
    "__v": 0,
    "createdAt": "${createdAt}",
    "messagesCounter": 0,
    "participants": "${participants}",
    "updatedAt": "${updatedAt}"
};
exports[`Chat Socket : type private : Open chat by otherUser : response should contain body 1`] = {
    "_id": "${_id}",
    "chatType": "private",
    "__v": 0,
    "createdAt": "${createdAt}",
    "messagesCounter": 0,
    "participants": "${participants}",
    "updatedAt": "${updatedAt}"
};
exports[`Chat Socket : type private : Get chats : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "chatType": "private",
        "createdAt": "${createdAt[0]}",
        "messagesCounter": 0,
        "participants": "${participants[0]}",
        "updatedAt": "${updatedAt[0]}",
        "unreadMessagesCounter": 0
    }
];
exports[`Chat Socket : type private : Get chats count : response should contain body 1`] = {
    "count": 1
};
exports[`Chat Socket : type liveStream : chat exists : response should contain body 1`] = {
    "_id": "${_id}",
    "participants": "${participants}",
    "messagesCounter": 0,
    "chatType": "liveStream",
    "metadata": {
        "liveStream": "${metadata.liveStream}"
    },
    "createdAt": "${createdAt}",
    "updatedAt": "${updatedAt}",
    "__v": 0
};
exports[`Chat Socket : type liveStream : chat does not exist : should be null 1`] = null;
//# sourceMappingURL=chat.socket.spec.ts.snap.js.map