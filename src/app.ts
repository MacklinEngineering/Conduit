import express, {Request, Response} from 'express';
import cors from 'cors';
import corsOptions from '../config/corsOptions.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import * as couchbase from 'couchbase';
import verifyJWT from './verifyJWT.js';
import users from "./routes/users.js";
import articles from "./routes/articles.js";
import profiles from "./routes/profiles.js";
import tags from "./routes/tags.js";
import comments from "./routes/comments.js";
import favorites from "./routes/favorites.js";
import { connectCapella}  from './db/connect_to_capella.ts';
import {clusterConnStr,capellaUsername, bucketName, cluster, bucket, usersCollection, profilesCollection, articlesCollection, commentsCollection, favoritesCollection, tagsCollection, couchbaseConnection} from "./db/plug.ts"
console.log("in app.ts")

export const app = express();
app.use(cors(corsOptions));
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

export async function createAllPrimaryIndexes(){
  const userBucketIndex = ​`CREATE PRIMARY INDEX ON Conduit1.blog.users` 
  const profileBucketIndex = ​`CREATE PRIMARY INDEX ON Conduit1.blog.profiles` 
  const articleBucketIndex = ​`CREATE PRIMARY INDEX ON Conduit1.blog.articles`    
  const commentBucketIndex = ​`CREATE PRIMARY INDEX ON Conduit1.blog.comments` 
  // const tagsBucketCreation =  ​`CREATE PRIMARY INDEX ON Conduit1.blog.tags`  
    try{
        await cluster.query(userBucketIndex)
    console.log("USERS BUCKET INDEX CREATION SUCCESS")
    }
    catch (err){
        if (err instanceof couchbase.IndexExistsError) {
            console.info('Users Bucket Index Creation: Index Already Exists')
        } else {
            console.error(err)
        }
    }
    try{
        await cluster.query(profileBucketIndex)
    console.log("PROFILES BUCKET INDEX CREATION SUCCESS")
    }
    catch (err){
        if (err instanceof couchbase.IndexExistsError) {
            console.info('Profiles Bucket Index Creation: Index Already Exists')
        } else {
            console.error(err)
        }
    }
     
      try{
          await cluster.query(articleBucketIndex)
      console.log("ARTICLES BUCKET INDEX CREATION SUCCESS")
      }
      catch (err){
          if (err instanceof couchbase.IndexExistsError) {
              console.info('Articles Bucket Index Creation: Index Already Exists')
          } else {
              console.error(err)
          }
      }
      try{
          await cluster.query(commentBucketIndex)
      console.log("COMMENTS BUCKET INDEX CREATION SUCCESS")
      }
      catch (err){
          if (err instanceof couchbase.IndexExistsError) {
              console.info('Comments Bucket Index Creation: Index Already Exists')
          } else {
              console.error(err)
          }
      }
    
}
createAllPrimaryIndexes()

app.get("/user", verifyJWT, async ( req: Request, res: Response) => {
    console.log("YOO INSIDE GET", req.headers)
    const token = req.header("authorization")?.replace("Token ","")
    console.log(token)
   
        const queryResult = await bucket
            .scope('blog')                                
            .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
            })

    queryResult.rows.forEach((row) => {
    console.log("ROWS IN THE WORKING /user QUERY", row)
    })

    console.log("QUERY RESULT :", queryResult)
    const userId = queryResult["rows"][0].users.id
    let getResult = {"user" : await usersCollection.get(userId)} 
    console.log('Get Result: ', getResult )

    const myUserObject = getResult.user.content
    console.log(myUserObject, "MY USER OBJECT")

    
            return res.status(201).json({user : myUserObject})

});
app.put("/user", verifyJWT, async ( req: Request, res: Response) => {

  // Query the database to grab the user object
  //Take whatever the user inputs into each field and replace that with the new req.body.blah
  //If the user doesn't update something, keep the previous value

    console.log("YOO INSIDE PUT", req.headers)
    const token = req.header("authorization")?.replace("Token ","")
    console.log(token)

        //TODO: Check if the email is already in use
        //Then, fail this and notify the user

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

console.log("running main function HEEHEE")
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

export default {app, createAllPrimaryIndexes}