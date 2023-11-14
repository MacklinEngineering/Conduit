import bodyParser from 'body-parser';
import express, {Request, Response} from 'express';
import verifyJWTOptional from '../verifyJWTOptional.js';
import * as couchbase from 'couchbase';
import verifyJWT from '../verifyJWT.js';
import {clusterConnStr,capellaUsername, capellaPassword , bucketName, cluster, bucket, usersCollection, profilesCollection, articlesCollection, commentsCollection, favoritesCollection, tagsCollection, couchbaseConnection} from "../db/plug.ts"


const router = express.Router({ mergeParams: true });
export interface Users {
    username : string ;
    email : string;
    password :string;
    bio: string;
    image: string;
    token: string;
    id: string;
 }

 export interface Profile{
    username: string // "jake",
    bio: string; //"I work at statefarm",
    image: string; //"https://api.realworld.io/images/smiley-cyrus.jpg",
    following: boolean; //false
 }

router
    .route("") // /profiles/:username
    .get(verifyJWTOptional, bodyParser.json(), async (req: Request, res: Response) => {


        // console.log(Object.keys(req))
        // console.log(req.params)
    var username = req.params['username'] 
   
    // console.log("Username :",username);

    const userQuery = await bucket
            .scope('blog')                                //turn into template literal
            .query(`SELECT * FROM \`users\` WHERE username='${username}';`, {
            })

            userQuery.rows.forEach((row) => {
    // console.log("ROWS IN THE WORKING put /user QUERY", row)
    })

    // console.log("QUERY RESULT :", userQuery)
    let databaseUser = userQuery.rows[0].users
    let following = false //default to false until a user clicks a button to press following - TODO, possibly also handle if self && logged in

    const profiles : Profile = {
        username : username,
        bio: databaseUser.bio,
        image: databaseUser.image,
        following: following 
        }
        await profilesCollection
        .upsert(databaseUser.id, profiles)
        .then((result: any) => {
            console.log("The PROFILE Upsert Works")
            // return res.send({...users, ...result});
        })
        .catch((e: {message: any}) => {
            return res.status(500).send({
            message: `User Insert Failed: ${e.message}`,
            });
        });

        //NOW Send this object up to the ProfilesCollection

        let getResult = {"profile" : await profilesCollection.get(databaseUser.id)}
    
        // console.log('Get Result: ', getResult )

        const myProfileObject = getResult.profile.content
        // console.log(myProfileObject, "MY PROFILE OBJECT")
        
        return res.status(200).json({"profile" : myProfileObject})

    })

router
    .route("/follow") // /users
    .post(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
        console.log("Inside POST /profiles/:username/follow endpoint")
        console.log(Object.keys(req))
        console.log(req.params)
    var username = req.params['username'] 
   
    console.log("Username :",username);
       
        const userQuery = await bucket
        .scope('blog')                                //turn into template literal
        .query(`SELECT * FROM \`users\` WHERE username='${username}';`, {
        })

        userQuery.rows.forEach((row) => {
// console.log("ROWS IN THE WORKING put /user QUERY", row)
})

// console.log("QUERY RESULT :", userQuery)
let databaseUser = userQuery.rows[0].users

let following = true

const profiles : Profile = {
    username : username,
    bio: databaseUser.bio,
    image: databaseUser.image,
    following: following //default to false until a user clicks a button to press following - TODO, possibly also handle if self && logged in
    }
    await profilesCollection
    .upsert(databaseUser.id, profiles)
    .then((result: any) => {
        console.log("The PROFILE Upsert Works")
        // return res.send({...users, ...result});
    })
    .catch((e: {message: any}) => {
        return res.status(500).send({
        message: `User Insert Failed: ${e.message}`,
        });
    });

    //NOW Send this object up to the ProfilesCollection

    let getResult = {"profile" : await profilesCollection.get(databaseUser.id)}

    console.log('Get Result: ', getResult )

    const myProfileObject = getResult.profile.content
    console.log(myProfileObject, "MY USER OBJECT")

    return res.status(200).json({"profile" : myProfileObject})
        // return res.send(console.log("Hello POST Profile"))

    })

router
    .route("/follow") // /users
    .delete(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
        console.log("Inside DELETE /profiles/:username/follow endpoint")
        console.log(Object.keys(req))
        console.log(req.params)
        var username = req.params['username'] 
   
    console.log("Username :",username);
        
        const userQuery = await bucket
        .scope('blog')                                //turn into template literal
        .query(`SELECT * FROM \`users\` WHERE username='${username}';`, {
        })

        userQuery.rows.forEach((row) => {
// console.log("ROWS IN THE WORKING put /user QUERY", row)
})

// console.log("QUERY RESULT :", userQuery)
let databaseUser = userQuery.rows[0].users

let following = false

const profiles : Profile = {
    username : username,
    bio: databaseUser.bio,
    image: databaseUser.image,
    following: following //default to false until a user clicks a button to press following - TODO, possibly also handle if self && logged in
    }
    await profilesCollection
    .upsert(databaseUser.id, profiles)
    .then((result: any) => {
        console.log("The PROFILE Upsert Works")
        // return res.send({...users, ...result});
    })
    .catch((e: {message: any}) => {
        return res.status(500).send({
        message: `User Insert Failed: ${e.message}`,
        });
    });

    //NOW Send this object up to the ProfilesCollection

    let getResult = {"profile" : await profilesCollection.get(databaseUser.id)}

    // console.log('Get Result: ', getResult )

    const myProfileObject = getResult.profile.content
    // console.log(myProfileObject, "MY USER OBJECT")

      
    
   
    return res.status(200).json({"profile" : myProfileObject})
    })

export default router