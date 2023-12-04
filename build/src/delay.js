"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = void 0;
const delay = (t) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve;
    }, t);
  });
};
exports.delay = delay;
//# sourceMappingURL=delay.js.map
