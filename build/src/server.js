"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const startApiServer = async () => {
  await (0, app_js_1.ensureIndexes)().then(() => {
    app_js_1.app.listen(process.env.APP_PORT, () => {
      console.log(`API started at http://localhost:${process.env.APP_PORT}`);
    });
  });
};
startApiServer();
//# sourceMappingURL=server.js.map
