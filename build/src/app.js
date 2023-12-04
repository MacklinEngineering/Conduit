"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureIndexes = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const couchbase = __importStar(require("couchbase"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = require("./db/connection");
const swaggerDocument = yamljs_1.default.load("./swagger.yaml");
exports.app = (0, express_1.default)();
console.log("app is running");
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.use(
  "/swagger-ui",
  swagger_ui_express_1.default.serve,
  swagger_ui_express_1.default.setup(swaggerDocument),
);
exports.app.get("/", (req, res) => {
  res.send(
    '<body onload="window.location = \'/swagger-ui/\'"><a href="/swagger-ui/">Click here to see the API</a>',
  );
});
const ensureIndexes = async () => {
  const { cluster } = await (0, connection_1.connectToDatabase)();
  const bucketIndex = `CREATE PRIMARY INDEX ON ${process.env.CB_BUCKET}`;
  const usersCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.users;`;
  const profileCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.profile;`;
  const articleCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.article;`;
  const commentCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.comment;`;
  try {
    await cluster.query(bucketIndex);
    console.log("Bucket Index Creation: SUCCESS");
  } catch (err) {
    if (err instanceof couchbase.IndexExistsError) {
      console.info("Bucket Index Creation: Index Already Exists");
    } else {
      console.error(err);
    }
  }
  try {
    await cluster.query(profileCollectionIndex);
    console.log("Collection Index Creation: SUCCESS");
  } catch (err) {
    if (err instanceof couchbase.IndexExistsError) {
      console.info("Collection Index Creation: Index Already Exists");
    } else if (err instanceof couchbase.PlanningFailureError) {
      console.info(
        "Collection Index Creation: Profile Collection Not Found. Ensure collection `profile` exists.",
      );
    } else {
      console.log(err);
    }
  }
};
exports.ensureIndexes = ensureIndexes;
exports.app.post("/users", async (req, res) => {
  console.log("Hitting users endpoint");
  const { usersCollection } = await (0, connection_1.connectToDatabase)();
  console.log(usersCollection, "USERS COLLECTION");
  const username = req.body.username;
  const user = { name: username };
  const accessToken = jsonwebtoken_1.default.sign(
    user,
    process.env.ACCESS_TOKEN_SECRET,
  );
  res.json({ accessToken: accessToken });
  if (!req.body.email || !req.body.pass) {
    return res.status(400).send({
      message: `${!req.body.email ? "email " : ""}${
        !req.body.email && !req.body.pass
          ? "and pass are required"
          : req.body.email && !req.body.pass
            ? "pass is required"
            : "is required"
      }`,
    });
  }
  const id = (0, uuid_1.v4)();
  const users = {
    pid: id,
    ...req.body,
    pass: bcryptjs_1.default.hashSync(req.body.pass, 10),
  };
  console.log(users, "USERS");
  await usersCollection
    .insert(id, users)
    .then((result) => {
      return res.send({ ...users, ...result });
    })
    .catch((e) => {
      return res.status(500).send({
        message: `User Insert Failed: ${e.message}`,
      });
    });
  return res.send();
  // // return res.status(500)
  // return res.status(500).send({
  //   message: `Something went wrong}`,
  // });
});
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);
  jsonwebtoken_1.default.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET,
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    },
  );
}
exports.app.post("/profile", async (req, res) => {
  console.log("Hitting profile endpoint");
  const { profileCollection } = await (0, connection_1.connectToDatabase)();
  console.log(profileCollection, "PROFILE COLLECTION");
  if (!req.body.email || !req.body.pass) {
    return res.status(400).send({
      message: `${!req.body.email ? "email " : ""}${
        !req.body.email && !req.body.pass
          ? "and pass are required"
          : req.body.email && !req.body.pass
            ? "pass is required"
            : "is required"
      }`,
    });
  }
  const id = (0, uuid_1.v4)();
  const profile = {
    pid: id,
    ...req.body,
    pass: bcryptjs_1.default.hashSync(req.body.pass, 10),
  };
  console.log(profile, "PROFILE");
  await profileCollection
    .insert(id, profile)
    .then((result) => {
      return res.send({ ...profile, ...result });
    })
    .catch((e) => {
      return res.status(500).send({
        message: `Profile Insert Failed: ${e.message}`,
      });
    });
  return res.send();
  // // return res.status(500)
  // return res.status(500).send({
  //   message: `Something went wrong}`,
  // });
});
exports.app.get("/profile/:pid", async (req, res) => {
  const { profileCollection } = await (0, connection_1.connectToDatabase)();
  try {
    await profileCollection
      .get(req.params.pid)
      .then((result) => res.send(result.value))
      .catch((error) =>
        res.status(500).send({
          message: `KV Operation Failed: ${error.message}`,
        }),
      );
  } catch (error) {
    console.error(error);
  }
});
exports.app.put("/profile/:pid", async (req, res) => {
  const { profileCollection } = await (0, connection_1.connectToDatabase)();
  try {
    await profileCollection
      .get(req.params.pid)
      .then(async (result) => {
        /* Create a New Document with new values,
            if they are not passed from request, use existing values */
        const newDoc = {
          pid: result.value.pid,
          firstName: req.body.firstName
            ? req.body.firstName
            : result.value.firstName,
          lastName: req.body.lastName
            ? req.body.lastName
            : result.value.lastName,
          email: req.body.email ? req.body.email : result.value.email,
          pass: req.body.pass
            ? bcryptjs_1.default.hashSync(req.body.pass, 10)
            : result.value.pass,
        };
        /* Persist updates with new doc */
        await profileCollection
          .upsert(req.params.pid, newDoc)
          .then((result) => res.send({ ...newDoc, ...result }))
          .catch((e) => res.status(500).send(e));
      })
      .catch((e) =>
        res.status(500).send({
          message: `Profile Not Found, cannot update: ${e.message}`,
        }),
      );
  } catch (e) {
    console.error(e);
  }
});
exports.app.delete("/profile/:pid", async (req, res) => {
  const { profileCollection } = await (0, connection_1.connectToDatabase)();
  try {
    await profileCollection
      .remove(req.params.pid)
      .then((result) => res.send(result.value))
      .catch((error) =>
        res.status(500).send({
          message: `Profile Not Found, cannot delete: ${error.message}`,
        }),
      );
  } catch (e) {
    console.error(e);
  }
});
exports.app.get("/profiles", async (req, res) => {
  var _a;
  const { cluster } = await (0, connection_1.connectToDatabase)();
  try {
    const options = {
      parameters: {
        SKIP: Number(req.query.skip || 0),
        LIMIT: Number(req.query.limit || 5),
        SEARCH: `%${
          (_a = req.query.search) === null || _a === void 0
            ? void 0
            : _a.toString().toLowerCase()
        }%`,
      },
    };
    console.log("options ", options);
    const query = `
       SELECT p.*
       FROM ${process.env.CB_BUCKET}._default.profile
       WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH`;
    // const query = `
    //   SELECT p.*
    //   FROM ${process.env.CB_BUCKET}._default.profile p
    //   WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH
    //   LIMIT $LIMIT OFFSET $SKIP;
    // `;
    console.log("cluster.query ", cluster.query);
    await cluster
      .query(query, options)
      .then((result) => res.send(result.rows))
      .catch((error) =>
        res.status(500).send({
          message: `Query failed: ${error.message}`,
        }),
      );
  } catch (e) {
    console.error(e);
  }
});
exports.app.post("/profile/{pid}/article/{aid}", async (req, res) => {
  const { articleCollection } = await (0, connection_1.connectToDatabase)();
  if (!req.body.email || !req.body.pass) {
    return res.status(400).send({
      message: `${!req.body.email ? "email " : ""}${
        !req.body.email && !req.body.pass
          ? "and pass are required"
          : req.body.email && !req.body.pass
            ? "pass is required"
            : "is required"
      }`,
    });
  }
  const id = (0, uuid_1.v4)();
  const profile = {
    pid: id,
    ...req.body,
    pass: bcryptjs_1.default.hashSync(req.body.pass, 10),
  };
  await articleCollection
    .insert(id, profile)
    .then((result) => {
      return res.send({ ...profile, ...result });
    })
    .catch((e) => {
      return res.status(500).send({
        message: `Profile Insert Failed: ${e.message}`,
      });
    });
  return res.status(500).send({
    message: `something went wrong`,
  });
});
exports.app.get("/profile/article/:aid", async (req, res) => {
  const { articleCollection } = await (0, connection_1.connectToDatabase)();
  try {
    await articleCollection
      .get(req.params.pid)
      .then((result) => res.send(result.value))
      .catch((error) =>
        res.status(500).send({
          message: `KV Operation Failed: ${error.message}`,
        }),
      );
  } catch (error) {
    console.error(error);
  }
});
exports.app.put("/profile/article/:aid", async (req, res) => {
  const { articleCollection } = await (0, connection_1.connectToDatabase)();
  try {
    await articleCollection
      .get(req.params.pid)
      .then(async (result) => {
        /* Create a New Document with new values,
            if they are not passed from request, use existing values */
        const newDoc = {
          pid: result.value.pid,
          firstName: req.body.firstName
            ? req.body.firstName
            : result.value.firstName,
          lastName: req.body.lastName
            ? req.body.lastName
            : result.value.lastName,
          email: req.body.email ? req.body.email : result.value.email,
          pass: req.body.pass
            ? bcryptjs_1.default.hashSync(req.body.pass, 10)
            : result.value.pass,
        };
        /* Persist updates with new doc */
        await articleCollection
          .upsert(req.params.pid, newDoc)
          .then((result) => res.send({ ...newDoc, ...result }))
          .catch((e) => res.status(500).send(e));
      })
      .catch((e) =>
        res.status(500).send({
          message: `Profile Not Found, cannot update: ${e.message}`,
        }),
      );
  } catch (e) {
    console.error(e);
  }
});
exports.app.delete("/profile/article/:aid", async (req, res) => {
  const { articleCollection } = await (0, connection_1.connectToDatabase)();
  try {
    await articleCollection
      .remove(req.params.pid)
      .then((result) => res.send(result.value))
      .catch((error) =>
        res.status(500).send({
          message: `Profile Not Found, cannot delete: ${error.message}`,
        }),
      );
  } catch (e) {
    console.error(e);
  }
});
exports.app.get("/profile/articles", async (req, res) => {
  var _a;
  const { cluster } = await (0, connection_1.connectToDatabase)();
  try {
    const options = {
      parameters: {
        SKIP: Number(req.query.skip || 0),
        LIMIT: Number(req.query.limit || 5),
        SEARCH: `%${
          (_a = req.query.search) === null || _a === void 0
            ? void 0
            : _a.toString().toLowerCase()
        }%`,
      },
    };
    const query = `
      SELECT p.*
      FROM ${process.env.CB_BUCKET}._default.profile.comments p
      WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH
      LIMIT $LIMIT OFFSET $SKIP;
    `;
    await cluster
      .query(query, options)
      .then((result) => res.send(result.rows))
      .catch((error) =>
        res.status(500).send({
          message: `Query failed: ${error.message}`,
        }),
      );
  } catch (e) {
    console.error(e);
  }
});
exports.app.post("/profile/article/comment", async (req, res) => {
  const { commentCollection } = await (0, connection_1.connectToDatabase)();
  if (!req.body.email || !req.body.pass) {
    return res.status(400).send({
      message: `${!req.body.email ? "email " : ""}${
        !req.body.email && !req.body.pass
          ? "and pass are required"
          : req.body.email && !req.body.pass
            ? "pass is required"
            : "is required"
      }`,
    });
  }
  const id = (0, uuid_1.v4)();
  const profile = {
    pid: id,
    ...req.body,
    pass: bcryptjs_1.default.hashSync(req.body.pass, 10),
  };
  await commentCollection
    .insert(id, profile)
    .then((result) => {
      return res.send({ ...profile, ...result });
    })
    .catch((e) => {
      return res.status(500).send({
        message: `Profile Insert Failed: ${e.message}`,
      });
    });
  return res.status(500).send({
    message: `Something went wrong`,
  });
});
exports.app.get("/profile/article/:aid", async (req, res) => {
  const { commentCollection } = await (0, connection_1.connectToDatabase)();
  try {
    await commentCollection
      .get(req.params.pid)
      .then((result) => res.send(result.value))
      .catch((error) =>
        res.status(500).send({
          message: `KV Operation Failed: ${error.message}`,
        }),
      );
  } catch (error) {
    console.error(error);
  }
});
exports.app.put("/profile/article/:aid", async (req, res) => {
  const { commentCollection } = await (0, connection_1.connectToDatabase)();
  try {
    await commentCollection
      .get(req.params.pid)
      .then(async (result) => {
        /* Create a New Document with new values,
            if they are not passed from request, use existing values */
        const newDoc = {
          pid: result.value.pid,
          firstName: req.body.firstName
            ? req.body.firstName
            : result.value.firstName,
          lastName: req.body.lastName
            ? req.body.lastName
            : result.value.lastName,
          email: req.body.email ? req.body.email : result.value.email,
          pass: req.body.pass
            ? bcryptjs_1.default.hashSync(req.body.pass, 10)
            : result.value.pass,
        };
        /* Persist updates with new doc */
        await commentCollection
          .upsert(req.params.pid, newDoc)
          .then((result) => res.send({ ...newDoc, ...result }))
          .catch((e) => res.status(500).send(e));
      })
      .catch((e) =>
        res.status(500).send({
          message: `Profile Not Found, cannot update: ${e.message}`,
        }),
      );
  } catch (e) {
    console.error(e);
  }
});
exports.app.delete("/profile/article/:aid", async (req, res) => {
  const { commentCollection } = await (0, connection_1.connectToDatabase)();
  try {
    await commentCollection
      .remove(req.params.pid)
      .then((result) => res.send(result.value))
      .catch((error) =>
        res.status(500).send({
          message: `Profile Not Found, cannot delete: ${error.message}`,
        }),
      );
  } catch (e) {
    console.error(e);
  }
});
exports.app.get("/profile/article/comment", async (req, res) => {
  var _a;
  const { cluster } = await (0, connection_1.connectToDatabase)();
  try {
    const options = {
      parameters: {
        SKIP: Number(req.query.skip || 0),
        LIMIT: Number(req.query.limit || 5),
        SEARCH: `%${
          (_a = req.query.search) === null || _a === void 0
            ? void 0
            : _a.toString().toLowerCase()
        }%`,
      },
    };
    const query = `
      SELECT p.*
      FROM ${process.env.CB_BUCKET}._default.profile.comments p
      WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH
      LIMIT $LIMIT OFFSET $SKIP;
    `;
    await cluster
      .query(query, options)
      .then((result) => res.send(result.rows))
      .catch((error) =>
        res.status(500).send({
          message: `Query failed: ${error.message}`,
        }),
      );
  } catch (e) {
    console.error(e);
  }
});
const port = parseInt(process.env.APP_PORT || "") || 3000;
exports.app.listen(port);
module.exports = { app: exports.app, ensureIndexes: exports.ensureIndexes };
//# sourceMappingURL=app.js.map
