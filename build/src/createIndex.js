"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const delay_1 = require("./delay");
const defaultDelay = parseInt(process.env.DELAY || '') || 10;
const initializeIndex = async () => {
    await (0, app_1.ensureIndexes)();
    await (0, delay_1.delay)(defaultDelay);
    console.log('## init-test-index script end ##');
};
initializeIndex().then(() => process.exit());
//# sourceMappingURL=createIndex.js.map