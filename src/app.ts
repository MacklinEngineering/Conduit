import express, {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import {v4} from 'uuid';
import cors from 'cors';
import corsOptions from '../config/corsOptions';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import * as couchbase from 'couchbase';
import jwt from 'jsonwebtoken';
import {connectToDatabase} from './db/connection';
import genUniqueId from './utils/genUniqueId';
import expressJwt from "express-jwt";
import verifyJWT from './verifyJWT';
import { userInfo } from 'os';
import bodyParser from 'body-parser';
// import {cache} from './cache'
import users from "./routes/users";
import articles from "./routes/articles";
import profiles from "./routes/profiles";
import tags from "./routes/tags";
import comments from "./routes/comments";
import favorites from "./routes/favorites";
import { connectCapella}  from './db/connect_to_capella';
import { request } from 'http';
// import {token} from "../src/routes/users"
export const app = express();
app.use(cors(corsOptions));
// app.use(["/users", "/articles", "/articles/:slug/comments", "/articles/:slug/favorite", "profiles/:username", "tags"])
//use the file names in quoatations to handle each respective endpoint that starts with the file name
app.use("/users", users)
app.use("/articles", articles)
app.use("/profiles/:username", profiles)
app.use("/tags", tags)
app.use("/articles/:slug/comments", comments)
app.use("/articles/:slug/favorite", favorites)
const CB_USER = process.env.CB_USER
const CB_PASS = process.env.CB_PASS
const CB_URL = process.env.CB_URL
const CB_BUCKET = process.env.CB_BUCKET
if (!CB_USER) {
    throw new Error(
        'Please define the CB_USER environment variable inside dev.env'
    )
  }
  
  if (!CB_PASS) {
    throw new Error(
        'Please define the CB_PASS environment variable inside dev.env'
    )
  }
  
  if (!CB_URL) {
    throw new Error(
        'Please define the CB_URL environment variable inside dev.env'
    )
  }
  
  if (!CB_BUCKET) {
    throw new Error(
        'Please define the CB_BUCKET environment variable inside dev.env'
    )
  }
const swaggerDocument = YAML.load('./swagger.yaml');
const SECRET = process.env.SECRET || "Mys3cr3tk3y"
console.log("app is HUR")
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/', (req: Request, res: Response) => {
  res.send(
    '<body onload="window.location = \'/swagger-ui/\'"><a href="/swagger-ui/">Click here to see the API</a>'
  );
});
interface Users {
    username : string ;
    email : string;
    password :string;
    bio: string;
    image: string;
    token: string;
    id: string;
 } 

 let token: any
 export const clusterConnStr = 'couchbases://cb.yfxtafw9ud1ccllx.cloud.couchbase.com'
export const capellaUsername = 'Admin1'
export const capellaPassword = 'Password1!'
export const bucketName = 'ConduitDemo'
//token,

// console.log(token)

