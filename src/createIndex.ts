import { createAllPrimaryIndexes } from "./app.ts";
import { delay } from "./delay.ts";

const defaultDelay = parseInt(process.env.DELAY || "") || 10;

const initializeIndex = async () => {
  await createAllPrimaryIndexes();
  await delay(defaultDelay);
  console.log("## init-test-index script end ##");
};

initializeIndex().then(() => process.exit());
