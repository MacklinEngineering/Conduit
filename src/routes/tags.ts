import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { tagsMegaList } from "./articles.js";
import {
  bucket,
} from "../db/connectCapella.ts";

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
console.log("LIST", tagsMegaList)
  articlesQuery["rows"].forEach((row) =>
    tagsMegaList.push(row.articles.tagList),
    console.log(articlesQuery["rows"]),
  );
  console.log("TAG LIST", tagsMegaList)

  return res.status(200).json({ tags: tagsMegaList });
});

export default router;
