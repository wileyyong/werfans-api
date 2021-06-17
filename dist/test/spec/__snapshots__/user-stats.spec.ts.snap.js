"use strict";
exports[`User stats : by owner : response should contain body 1`] = {
    "_id": "${_id}",
    "stats": {
        "liveStreamsCounter": 4,
        "photosCounter": 2,
        "videosCounter": 3
    }
};
exports[`User stats : in public one : response should contain body 1`] = {
    "_id": "${_id}",
    "stats": {
        "liveStreamsCounter": 4,
        "photosCounter": 2,
        "videosCounter": 3
    }
};
exports[`User stats : in public list : response should contain body 1`] = [
    {
        "_id": "${_id[0]}",
        "stats": {
            "liveStreamsCounter": 0,
            "photosCounter": 0,
            "videosCounter": 0
        }
    },
    {
        "_id": "${_id[1]}",
        "stats": {
            "liveStreamsCounter": 4,
            "photosCounter": 2,
            "videosCounter": 3
        }
    },
    {
        "_id": "${_id[2]}",
        "stats": {
            "liveStreamsCounter": 1,
            "photosCounter": 1,
            "videosCounter": 1
        }
    }
];
//# sourceMappingURL=user-stats.spec.ts.snap.js.map