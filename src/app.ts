import express, {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import {v4} from 'uuid';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import * as couchbase from 'couchbase';
import jwt from 'jsonwebtoken';
import {connectToDatabase} from './db/connection';
import genUniqueId from './utils/genUniqueId';
import expressJwt from "express-jwt";
import verifyJWT from './verifyJWT';
import { userInfo } from 'os';
// import {cache} from './cache'
import users from "./routes/users";
import articles from "./routes/articles";
import profiles from "./routes/profiles";
import tags from "./routes/tags";

export const app = express();

//use the file names in quoatations to handle each respective endpoint that starts with the file name
app.use("/users", users)
// app.use("/articles", articles)
// app.use("/profiles", profiles)
// app.use("/tags", tags)

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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/', (req: Request, res: Response) => {
  res.send(
    '<body onload="window.location = \'/swagger-ui/\'"><a href="/swagger-ui/">Click here to see the API</a>'
  );
});
// console.log("about to enter ensureIndexes")
// export const ensureIndexes = async () => {

// console.log("entered ensureIndexes")
//   const {cluster} = await connectToDatabase();

//   /**
//  * Global is used here to maintain a cached connection across hot reloads
//  * in development. This prevents connections growing exponentially
//  * during API Route usage.
//  */
// console.log("hi")
// let cached = cache.get('couchbase')

// if (!cached) {
//   cache.set('couchbase',  { conn: null })
//   cached =cache.get('couchbase')
// }
// console.log("before createCouchbaseCluster")
// console.log(IS_CAPELLA)
// async function createCouchbaseCluster() {
//   console.log("createCouchbaseCluster")
//   if (cached.conn) {
//     return cached.conn
//   }
//   console.log(IS_CAPELLA)
//   if (IS_CAPELLA === 'true') {
//     // Capella requires TLS connection string but we'll skip certificate verification with `tls_verify=none`

//     try {
//       // cached.conn = await couchbase.connect('couchbases://' + CB_URL + '?tls_verify=none', {
//       console.log("tried first try for creating cluster")
//       cached.conn = await couchbase.connect("couchbases://cb.kduxtf3jgtvundi.cloud.couchbase.com?tls_verify=none",{
//       username: CB_USER,
//       password: CB_PASS,
//     })
//     } catch (error) {
//       console.log("ERROR HOE", error)
//     }
//   } else {
//     // no TLS needed, use traditional connection string
//     // cached.conn = await couchbase.connect('couchbase://' + CB_URL, {
//       console.log("in else block for creating cluster")
//       cached.conn = await couchbase.connect('couchbases://cb.kduxtf3jgtvundi.cloud.couchbase.com', {
//       username: CB_USER,
//       password: CB_PASS,
//     })
//   }

//   return cached.conn
// }

console.log("running main function")
const clusterConnStr = 'couchbases://cb.kduxtf3jgtvundi.cloud.couchbase.com'
const username = 'Admin1'
const password = 'Password1!'
const bucketName = 'Conduit1'
export const main = async () => {
// async function main() {
    // console.log("running main function")
    // const clusterConnStr = 'couchbases://cb.kduxtf3jgtvundi.cloud.couchbase.com'
    // const username = 'Admin1'
    // const password = 'Password1!'
    // const bucketName = 'Conduit1'
  
    const cluster = await couchbase.connect(clusterConnStr, {
      username: username,
      password: password,
      // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
      // when accessing Capella from a different Wide Area Network
      // or Availability Zone (e.g. your laptop).
      configProfile: 'wanDevelopment',
    })
  
    
    const bucket = cluster.bucket(bucketName)
   
    // Get a reference to the default collection, required only for older Couchbase server versions
    // const defaultCollection = bucket.defaultCollection()
  
    // const usersCollection = bucket.scope('_default').collection('users')
  
    // const user = {
    //   type: 'user',
    //   name: 'Michael',
    //   email: 'michael123@test.com',
    //   interests: ['Swimming', 'Rowing'],
    // }
  
    
    // // Create and store a document
    // await collection.upsert('michael123', user)
  
    // // Load the Document and print it
    // // Prints Content and Metadata of the stored Document
    // let getResult = await collection.get('michael123')
    // console.log('Get Result: ', getResult)
        
            // // Perform a SQL++ (N1QL) Query
            // const queryResult = await bucket
            //   .scope('_default')
            //   .query('SELECT name FROM `airline` WHERE country=$1 LIMIT 10', {
            //     parameters: ['United States'],
            //   })
            // console.log('Query Results:')
            // queryResult.rows.forEach((row) => {
            //   console.log(row)
            // })
}

