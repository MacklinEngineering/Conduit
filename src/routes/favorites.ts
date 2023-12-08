import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import verifyJWT from "../verifyJWT.js";
import { bucket, articlesCollection } from "../db/connectCapella.ts";

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

/**** 
 Description: Favorites an article 
 Route: /api/articles/{slug}/favorite
 Auth: YES
 Required fields: slug
 Response: returns an article
****/

router
  .route("")
  .post(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
    const token = req.header("authorization")?.replace("Token ", "");
    const slug = req.params["slug"];

    const userQuery = await bucket
      .scope("blog")
      .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {});

    const databaseUser = userQuery.rows[0].users;

    const articlesQuery = await bucket
      .scope("blog")
      .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {});

    const databaseArticle = articlesQuery.rows[0].articles;
    const favoritesCount = databaseArticle.favoritesCount + 1;
    const favorited = true;

    await articlesCollection
      .replace(databaseUser.id, {
        ...databaseArticle,
        favoritesCount,
        favorited,
      })
      .then(async (result: any) => {
        const updateArticleResult = {
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

/**** 
 Description: Unfavorites an article 
 Route: /api/articles/{slug}/favorite
 Auth: YES
 Required fields: slug
 Response: returns an article
****/

router
  .route("")
  .delete(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
    const token = req.header("authorization")?.replace("Token ", "");
    const slug = req.params["slug"];

    const userQuery = await bucket
      .scope("blog")
      .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {});

    const databaseUser = userQuery.rows[0].users;

    const articlesQuery = await bucket
      .scope("blog")
      .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {});

    const databaseArticle = articlesQuery.rows[0].articles;
    const favoritesCount = databaseArticle.favoritesCount - 1;
    const favorited = false;

    await articlesCollection
      .replace(databaseUser.id, {
        ...databaseArticle,
        favoritesCount,
        favorited,
      })
      .then(async (result: any) => {
        const updateArticleResult = {
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
