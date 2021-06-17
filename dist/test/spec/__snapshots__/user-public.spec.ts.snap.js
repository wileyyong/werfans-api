"use strict";
exports[`User Public : Get list : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "viewsCounter": 0,
        "activeSubscriptionsCounter": 0,
        "subscriptionsCounter": 0,
        "username": "admin",
        "prices": [
            {
                "period": "30",
                "price": 49.99
            }
        ]
    },
    {
        "_id": "${_id[1]}",
        "viewsCounter": 0,
        "activeSubscriptionsCounter": 0,
        "subscriptionsCounter": 0,
        "prices": [
            {
                "period": "30",
                "price": 49.99
            }
        ],
        "username": "username1",
        "type": "entrepreneur"
    },
    {
        "_id": "${_id[2]}",
        "viewsCounter": 0,
        "activeSubscriptionsCounter": 0,
        "subscriptionsCounter": 0,
        "prices": [
            {
                "period": "30",
                "price": 49.99
            }
        ],
        "username": "username2",
        "type": "entrepreneur",
        "about": "I am",
        "birthDate": "2000-01-01T00:00:00.000Z"
    }
];
exports[`User Public : Get otherUser's record : response should contain body 1`] = {
    "viewsCounter": 0,
    "activeSubscriptionsCounter": 0,
    "subscriptionsCounter": 0,
    "_id": "${_id}",
    "prices": [
        {
            "period": "30",
            "price": 49.99
        }
    ],
    "username": "username2",
    "type": "entrepreneur",
    "about": "I am",
    "birthDate": "2000-01-01T00:00:00.000Z"
};
exports[`User Public : Get otherUser's record : Authorized : response should contain body 1`] = {
    "viewsCounter": 0,
    "activeSubscriptionsCounter": 0,
    "subscriptionsCounter": 0,
    "_id": "${_id}",
    "prices": [
        {
            "period": "30",
            "price": 49.99
        }
    ],
    "username": "username2",
    "type": "entrepreneur",
    "about": "I am",
    "birthDate": "2000-01-01T00:00:00.000Z"
};
exports[`User Public : Get otherUser's record : Unathorized : response should contain body 1`] = {
    "viewsCounter": 0,
    "activeSubscriptionsCounter": 0,
    "subscriptionsCounter": 0,
    "_id": "${_id}",
    "prices": [
        {
            "period": "30",
            "price": 49.99
        }
    ],
    "username": "username2",
    "type": "entrepreneur",
    "about": "I am",
    "birthDate": "2000-01-01T00:00:00.000Z"
};
//# sourceMappingURL=user-public.spec.ts.snap.js.map