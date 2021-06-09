exports[`Notification Service Socket : Send global notification : response should match 1`] = {
  "data": {
    "readable": false,
    "recipients": "${data.recipients}",
    "unread": "${data.unread}",
    "_id": "${data._id}",
    "notificationType": "Testing",
    "body": "test",
    "metadata": {
      "field": "value"
    },
    "createdAt": "${data.createdAt}",
    "updatedAt": "${data.updatedAt}",
    "__v": 0
  }
};
exports[`Notification Service Socket : Send user notification : when NOT isInAppMuted : response should match 1`] = {
  "data": {
    "readable": true,
    "recipients": "${data.recipients}",
    "unread": "${data.unread}",
    "_id": "${data._id}",
    "notificationType": "Testing",
    "body": "test",
    "metadata": {
      "field": "value"
    },
    "createdAt": "${data.createdAt}",
    "updatedAt": "${data.updatedAt}",
    "__v": 0
  }
};
