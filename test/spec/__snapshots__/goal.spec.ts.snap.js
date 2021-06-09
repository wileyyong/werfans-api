exports[`Goal : Create : by admin : response should contain body 1`] = {
  "owner": "${owner}",
  "liveStream": "${liveStream}",
  "title": "donations",
  "targetAmount": 100,
  "currentAmount": 0,
  "state": "active",
  "completedAt": null,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "_id": "${_id}"
};
exports[`Goal : Create : by other user : response should contain body 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`Goal : Create : by unauthorized : response should contain body 1`] = {
  "message": "User is not logged in"
};
exports[`Goal : Get list : by user : response should contain body 1`] = [
  {
    "_id": "${_id[0]}",
    "currentAmount": 0,
    "completedAt": null,
    "state": "active",
    "liveStream": "${liveStream[0]}",
    "owner": {
      "_id": "${owner._id[0]}",
      "username": "username1"
    },
    "title": "donations",
    "targetAmount": 100,
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Goal : Get list : by other user : response should contain body 1`] = [
  {
    "_id": "${_id[0]}",
    "currentAmount": 0,
    "completedAt": null,
    "state": "active",
    "liveStream": "${liveStream[0]}",
    "owner": {
      "_id": "${owner._id[0]}",
      "username": "username1"
    },
    "title": "donations",
    "targetAmount": 100,
    "createdAt": "${createdAt[0]}",
    "updatedAt": "${updatedAt[0]}"
  }
];
exports[`Goal : Get list : by unauthorized : response should contain body 1`] = {
  "message": "User is not logged in"
};
exports[`Goal : Get one : by admin : response should contain body 1`] = {
  "currentAmount": 0,
  "completedAt": null,
  "state": "active",
  "_id": "${_id}",
  "liveStream": "${liveStream}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "title": "donations",
  "targetAmount": 100,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Goal : Get one : by user : response should contain body 1`] = {
  "currentAmount": 0,
  "completedAt": null,
  "state": "active",
  "_id": "${_id}",
  "liveStream": "${liveStream}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "title": "donations",
  "targetAmount": 100,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Goal : Get one : by other user : response should contain body 1`] = {
  "currentAmount": 0,
  "completedAt": null,
  "state": "active",
  "_id": "${_id}",
  "liveStream": "${liveStream}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "title": "donations",
  "targetAmount": 100,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Goal : Get one : by unauthorized : response should contain body 1`] = {
  "message": "User is not logged in"
};
exports[`Goal : Update : by admin : response should contain body 1`] = {
  "currentAmount": 0,
  "completedAt": null,
  "state": "active",
  "_id": "${_id}",
  "liveStream": "${liveStream}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "title": "reimbursement",
  "targetAmount": 100,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Goal : Update : by user : response should contain body 1`] = {
  "currentAmount": 0,
  "completedAt": null,
  "state": "active",
  "_id": "${_id}",
  "liveStream": "${liveStream}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "title": "reimbursement",
  "targetAmount": 100,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Goal : Update : by other user : response should contain body 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`Goal : Update : by unauthorized : response should contain body 1`] = {
  "message": "User is not logged in"
};
exports[`Goal : Delete : by other user : response should contain body 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`Goal : Delete : by unauthorized : response should contain body 1`] = {
  "message": "User is not logged in"
};
exports[`Goal : Change state : to cancel : by admin : response should contain body 1`] = {
  "currentAmount": 0,
  "completedAt": null,
  "state": "cancelled",
  "_id": "${_id}",
  "liveStream": "${liveStream}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "title": "donations",
  "targetAmount": 100,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Goal : Change state : to cancel : by user : response should contain body 1`] = {
  "currentAmount": 0,
  "completedAt": null,
  "state": "cancelled",
  "_id": "${_id}",
  "liveStream": "${liveStream}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "title": "donations",
  "targetAmount": 100,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Goal : Change state : to cancel : by other user : response should contain body 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`Goal : Change state : to cancel : by unauthorized : response should contain body 1`] = {
  "message": "User is not logged in"
};
exports[`Goal : Change state : to complete : by admin : response should contain body 1`] = {
  "currentAmount": 0,
  "completedAt": "${completedAt}",
  "state": "reached",
  "_id": "${_id}",
  "liveStream": "${liveStream}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "title": "donations",
  "targetAmount": 100,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Goal : Change state : to complete : by user : response should contain body 1`] = {
  "currentAmount": 0,
  "completedAt": "${completedAt}",
  "state": "reached",
  "_id": "${_id}",
  "liveStream": "${liveStream}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "title": "donations",
  "targetAmount": 100,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Goal : Change state : to complete : by other user : response should contain body 1`] = {
  "type": "restdone",
  "status": 403,
  "message": "Forbidden"
};
exports[`Goal : Change state : to complete : by unauthorized : response should contain body 1`] = {
  "message": "User is not logged in"
};
exports[`Goal : SendTip : when full sum accepted : event should contain params 1`] = {
  "_id": "${_id}",
  "owner": "${owner}",
  "type": "SendTip",
  "sum": -100,
  "ref": "${ref}",
  "refModel": "Goal"
};
exports[`Goal : SendTip : when full sum accepted : response should contain body 1`] = {
  "sum": 100
};
exports[`Goal : SendTip : when sum reduced : event should contain params 1`] = {
  "_id": "${_id}",
  "owner": "${owner}",
  "type": "SendTip",
  "sum": -10,
  "ref": "${ref}",
  "refModel": "Goal"
};
exports[`Goal : SendTip : when sum reduced : response should contain body 1`] = {
  "sum": 10
};
exports[`Goal : SendTip : with sum over balance : response should contain body 1`] = {
  "type": "app",
  "status": 400,
  "error": "RulesViolation",
  "message": "Not Enough Balance",
  "details": {
    "rule": "NotEnoughBalance"
  }
};
exports[`Goal : SendTip : with already full goal : response should contain body 1`] = {
  "type": "app",
  "status": 400,
  "error": "RulesViolation",
  "message": "Wrong Sum",
  "details": {
    "rule": "WrongSum"
  }
};
exports[`Goal : SendTip : with goal in wrong state : response should contain body 1`] = {
  "type": "app",
  "status": 400,
  "error": "RulesViolation",
  "message": "Invalid state",
  "details": {
    "rule": "InvalidState",
    "value": "expired"
  }
};
exports[`Goal : Create : by user : positive case : response should contain body 1`] = {
  "owner": "${owner}",
  "liveStream": "${liveStream}",
  "title": "donations",
  "targetAmount": 100,
  "currentAmount": 0,
  "state": "active",
  "completedAt": null,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}",
  "_id": "${_id}"
};
exports[`Goal : Create : by user : liveStream Completed : response should contain body 1`] = {
  "type": "app",
  "status": 400,
  "error": "RulesViolation",
  "message": "Invalid state",
  "details": {
    "rule": "InvalidState",
    "value": "liveStream must be not Completed"
  }
};
exports[`Goal : Create : by user : already has other goal : response should contain body 1`] = {
  "type": "app",
  "status": 400,
  "error": "RulesViolation",
  "message": "Invalid state",
  "details": {
    "rule": "InvalidState",
    "value": "There should not be other active goal in the liveStream"
  }
};
exports[`Goal : Update : change target amount (should get notification) : response should contain body 1`] = {
  "currentAmount": 0,
  "completedAt": null,
  "state": "active",
  "_id": "${_id}",
  "liveStream": "${liveStream}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "title": "reimbursement",
  "targetAmount": 200,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Goal : Update : by user : positive case : response should contain body 1`] = {
  "currentAmount": 0,
  "completedAt": null,
  "state": "active",
  "_id": "${_id}",
  "liveStream": "${liveStream}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "title": "reimbursement",
  "targetAmount": 100,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
exports[`Goal : Update : by user : should get notification with changed targetAmount : response should contain body 1`] = {
  "currentAmount": 0,
  "completedAt": null,
  "state": "active",
  "_id": "${_id}",
  "liveStream": "${liveStream}",
  "owner": {
    "_id": "${owner._id}",
    "username": "username1"
  },
  "title": "reimbursement",
  "targetAmount": 200,
  "createdAt": "${createdAt}",
  "updatedAt": "${updatedAt}"
};