// Run the main function
main()
  .catch((err) => {
    console.log('ERR:', err)
    process.exit(1)
  })
//   .then(() => process.exit(0))
//   /******************************************** ENDPOINT HIT */
// const router = express.Router();
// app.post("/users", async (req: Request, res: Response) => {
// // router.route("/users").post(async (req: Request, res: Response) => {
// // router.route("").post(async (req: Request, res: Response) => {
//     // /users route 
//     console.log("Hitting users endpoint")
//     //   const {usersCollection} = await connectToDatabase();
//     //   console.log(usersCollection, "USERS COLLECTION")
  
    
//     //   const username = req.body.username;
//     //   const email =req.body.email
//     //   const password =req.body.pass
//     // const user = {name : username}
//     // already defined below - delete ^
  
//     const cluster = await couchbase.connect(clusterConnStr, {
//       username: username,
//       password: password,
//       // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
//       // when accessing Capella from a different Wide Area Network
//       // or Availability Zone (e.g. your laptop).
//       configProfile: 'wanDevelopment',
//     })
  
//     console.log("Here is the Cluster: ", cluster)
//     const bucket = cluster.bucket(bucketName)
//     console.log("Here is the Bucket: ", bucket)
//     // Get a reference to the default collection, required only for older Couchbase server versions
//     // const defaultCollection = bucket.defaultCollection()
  
//     const usersCollection = bucket.scope('_default').collection('users')
  
//     const users : Users = {
//         username : req.body.username,
//     email :req.body.email,
//     password : bcrypt.hashSync(req.body.pass, 10)
//         }
//         console.log(users, "USERS")
//         const requiredParams = [users.username, users.email, users.password]
  
//         for (let param of requiredParams){
//         if (!req.body[param]){
//             return res.status(400).send({
//             message: `${param} is required`
//             })
//         }
//         }
  
//         // Generate a unique id for the user and save to a variable
//         const id: string = v4()
//         // Create and store a document
//         await usersCollection
//         .upsert(id, users)
//         .then((result: any) => {
//             return res.send({...users, ...result});
//         })
//         .catch((e: {message: any}) => {
//             return res.status(500).send({
//             message: `User Insert Failed: ${e.message}`,
//             });
//         });
//         // Load the Document and print it
//         // Prints Content and Metadata of the stored Document
//         let getResult = await usersCollection.get(id)
//         console.log('Get Result: ', getResult)
//         res.send("hi /users")
//         return res.send()

  
//                 //   const accessToken = jwt.sign(user, SECRET)
//                 //   res.json({accessToken: accessToken})
  
//                 //  // Load the Document and print it
//                 //     // Prints Content and Metadata of the stored Document
//                 //     let getResult = await usersCollection.get(id)
//                 //     console.log('Get Result: ', getResult)
  
//                 // //   const id = v4();
//                 //   const users = {
//                 //     pid: id,
//                 //     ...req.body,
//                 //     pass: bcrypt.hashSync(password, 10),
//                 //   };
//                 //   console.log(users, "USERS")
  
//                 //   await usersCollection
//                 //     .insert(id, users)
//                 //     .then((result: any) => {
//                 //       return res.send({...users, ...result});
//                 //     })
//                 //     .catch((e: {message: any}) => {
//                 //       return res.status(500).send({
//                 //         message: `User Insert Failed: ${e.message}`,
//                 //       });
//                 //     });
  
//                 //     return res.send()
//                     // // return res.status(500)
//                     // return res.status(500).send({
//                     //   message: `Something went wrong}`,
//                     // });
//     });
//       /********************** ENDPOINT HIT FINISHED */
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
