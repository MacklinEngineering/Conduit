import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import verifyJWTOptional from "../verifyJWTOptional.js";
import verifyJWT from "../verifyJWT.js";
import {
  bucket,
  profilesCollection,
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

export interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

router
  .route("")
  .get(
    verifyJWTOptional,
    bodyParser.json(),
    async (req: Request, res: Response) => {
      const username = req.params["username"];

      const userQuery = await bucket
        .scope("blog")
        .query(`SELECT * FROM \`users\` WHERE username='${username}';`, {});

      userQuery.rows.forEach((row) => {});

      const databaseUser = userQuery.rows[0].users;
      const following = false;

      const profiles: Profile = {
        username: username,
        bio: databaseUser.bio,
        image: databaseUser.image,
        following: following,
      };

      await profilesCollection
        .upsert(databaseUser.id, profiles)
        .then(async (result: any) => {
          const getResult = {
            profile: await profilesCollection.get(databaseUser.id),
          };

          const myProfileObject = getResult.profile.content;

          return res.status(200).json({ profile: myProfileObject });
        })
        .catch((e: { message: any }) => {
          return res.status(500).send({
            message: `User Insert Failed: ${e.message}`,
          });
        });
    },
  );

router
  .route("/follow")
  .post(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
    const username = req.params["username"];

    const userQuery = await bucket
      .scope("blog")
      .query(`SELECT * FROM \`users\` WHERE username='${username}';`, {});

    userQuery.rows.forEach((row) => {});

    const databaseUser = userQuery.rows[0].users;

    const following = true;

    const profiles: Profile = {
      username: username,
      bio: databaseUser.bio,
      image: databaseUser.image,
      following: following,
    };

    await profilesCollection
      .upsert(databaseUser.id, profiles)
      .then(async (result: any) => {
        const getResult = {
          profile: await profilesCollection.get(databaseUser.id),
        };

        const myProfileObject = getResult.profile.content;

        return res.status(200).json({ profile: myProfileObject });
      })
      .catch((e: { message: any }) => {
        return res.status(500).send({
          message: `User Insert Failed: ${e.message}`,
        });
      });
  });

router
  .route("/follow")
  .delete(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
    const username = req.params["username"];

    const userQuery = await bucket
      .scope("blog")
      .query(`SELECT * FROM \`users\` WHERE username='${username}';`, {});

    userQuery.rows.forEach((row) => {});

    const databaseUser = userQuery.rows[0].users;

    const following = false;

    const profiles: Profile = {
      username: username,
      bio: databaseUser.bio,
      image: databaseUser.image,
      following: following,
    };

    await profilesCollection
      .upsert(databaseUser.id, profiles)
      .then(async (result: any) => {
        const getResult = {
          profile: await profilesCollection.get(databaseUser.id),
        };

        const myProfileObject = getResult.profile.content;

        return res.status(200).json({ profile: myProfileObject });
      })
      .catch((e: { message: any }) => {
        return res.status(500).send({
          message: `User Insert Failed: ${e.message}`,
        });
      });
  });

export default router;