app.get("/user", verifyJWT, async ( req: Request, res: Response) => {
  // app.get("/user", verifyJWT, bodyParser.json(), async ( req: Request, res: Response) => {
//How do I return the user?
    console.log("YOO INSIDE GET", req.headers)
    const token = req.header("authorization")?.replace("Token ","")
    console.log(token)
    // const id: string = v4()
        // res.append(id)
        //TODO: Check if the email is already in use
        //Then, fail this and notify the user
        const cluster = await couchbase.connect(clusterConnStr, {
          username: capellaUsername,
          password: capellaPassword,
          // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
          // when accessing Capella from a different Wide Area Network
          // or Availability Zone (e.g. your laptop).
          configProfile: 'wanDevelopment',
        })
      
        // console.log("Here is the Cluster: ", cluster)
        const bucket = cluster.bucket(bucketName)
        // console.log("Here is the Bucket: ", bucket)
        // Get a reference to the default collection, required only for older Couchbase server versions
        // const defaultCollection = bucket.defaultCollection()
      
        const usersCollection = bucket.scope('blog').collection('users')
        const profilesCollection = bucket.scope('blog').collection('profiles')
        const articlesCollection = bucket.scope('blog').collection('articles')
        const commentsCollection = bucket.scope('blog').collection('comments')
        const favoritesCollection = bucket.scope('blog').collection('favorites')
        const tagsCollection = bucket.scope('blog').collection('tags')
  
        let couchbaseConnection = {
          cluster,
          bucket,
          // collection,
          usersCollection,
          profilesCollection,
          articlesCollection,
          commentsCollection,
          favoritesCollection,
          tagsCollection
        }

        const queryResult = await bucket
            .scope('blog')                                //turn into template literal
            .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
            })

    queryResult.rows.forEach((row) => {
    console.log("ROWS IN THE WORKING /user QUERY", row)
    })

    console.log("QUERY RESULT :", queryResult)
    const userId = queryResult["rows"][0].users.id
    let getResult = {"user" : await usersCollection.get(userId)} //wrong but just a placeholder
    console.log('Get Result: ', getResult )

    const myUserObject = getResult.user.content
    console.log(myUserObject, "MY USER OBJECT")

    
            return res.status(201).json({user : myUserObject})

});
app.put("/user", verifyJWT, async ( req: Request, res: Response) => {

  // Query the database to grab the user object
  //Take whatever the user inputs into each field and replace that with the new req.body.blah
  //If the user doesn't update something, keep the previous value




  // app.get("/user", verifyJWT, bodyParser.json(), async ( req: Request, res: Response) => {
//How do I return the user?
    console.log("YOO INSIDE PUT", req.headers)
    const token = req.header("authorization")?.replace("Token ","")
    console.log(token)
    // const id: string = v4()
        // res.append(id)
        //TODO: Check if the email is already in use
        //Then, fail this and notify the user
        const cluster = await couchbase.connect(clusterConnStr, {
          username: capellaUsername,
          password: capellaPassword,
          // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
          // when accessing Capella from a different Wide Area Network
          // or Availability Zone (e.g. your laptop).
          configProfile: 'wanDevelopment',
        })
      
        // console.log("Here is the Cluster: ", cluster)
        const bucket = cluster.bucket(bucketName)
        // console.log("Here is the Bucket: ", bucket)
        // Get a reference to the default collection, required only for older Couchbase server versions
        // const defaultCollection = bucket.defaultCollection()
      
        const usersCollection = bucket.scope('blog').collection('users')
        const profilesCollection = bucket.scope('blog').collection('profiles')
        const articlesCollection = bucket.scope('blog').collection('articles')
        const commentsCollection = bucket.scope('blog').collection('comments')
        const favoritesCollection = bucket.scope('blog').collection('favorites')
        const tagsCollection = bucket.scope('blog').collection('tags')
  
        let couchbaseConnection = {
          cluster,
          bucket,
          // collection,
          usersCollection,
          profilesCollection,
          articlesCollection,
          commentsCollection,
          favoritesCollection,
          tagsCollection
        }

        const userQuery = await bucket
            .scope('blog')                                //turn into template literal
            .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
            })

            userQuery.rows.forEach((row) => {
    console.log("ROWS IN THE WORKING put /user QUERY", row)
    })

    console.log("QUERY RESULT :", userQuery)
    let databaseUser = userQuery.rows[0].users
    let inputData = req.body.user

    //Loop through the User request body and update the document object for each key inputted
    Object.keys(inputData).forEach(key => {
      databaseUser[key] = inputData[key]
    });

  const getResult = await usersCollection
  .replace(databaseUser.id, databaseUser)  //rewrites the entire document, have to learn how "mutateIn" method works for optimization
  .then((result: any) => {
      console.log("The Replace Works")
  })
  .catch((e: {message: any}) => {
      return res.status(500).send({
      message: `User Insert Failed: ${e.message}`,
      });
  });

  // Load the Document and print it
  // Prints Content and Metadata of the stored Document


  //TODO: Requires refactor to programmatically add to user nested object 

  let updateUserResult = {"user" : await usersCollection.get(databaseUser.id)}

  console.log('Update User Result: ', updateUserResult )

  const myUserObject = updateUserResult.user.content
  console.log(myUserObject, "MY USER OBJECT AFTER REPLACE METHOD WITH TOKEN AND ID")
    
            return res.status(200).json({user : myUserObject})

});

console.log("running main function")
export const main = async () => {
    connectCapella()

}
// Run the main function
main()
  .catch((err) => {
    console.log('ERR:', err)
    process.exit(1)
  })

const port = parseInt(process.env.APP_PORT || '') || 3002;
app.listen(port)
// ensureIndexes()
// module.exports = {app, ensureIndexes};
module.exports = {app};
//   // Run the main function
//   main()
//     .catch((err) => {
//       console.log('ERR:', err)
//       process.exit(1)
//     })
//     .then(process.exit)