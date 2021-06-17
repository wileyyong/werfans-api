"use strict";
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : with wrong digest : response should contain body 1`] = {
    "accepted": false,
    "error": "Wrong digest"
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : with wrong flexId : response should contain body 1`] = {
    "accepted": false,
    "error": "Wrong flexId: wrong"
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : with no metadata : response should contain body 1`] = {
    "accepted": false,
    "error": "no metadata provided"
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : with wrong user id : response should contain body 1`] = {
    "accepted": false,
    "error": "Cast to ObjectId failed for value \"1\" at path \"_id\" for model \"User\""
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : with no user : response should contain body 1`] = {
    "accepted": false,
    "error": "Wrong user: 5eba40c96a30af65f66ead12"
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : failed validation : with wrong secret : response should contain body 1`] = {
    "accepted": false,
    "error": "Wrong secret \"badSecret\""
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : failed validation : without account data : response should contain body 1`] = {
    "accepted": false,
    "error": "Wrong account details \"undefined:undefined\""
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : failed validation : with wrong account : response should contain body 1`] = {
    "accepted": false,
    "error": "Wrong account details \"wrong:0021\""
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : failed validation : with wrong subaccount : response should contain body 1`] = {
    "accepted": false,
    "error": "Wrong account details \"951492:wrong\""
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : failed validation : with wrong eventType : response should contain body 1`] = {
    "accepted": false,
    "error": "Unknown event: wrong"
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : with no targetUser : response should contain body 1`] = {
    "accepted": false,
    "error": "Wrong targetUser: 5eba41ca8db04867f35599da"
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : new subscription : response should contain body 1`] = {
    "accepted": true
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : new subscription : should contain new subscription data 1`] = [
    {
        "active": true,
        "billing": {
            "subscriptionId": "1000000000",
            "transactionId": "0912191101000000159",
            "purchasedTimestamp": "2012‐08‐05 15:18:17"
        },
        "targetUser": "${targetUser[0]}"
    }
];
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : another subscription : response should contain body 1`] = {
    "accepted": true
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : another subscription : should contain new subscription data 1`] = [
    {
        "active": true,
        "billing": {
            "subscriptionId": "1000000000",
            "transactionId": "0912191101000000159",
            "purchasedTimestamp": "2012‐08‐05 15:18:17"
        },
        "targetUser": "${targetUser[0]}"
    }
];
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : new subscription : response should match 1`] = {
    "data": {
        "signalType": "PurchaseResult",
        "recipients": "${data.recipients}",
        "data": {
            "result": true,
            "targetUserId": "${data.data.targetUserId}"
        }
    }
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleFailure : new subscription : response should contain body 1`] = {
    "accepted": true
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleFailure : with wrong flexId : response should contain body 1`] = {
    "accepted": false,
    "error": "Wrong flexId: wrong"
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleFailure : with no metadata : response should contain body 1`] = {
    "accepted": false,
    "error": "no metadata provided"
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleFailure : with no user : response should contain body 1`] = {
    "accepted": false,
    "error": "No user ID provided"
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleFailure : new subscription : response should match 1`] = {
    "data": {
        "signalType": "PurchaseResult",
        "recipients": "${data.recipients}",
        "data": {
            "result": false,
            "errorMessage": "BE-140: Invalid Input."
        }
    }
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : Cancellation : existing subscription : response should match 1`] = {
    "data": {
        "signalType": "SubscriptionCanceled",
        "recipients": "${data.recipients}",
        "data": {}
    }
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : Cancellation : existing subscription : response should contain body 1`] = {
    "accepted": true
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : Cancellation : existing subscription : should not add subscription data 1`] = [
    {
        "active": true,
        "targetUser": "${targetUser[0]}",
        "billing": {
            "subscriptionId": "9999999999",
            "transactionId": "0000000000000000000",
            "purchasedTimestamp": "2012‐08‐05 15:18:17"
        }
    },
    {
        "active": false,
        "targetUser": "${targetUser[1]}",
        "billing": {
            "subscriptionId": "1000000000",
            "transactionId": "0912191101000000159",
            "purchasedTimestamp": "2012‐08‐05 15:18:17",
            "canceledTimestamp": "2012‐08‐05 15:18:17"
        }
    }
];
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : Expiration : existing subscription : response should contain body 1`] = {
    "accepted": true
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : Expiration : existing subscription : should not add subscription data 1`] = [
    {
        "active": true,
        "targetUser": "${targetUser[0]}",
        "billing": {
            "subscriptionId": "9999999999",
            "transactionId": "0000000000000000000",
            "purchasedTimestamp": "2012‐08‐05 15:18:17"
        }
    },
    {
        "active": false,
        "targetUser": "${targetUser[1]}",
        "billing": {
            "subscriptionId": "1000000000",
            "transactionId": "0912191101000000159",
            "purchasedTimestamp": "2012‐08‐05 15:18:17",
            "canceledTimestamp": "2012‐08‐05 15:18:17"
        }
    }
];
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : Expiration : existing subscription : response should match 1`] = {
    "data": {
        "signalType": "SubscriptionCanceled",
        "recipients": "${data.recipients}",
        "data": {}
    }
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : Cancellation : not existing subscription : response should match 1`] = undefined;
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : Cancellation : not existing subscription : response should contain body 1`] = {
    "accepted": false,
    "error": "Cannot find a user for subscription: 1000000000"
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : Cancellation : not existing subscription : should not add subscription data 1`] = [
    {
        "active": true,
        "targetUser": "${targetUser[0]}",
        "billing": {
            "subscriptionId": "9999999999",
            "transactionId": "0000000000000000000",
            "purchasedTimestamp": "2012‐08‐05 15:18:17"
        }
    }
];
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : Expiration : not existing subscription : response should match 1`] = undefined;
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : Expiration : not existing subscription : response should contain body 1`] = {
    "accepted": false,
    "error": "Cannot find a user for subscription: 1000000000"
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : Expiration : not existing subscription : should not add subscription data 1`] = [
    {
        "active": true,
        "targetUser": "${targetUser[0]}",
        "billing": {
            "subscriptionId": "9999999999",
            "transactionId": "0000000000000000000",
            "purchasedTimestamp": "2012‐08‐05 15:18:17"
        }
    }
];
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : new deposit : response should contain body 1`] = {
    "accepted": true
};
exports[`REST /billing - Billing : POST /webhook/:secret - Receive Webhook : NewSaleSuccess : new deposit : should new balancerecord to be created 1`] = {
    "_id": "${_id}",
    "owner": "${owner}",
    "type": "Deposit",
    "refModel": "Deposit",
    "sum": 20,
    "createdAt": "${createdAt}",
    "__v": 0
};
//# sourceMappingURL=billing.spec.ts.snap.js.map