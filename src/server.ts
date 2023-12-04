import { app, createAllPrimaryIndexes } from "./app.ts";

const startApiServer = async () => {
  await createAllPrimaryIndexes().then(() => {
    app.listen(process.env.APP_PORT, () => {
      console.log(`API started at http://localhost:${process.env.APP_PORT}`);
    });
  });
};

startApiServer();
