import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import verifyJWT from "../verifyJWT.js";
import { Profile } from "./profiles.js";
import { bucket, commentsCollection } from "../db/connectCapella.ts";

export interface Users {
  username: string;
  email: string;
  password: string;
  bio: string;
  image: string;
  token: string;
  id: string;
}

export interface Comment {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: Profile;
}

const router = express.Router({ mergeParams: true });

/**** 
 Description: Create a comment for an article 
 Route: /api/articles/{slug}/comments
 Auth: YES
 Required fields: slug
 Response: returns the comment
****/

router
  .route("")
  .post(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
    const token = req.header("authorization")?.replace("Token ", "");
    const slug = req.params["slug"];

    const requestCommentBody = req.body.comment.body;

    const commentId = Math.random();
    const date = new Date().toISOString();

    const userQuery = await bucket
      .scope("blog")
      .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {});

    userQuery.rows.forEach((row) => {});
    const databaseUser = userQuery["rows"][0].users;

    const articlesQuery = await bucket
      .scope("blog")
      .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {});

    const singleArticleFromQuery = articlesQuery.rows[0].articles;

    const comment: Comment = {
      id: commentId,
      createdAt: date,
      updatedAt: date,
      body: requestCommentBody,
      author: {
        username: singleArticleFromQuery.author.username,
        bio: singleArticleFromQuery.author.bio,
        image: singleArticleFromQuery.author.image,
        following: singleArticleFromQuery.author.following,
      },
    };

    await commentsCollection
      .upsert(databaseUser.id, comment)
      .then(async (result: any) => {
        const commentResult = {
          comment: await commentsCollection.get(databaseUser.id),
        };

        const myComment = commentResult.comment.content;
        return res.status(200).json({ comment: myComment });
      })
      .catch((e: { message: any }) => {
        return res.status(500).send({
          message: `Article Upsert Failed: ${e.message}`,
        });
      });
  });

/**** 
 Description: Gets comments for an article 
 Route: /api/articles/{slug}/comments
 Auth: YES
 Required fields: slug
 Response: returns a list of comments
****/

router.route("").get(bodyParser.json(), async (req: Request, res: Response) => {
  const commentsQuery = await bucket
    .scope("blog")
    .query(`SELECT * FROM \`comments\`;`, {});
  const commentsList: Comment[] = [];
  commentsQuery.rows.forEach((row) => {
    commentsList.push(row.comments);
  });
  return res.status(200).json({ comments: commentsList });
});

/**** 
 Description: Delete a comment for an article 
 Route: articles/{slug}/comments/{id}
 Auth: YES
 Required fields: slug, id
 Response: returns the comment
****/

router
  .route("")
  .delete(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
    const token = req.header("authorization")?.replace("Token ", "");
    const commentId = req.params["id"];

    const userQuery = await bucket
      .scope("blog")
      .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {});

    userQuery.rows.forEach((row) => {});
    const databaseUser = userQuery["rows"][0].users;

    const commentsQuery = await bucket
      .scope("blog")
      .query(`SELECT * FROM \`comments\` WHERE id='${commentId}';`, {});

    const singleCommentFromQuery = commentsQuery.rows[0].articles;

    await commentsCollection
      .remove(databaseUser.id, singleCommentFromQuery)
      .then(async (result: any) => {
        const commentResult = {
          comment: await commentsCollection.get(databaseUser.id),
        };
        const myComment = commentResult.comment.content;
        return res.status(200).json({ comment: myComment });
      })
      .catch((e: { message: any }) => {
        return res.status(500).send({
          message: `Comment Upsert Failed: ${e.message}`,
        });
      });
  });

export default router;
