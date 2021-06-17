"use strict";
exports[`payment Molecule : on payment.accepted : SendTip : target state : when enough to reach : event should contain params 1`] = {
    "_id": "${_id}",
    "owner": "${owner}",
    "type": "GoalReached",
    "sum": 100,
    "ref": "${ref}",
    "refModel": "Goal"
};
exports[`payment Molecule : on payment.accepted : PurchaseContent : should add liveStream to purchases 1`] = [
    {
        "balanceRecord": "${balanceRecord[0]}",
        "ref": "${ref[0]}",
        "refModel": "LiveStream"
    }
];
exports[`payment Molecule : on payment.accepted : PurchaseContent : event should contain params 1`] = {
    "_id": "${_id}",
    "owner": "${owner}",
    "type": "GoalReached",
    "sum": -1,
    "ref": "${ref}",
    "refModel": "LiveStream"
};
//# sourceMappingURL=payment.molecule.spec.ts.snap.js.map