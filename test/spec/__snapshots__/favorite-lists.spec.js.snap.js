exports[`Favorite list : LiveStreams : Put to Favorites list : by right user : should contain fields 1`] = [
  {
    "_id": "${_id[0]}",
    "username": "${username[0]}",
    "type": "entrepreneur"
  }
];
exports[`Favorite list : LiveStreams : Put to Favorites list : by wrong user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "You can use only own ID here"
};
exports[`Favorite list : LiveStreams : Put to Favorites list : by unauthorized : should contain error 1`] = {
  "message": "User is not logged in"
};
exports[`Favorite list : LiveStreams : Get added to Favorite entities list : for user who added to favorites : should contain fields 1`] = [
  {
    "_id": "${_id[0]}",
    "state": "created",
    "viewsCounter": 0,
    "likedUsers": "${likedUsers[0]}",
    "likedUsersCounter": 0,
    "favoritedUsers": "${favoritedUsers[0]}",
    "favoritedUsersCounter": 1,
    "viewers": [],
    "viewersCounter": 0,
    "owner": "${owner[0]}",
    "price": 100,
    "coverUrl": "http://cover.io",
    "url": "http://url.io",
    "duration": -1,
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}",
    "__v": 0
  }
];
exports[`Favorite list : LiveStreams : Get added to Favorite entities list : for user who didn't added to favorites : should contain fields 1`] = [];
exports[`Favorite list : LiveStreams : Get added to Favorite entities list : for unauthorized : should contain error 1`] = {
  "message": "User is not logged in"
};
exports[`Favorite list : LiveStreams : Remove from Favorites list : by wrong user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "You can use only own ID here"
};
exports[`Favorite list : LiveStreams : Remove from Favorites list : by unauthorized : should contain error 1`] = {
  "message": "User is not logged in"
};
exports[`Favorite list : Albums : Put to Favorites list : by right user : should contain fields 1`] = [
  {
    "_id": "${_id[0]}",
    "username": "${username[0]}",
    "type": "entrepreneur"
  }
];
exports[`Favorite list : Albums : Put to Favorites list : by wrong user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "You can use only own ID here"
};
exports[`Favorite list : Albums : Put to Favorites list : by unauthorized : should contain error 1`] = {
  "message": "User is not logged in"
};
exports[`Favorite list : Albums : Get added to Favorite entities list : for user who added to favorites : should contain fields 1`] = [
  {
    "_id": "${_id[0]}",
    "photosCounter": 1,
    "viewsCounter": 0,
    "favoritedUsers": "${favoritedUsers[0]}",
    "favoritedUsersCounter": 1,
    "owner": "${owner[0]}",
    "name": "albumName",
    "price": 100,
    "coverUrl": "http://cover.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}",
    "__v": 0
  }
];
exports[`Favorite list : Albums : Get added to Favorite entities list : for user who didn't added to favorites : should contain fields 1`] = [];
exports[`Favorite list : Albums : Get added to Favorite entities list : for unauthorized : should contain error 1`] = {
  "message": "User is not logged in"
};
exports[`Favorite list : Albums : Remove from Favorites list : by wrong user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "You can use only own ID here"
};
exports[`Favorite list : Albums : Remove from Favorites list : by unauthorized : should contain error 1`] = {
  "message": "User is not logged in"
};
exports[`Favorite list : Photos : Put to Favorites list : by right user : should contain fields 1`] = [
  {
    "_id": "${_id[0]}",
    "username": "${username[0]}",
    "type": "entrepreneur"
  }
];
exports[`Favorite list : Photos : Put to Favorites list : by wrong user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "You can use only own ID here"
};
exports[`Favorite list : Photos : Put to Favorites list : by unauthorized : should contain error 1`] = {
  "message": "User is not logged in"
};
exports[`Favorite list : Photos : Get added to Favorite entities list : for user who added to favorites : should contain fields 1`] = [
  {
    "_id": "${_id[0]}",
    "viewsCounter": 0,
    "favoritedUsers": "${favoritedUsers[0]}",
    "favoritedUsersCounter": 1,
    "album": "${album[0]}",
    "owner": "${owner[0]}",
    "name": "photo name",
    "description": "photo description",
    "watermarkUrl": "http://watermark.io",
    "url": "http://url.io",
    "publicUrl": "http://url.io",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}",
    "__v": 0
  }
];
exports[`Favorite list : Photos : Get added to Favorite entities list : for user who didn't added to favorites : should contain fields 1`] = [];
exports[`Favorite list : Photos : Get added to Favorite entities list : for unauthorized : should contain error 1`] = {
  "message": "User is not logged in"
};
exports[`Favorite list : Photos : Remove from Favorites list : by wrong user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "You can use only own ID here"
};
exports[`Favorite list : Photos : Remove from Favorites list : by unauthorized : should contain error 1`] = {
  "message": "User is not logged in"
};
exports[`Favorite list : Users : Put to Favorites list : by right user : should contain fields 1`] = [
  {
    "viewsCounter": 0,
    "activeSubscriptionsCounter": 0,
    "subscriptionsCounter": 0,
    "subscribersCounter": 0,
    "_id": "${_id[0]}",
    "prices": "${prices[0]}",
    "username": "${username[0]}",
    "type": "entrepreneur"
  }
];
exports[`Favorite list : Users : Put to Favorites list : by wrong user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "You can use only own ID here"
};
exports[`Favorite list : Users : Put to Favorites list : by unauthorized : should contain error 1`] = {
  "message": "User is not logged in"
};
exports[`Favorite list : Users : Get added to Favorite entities list : for user who added to favorites : should contain fields 1`] = [
  {
    "_id": "${_id[0]}",
    "viewsCounter": 0,
    "balance": "${balance[0]}",
    "activeSubscriptionsCounter": 0,
    "subscriptionsCounter": 0,
    "subscribers": "${subscribers[0]}",
    "favoritedUsers": "${favoritedUsers[0]}",
    "favoritedUsersCounter": 1,
    "emailVerified": false,
    "prices": "${prices[0]}",
    "showSubscribersCounter": true,
    "subscriptions": "${subscriptions[0]}",
    "username": "${username[0]}",
    "email": "${email[0]}",
    "type": "entrepreneur",
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Favorite list : Users : Get added to Favorite entities list : for user who didn't added to favorites : should contain fields 1`] = [];
exports[`Favorite list : Users : Get added to Favorite entities list : for unauthorized : should contain error 1`] = {
  "message": "User is not logged in"
};
exports[`Favorite list : Users : Remove from Favorites list : by wrong user : should contain error 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "You can use only own ID here"
};
exports[`Favorite list : Users : Remove from Favorites list : by unauthorized : should contain error 1`] = {
  "message": "User is not logged in"
};
