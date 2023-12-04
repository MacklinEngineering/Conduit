import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import * as couchbase from "couchbase";
import verifyJWT from "../verifyJWT.js";
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

router
  .route("")
  .post(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
    const token = req.header("authorization")?.replace("Token ", "");
    var slug = req.params["slug"];

    const userQuery = await bucket
      .scope("blog")
      .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {});

    let databaseUser = userQuery.rows[0].users;

    const articlesQuery = await bucket
      .scope("blog") //turn into template literal
      .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {});

    let databaseArticle = articlesQuery.rows[0].articles;
    let favoritesCount = databaseArticle.favoritesCount + 1;
    let favorited = true;

    const getResult = await articlesCollection
      .replace(databaseUser.id, {
        ...databaseArticle,
        favoritesCount,
        favorited,
      }) //rewrites the entire document, have to learn how "mutateIn" method works for optimization
      .then(async (result: any) => {
        let updateArticleResult = {
          article: await articlesCollection.get(databaseUser.id),
        };
        const myArticleObject = updateArticleResult.article.content;

        return res.status(200).json({ article: myArticleObject });
      })
      .catch((e: { message: any }) => {
        return res.status(500).send({
          message: `Article Insert Failed: ${e.message}`,
        });
      });
  });

router
  .route("")
  .delete(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
    const token = req.header("authorization")?.replace("Token ", "");
    var slug = req.params["slug"];

    const userQuery = await bucket
      .scope("blog") //turn into template literal
      .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {});

    let databaseUser = userQuery.rows[0].users;

    const articlesQuery = await bucket
      .scope("blog") //turn into template literal
      .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {});

    let databaseArticle = articlesQuery.rows[0].articles;
    let favoritesCount = databaseArticle.favoritesCount - 1;
    let favorited = false;

    const getResult = await articlesCollection
      .replace(databaseUser.id, {
        ...databaseArticle,
        favoritesCount,
        favorited,
      }) //rewrites the entire document, have to learn how "mutateIn" method works for optimization
      .then(async (result: any) => {
        let updateArticleResult = {
          article: await articlesCollection.get(databaseUser.id),
        };
        const myArticleObject = updateArticleResult.article.content;

        return res.status(200).json({ article: myArticleObject });
      })
      .catch((e: { message: any }) => {
        return res.status(500).send({
          message: `Article Insert Failed: ${e.message}`,
        });
      });
  });

export default router;
