"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DynamicObject_1 = require("../structures/DynamicObject");
const obj = new DynamicObject_1.DynamicObject();
obj.on("set", function (p, v) {
    console.log(p, v);
});
obj.set("Fafa", { bald: true });
obj.set("Ayaka", { bald: false });
const gen = obj.iterate(1);
console.log(gen.next(), gen.next(), gen.next());
console.log(obj.data, obj.size, obj.toBuffer().toString('utf-8'), `${obj}`);
console.log(obj.callCount("delete"), obj.callCount("set"), obj.callCount("tmr"), obj);
const d = obj.as();
//# sourceMappingURL=dynamic.js.map