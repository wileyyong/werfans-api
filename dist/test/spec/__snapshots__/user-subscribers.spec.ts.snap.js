"use strict";
exports[`User Subscribers : GetSubscribers : without filters : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "viewsCounter": 0,
        "activeSubscriptionsCounter": 0,
        "subscriptionsCounter": 0,
        "prices": [
            {
                "period": "30",
                "price": 49.99
            }
        ],
        "username": "user",
        "type": "entrepreneur"
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
        "username": "otheruser",
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
        "username": "expireduser",
        "type": "entrepreneur"
    }
];
exports[`User Subscribers : GetSubscribers : with q-search : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "viewsCounter": 0,
        "activeSubscriptionsCounter": 0,
        "subscriptionsCounter": 0,
        "prices": [
            {
                "period": "30",
                "price": 49.99
            }
        ],
        "username": "otheruser",
        "type": "entrepreneur"
    }
];
//# sourceMappingURL=user-subscribers.spec.ts.snap.js.map