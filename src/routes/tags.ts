import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { tagsMegaList, Article } from "./articles.js";
import * as couchbase from "couchbase";
import {
  clusterConnStr,
  capellaUsername,
  capellaPassword,
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
} from "../db/plug.ts";

const router = express.Router({ mergeParams: true });
export interface Users {
  username: string;
  email: string;
  password: string;
  bio: string;
  image: string;
  token: string;
  id: string;
}

router.route("").get(bodyParser.json(), async (req: Request, res: Response) => {
  const articlesQuery = await bucket
    .scope("blog")
    .query(`SELECT * FROM \`articles\` WHERE tagList!='';`, {});

  articlesQuery["rows"].forEach((row) =>
    tagsMegaList.push(row.articles.tagList),
  );

  return res.status(200).json({ tags: tagsMegaList });
});

export default router;
