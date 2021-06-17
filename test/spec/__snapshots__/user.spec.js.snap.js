exports[`User : Sign up : should contain fields 1`] = {
  "username": "username1",
  "email": "username1@email.com",
  "type": "entrepreneur",
  "subscribers": [],
  "favoritedUsers": [],
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
exports[`User : Get Profile : should contain fields 1`] = {
  "subscribers": [],
  "favoritedUsers": [], 
  "_id": "${_id}",
  "username": "username1",
  "email": "username1@email.com",
  "type": "entrepreneur",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`User : Change Profile : Change Profile by owner : should contain fields 1`] = {
  "publicFields": {
    "fullName": true
  },
  "subscribers": [],
  "favoritedUsers": [], 
  "_id": "${_id}",
  "username": "username1",
  "email": "username1@email.com",
  "type": "entrepreneur",
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
