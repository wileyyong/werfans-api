exports[`REST /users : POST / - Create : response should contain body 1`] = {
  "username": "username1",
  "email": "username1@email.com",
  "type": "entrepreneur",
  "emailVerified": false,
  "viewsCounter": 0,
  "balance": 1000,
  "prices": [
    {
      "period": "30",
      "price": 49.99
    }
  ],
  "showSubscribersCounter": true,
  "subscribers": [],
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "subscriptions": [],
  "activeSubscriptionsCounter": 0,
  "subscriptionsCounter": 0,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "auth": {
    "access_token": "${auth.access_token}",
    "refresh_token": "${auth.refresh_token}",
    "expires_in": 3600,
    "token_type": "bearer"
  },
  "_id": "${_id}"
};
exports[`REST /users : GET / - Get list : by admin : response should contain body 1`] = [
  {
    "_id": "${_id[0]}",
    "viewsCounter": 0,
    "balance": 1000,
    "activeSubscriptionsCounter": 0,
    "subscriptionsCounter": 0,
    "subscribers": [],
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "emailVerified": false,
    "username": "admin",
    "email": "admin@example.com",
    "admin": true,
    "prices": [
      {
        "period": "30",
        "price": 49.99
      }
    ],
    "showSubscribersCounter": true,
    "subscriptions": [],
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  },
  {
    "_id": "${_id[1]}",
    "viewsCounter": 0,
    "balance": 1000,
    "activeSubscriptionsCounter": 0,
    "subscriptionsCounter": 0,
    "subscribers": [],
    "favoritedUsers": [],
    "favoritedUsersCounter": 0,
    "emailVerified": false,
    "prices": [
      {
        "period": "30",
        "price": 49.99
      }
    ],
    "showSubscribersCounter": true,
    "subscriptions": [],
    "username": "username1",
    "email": "username1@email.com",
    "type": "entrepreneur",
    "createdAt": "${createdAt[1]}",
    "updatedAt": "${updatedAt[1]}"
  }
];
exports[`REST /users : GET /:_id - Get Profile : by owner : response should contain body 1`] = {
  "viewsCounter": 0,
  "balance": 1000,
  "activeSubscriptionsCounter": 0,
  "subscriptionsCounter": 0,
  "subscribers": [],
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "emailVerified": false,
  "_id": "${_id}",
  "prices": [
    {
      "period": "30",
      "price": 49.99
    }
  ],
  "showSubscribersCounter": true,
  "subscriptions": [],
  "username": "username1",
  "email": "username1@email.com",
  "type": "entrepreneur",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`REST /users : Change Profile : response should contain body 1`] = {
  "socialMediaLinks": {
    "facebook": {
      "url": "fb.url"
    },
    "tumblr": {
      "url": "Tumblr.url"
    }
  },
  "arr": {
    "value1": 1,
    "value2": 2,
    "value3": 3,
    "value4": 4
  },
  "mrr": {
    "value1": 1,
    "value2": 2
  },
  "viewsCounter": 0,
  "balance": 1000,
  "activeSubscriptionsCounter": 0,
  "subscriptionsCounter": 0,
  "subscribers": [],
  "favoritedUsers": [],
  "favoritedUsersCounter": 0,
  "emailVerified": false,
  "showSubscribersCounter": true,
  "_id": "${_id}",
  "prices": [
    {
      "period": "30",
      "price": 49.99
    }
  ],
  "subscriptions": [],
  "username": "username1",
  "email": "username1@email.com",
  "type": "entrepreneur",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "age": 12,
  "notificationSettings": {
    "isEmailMuted": true,
    "isInAppMuted": false
  },
  "entrepreneurType": "founder",
  "serviceType": "b2b",
  "industry": "agile",
  "office": "home",
  "region": "asia",
  "pitchDeck": "ab"
};
