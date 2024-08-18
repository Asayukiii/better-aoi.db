"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Util_1 = require("../util/Util");
const data = {
    mytest: 'owo',
    k: [],
    dude: {
        nope: true
    }
};
const src = {
    mytest: 'no',
    k: {},
    dude: {
        brah: 'false',
        nope: false
    },
    owa: {
        owo: null
    }
};
console.log(Util_1.Util.mergeDefault(data, src));
//# sourceMappingURL=merger.js.map