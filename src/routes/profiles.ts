import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import verifyJWTOptional from "../verifyJWTOptional.js";
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

export interface Profile {
  username: string;
  bio: string;
  image: string;
  following: boolean;
}

router
  .route("") // /profiles/:username
  .get(
    verifyJWTOptional,
    bodyParser.json(),
    async (req: Request, res: Response) => {
      var username = req.params["username"];

      const userQuery = await bucket
        .scope("blog") //turn into template literal
        .query(`SELECT * FROM \`users\` WHERE username='${username}';`, {});

      userQuery.rows.forEach((row) => {});

      let databaseUser = userQuery.rows[0].users;
      let following = false;

      const profiles: Profile = {
        username: username,
        bio: databaseUser.bio,
        image: databaseUser.image,
        following: following,
      };

      await profilesCollection
        .upsert(databaseUser.id, profiles)
        .then(async (result: any) => {
          let getResult = {
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
  .route("/follow") // /users
  .post(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
    var username = req.params["username"];

    const userQuery = await bucket
      .scope("blog") //turn into template literal
      .query(`SELECT * FROM \`users\` WHERE username='${username}';`, {});

    userQuery.rows.forEach((row) => {});

    let databaseUser = userQuery.rows[0].users;

    let following = true;

    const profiles: Profile = {
      username: username,
      bio: databaseUser.bio,
      image: databaseUser.image,
      following: following,
    };

    await profilesCollection
      .upsert(databaseUser.id, profiles)
      .then(async (result: any) => {
        let getResult = {
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
    var username = req.params["username"];

    const userQuery = await bucket
      .scope("blog")
      .query(`SELECT * FROM \`users\` WHERE username='${username}';`, {});

    userQuery.rows.forEach((row) => {});

    let databaseUser = userQuery.rows[0].users;

    let following = false;

    const profiles: Profile = {
      username: username,
      bio: databaseUser.bio,
      image: databaseUser.image,
      following: following,
    };

    await profilesCollection
      .upsert(databaseUser.id, profiles)
      .then(async (result: any) => {
        let getResult = {
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
