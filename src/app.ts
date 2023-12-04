import express, { Request, Response } from "express";
import cors from "cors";
import corsOptions from "../config/corsOptions.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import * as couchbase from "couchbase";
import verifyJWT from "./verifyJWT.js";
import users from "./routes/users.js";
import articles from "./routes/articles.js";
import profiles from "./routes/profiles.js";
import tags from "./routes/tags.js";
import comments from "./routes/comments.js";
import favorites from "./routes/favorites.js";
import { connectCapella } from "./db/connect_to_capella.ts";
import {
  clusterConnStr,
  capellaUsername,
  bucketName,
  cluster,
  bucket,
  usersCollection,
  profilesCollection,
  articlesCollection,
  commentsCollection,
  favoritesCollection,
  tagsCollection,
  couchbaseConnection,
} from "./db/plug.ts";
console.log("in app.ts");

export const app = express();
app.use(cors(corsOptions));
app.use("/users", users);
app.use("/articles", articles);
app.use("/profiles/:username", profiles);
app.use("/tags", tags);
app.use("/articles/:slug/comments", comments);
app.use("/articles/:slug/favorite", favorites);
const CB_USER = process.env.CB_USER;
const CB_PASS = process.env.CB_PASS;
const CB_URL = process.env.CB_URL;
const CB_BUCKET = process.env.CB_BUCKET;
if (!CB_USER) {
  throw new Error(
    "Please define the CB_USER environment variable inside dev.env",
  );
}

if (!CB_PASS) {
  throw new Error(
    "Please define the CB_PASS environment variable inside dev.env",
  );
}

if (!CB_URL) {
  throw new Error(
    "Please define the CB_URL environment variable inside dev.env",
  );
}

if (!CB_BUCKET) {
  throw new Error(
    "Please define the CB_BUCKET environment variable inside dev.env",
  );
}
const swaggerDocument = YAML.load("./swagger.yaml");
const SECRET = process.env.SECRET || "Mys3cr3tk3y";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/swagger-ui", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req: Request, res: Response) => {
  res.send(
    '<body onload="window.location = \'/swagger-ui/\'"><a href="/swagger-ui/">Click here to see the API</a>',
  );
});
interface Users {
  username: string;
  email: string;
  password: string;
  bio: string;
  image: string;
  token: string;
  id: string;
}

let token: any;

export async function createAllPrimaryIndexes() {
  const userBucketIndex = `CREATE PRIMARY INDEX ON Conduit1.blog.users`;
  const profileBucketIndex = `CREATE PRIMARY INDEX ON Conduit1.blog.profiles`;
  const articleBucketIndex = `CREATE PRIMARY INDEX ON Conduit1.blog.articles`;
  const commentBucketIndex = `CREATE PRIMARY INDEX ON Conduit1.blog.comments`;
  try {
    await cluster.query(userBucketIndex);
  } catch (err) {
    if (err instanceof couchbase.IndexExistsError) {
      console.info("Users Bucket Index Creation: Index Already Exists");
    } else {
      console.error(err);
    }
  }
  try {
    await cluster.query(profileBucketIndex);
  } catch (err) {
    if (err instanceof couchbase.IndexExistsError) {
      console.info("Profiles Bucket Index Creation: Index Already Exists");
    } else {
      console.error(err);
    }
  }

  try {
    await cluster.query(articleBucketIndex);
  } catch (err) {
    if (err instanceof couchbase.IndexExistsError) {
      console.info("Articles Bucket Index Creation: Index Already Exists");
    } else {
      console.error(err);
    }
  }
  try {
    await cluster.query(commentBucketIndex);
  } catch (err) {
    if (err instanceof couchbase.IndexExistsError) {
      console.info("Comments Bucket Index Creation: Index Already Exists");
    } else {
      console.error(err);
    }
  }
}
createAllPrimaryIndexes();

app.get("/user", verifyJWT, async (req: Request, res: Response) => {
  const token = req.header("authorization")?.replace("Token ", "");
  const queryResult = await bucket
    .scope("blog")
    .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {});

  const userId = queryResult["rows"][0].users.id;
  let getResult = { user: await usersCollection.get(userId) };

  const myUserObject = getResult.user.content;
  return res.status(201).json({ user: myUserObject });
});
app.put("/user", verifyJWT, async (req: Request, res: Response) => {
  const token = req.header("authorization")?.replace("Token ", "");
  const userQuery = await bucket
    .scope("blog") //turn into template literal
    .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {});

  let databaseUser = userQuery.rows[0].users;
  let inputData = req.body.user;

  //Loop through the User request body and update the document object for each key inputted
  Object.keys(inputData).forEach((key) => {
    databaseUser[key] = inputData[key];
  });

  const getResult = await usersCollection
    .replace(databaseUser.id, databaseUser)
    .then(async (result: any) => {
      let updateUserResult = {
        user: await usersCollection.get(databaseUser.id),
      };

      const myUserObject = updateUserResult.user.content;

      return res.status(200).json({ user: myUserObject });
    })
    .catch((e: { message: any }) => {
      return res.status(500).send({
        message: `User Insert Failed: ${e.message}`,
      });
    });
});

export const main = async () => {
  connectCapella();
};
// Run the main function
main().catch((err) => {
  console.log("ERR:", err);
  process.exit(1);
});

const port = parseInt(process.env.APP_PORT || "") || 3002;
app.listen(port);

export default { app, createAllPrimaryIndexes };
