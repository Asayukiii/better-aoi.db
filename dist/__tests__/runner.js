"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const arg = process.argv[2];
(0, child_process_1.fork)(`./dist/__tests__/${arg ?? "test"}.js`);
//# sourceMappingURL=runner.js.map