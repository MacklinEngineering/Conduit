import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { tagsMegaList } from "./articles.js";
import { bucket } from "../db/connectCapella.ts";

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
 Description: Gets tags for an article
 Route: /tags
 Auth: NO
 Response: returns tags
****/

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
