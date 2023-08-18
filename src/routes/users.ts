import express, {Request, Response} from 'express';
import * as couchbase from 'couchbase';
import bcrypt from 'bcryptjs';
import {v4} from 'uuid';
import verifyJWT from '../verifyJWT';
import bodyParser from 'body-parser';

console.log("in users")
const router = express.Router();

interface Users {
    username : string ;
   email : string;
   password :string
}
const clusterConnStr = 'couchbases://cb.kduxtf3jgtvundi.cloud.couchbase.com'
const username = 'Admin1'
const password = 'Password1!'
const bucketName = 'Conduit1'

/**** 
 Description: Registers a user 
 Route: /api/users
 Auth: NONE
 Required fields: email, username, password
 Response: returns a User
****/

router
    .route("")
    .post(bodyParser.json(), async (req: Request, res: Response) => {
    // /users route 
    // res.send("HOLY SHIT SNACKS")
    // ^^ Endpoint actually works HOMYGAWD 

    //   const {usersCollection} = await connectToDatabase();
    //   console.log(usersCollection, "USERS COLLECTION")
  
    
    //   const username = req.body.username;
    //   const email = req.body.email
    //   const password =req.body.pass
    // const user = {name : username}
   // already defined below - delete ^
  
    const cluster = await couchbase.connect(clusterConnStr, {
      username: username,
      password: password,
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
  
    const usersCollection = bucket.scope('_default').collection('users')
  
    console.log("here is the request body: ", req.body)
    const userPassword = bcrypt.hashSync( req.body.user.password, 10)
    console.log("here is the hashed password, ", userPassword)
    const users : Users = {
        username : req.body.user.username,
        email :req.body.user.email,
        password : userPassword
        }

        console.log(users, "USERS")
        //TODO handle required params vs NOT

        // const requiredParams = [req.body.user.username, req.body.user.email, req.body.user.password]
  
        // for (let param of requiredParams){
        // if (!req.body[param]){
        //     return res.status(400).send({
        //     message: `${param} is required`
        //     })
        // }
        //}
  
        // Generate a unique id for the user and save to a variable
        const id: string = v4()
        //TODO: Check if the email is already in use
        //Then, fail this and notify the user
        // Create and store a document
        await usersCollection
        .upsert(id, users)
        .then((result: any) => {
            return res.send({...users, ...result});
        })
        .catch((e: {message: any}) => {
            return res.status(500).send({
            message: `User Insert Failed: ${e.message}`,
            });
        });
        // Load the Document and print it
        // Prints Content and Metadata of the stored Document
        let getResult = await usersCollection.get(id)
        console.log('Get Result: ', getResult)
        // res.send("hi /users")
        return res.send()

  
                //   const accessToken = jwt.sign(user, SECRET)
                //   res.json({accessToken: accessToken})
  
                //  // Load the Document and print it
                //     // Prints Content and Metadata of the stored Document
                //     let getResult = await usersCollection.get(id)
                //     console.log('Get Result: ', getResult)
  
                // //   const id = v4();
                //   const users = {
                //     pid: id,
                //     ...req.body,
                //     pass: bcrypt.hashSync(password, 10),
                //   };
                //   console.log(users, "USERS")
  
                //   await usersCollection
                //     .insert(id, users)
                //     .then((result: any) => {
                //       return res.send({...users, ...result});
                //     })
                //     .catch((e: {message: any}) => {
                //       return res.status(500).send({
                //         message: `User Insert Failed: ${e.message}`,
                //       });
                //     });
  
                //     return res.send()
                    // // return res.status(500)
                    // return res.status(500).send({
                    //   message: `Something went wrong}`,
                    // });
    });

/**** 
 Description: Get's a single current user 
 Route: /api/user
 Auth: YES
 Required fields: none
 Response: returns the current user
****/    

router
    .route("")
    .get(verifyJWT, bodyParser.json(), async (req: Request, res: Response) => {
  
    const cluster = await couchbase.connect(clusterConnStr, {
      username: username,
      password: password,
      // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
      // when accessing Capella from a different Wide Area Network
      // or Availability Zone (e.g. your laptop).
      configProfile: 'wanDevelopment',
    })
  
    // console.log("Here is the Cluster: ", cluster)
    const bucket = cluster.bucket(bucketName)
    // console.log("Here is the Bucket: ", bucket)
  
    const usersCollection = bucket.scope('_default').collection('users')
  
    console.log("here is the request body: ", req.body)
    // const userPassword = bcrypt.hashSync( req.body.user.password, 10)
    // console.log("here is the hashed password, ", userPassword)


    // const users : Users = {
    //     username : req.body.user.username,
    //     email :req.body.user.email,
    //     password : userPassword
    //     }
        const email = req.body.user.email

        console.log(email, "User email")

        // const user = await usersCollection.find()
        // Load the Document and print it
        // Prints Content and Metadata of the stored Document
        let user = await usersCollection.get(email)
        console.log('Get User: ', user)
        return res.send()
        // res.send("hi /users")
        //TODO: Handle required params vs NOT

        // const requiredParams = [req.body.user.username, req.body.user.email, req.body.user.password]
  
        // for (let param of requiredParams){
        // if (!req.body[param]){
        //     return res.status(400).send({
        //     message: `${param} is required`
        //     })
        // }
        //}
  
        // // Generate a unique id for the user and save to a variable
        // const id: string = v4()
        // //TODO: Check if the email is already in use
        // //Then, fail this and notify the user
        // // Create and store a document
        // await usersCollection
        // .upsert(id, users)
        // .then((result: any) => {
        //     return res.send({...users, ...result});
        // })
        // .catch((e: {message: any}) => {
        //     return res.status(500).send({
        //     message: `Get User Failed: ${e.message}`,
        //     });
        // });
        // // Load the Document and print it
        // // Prints Content and Metadata of the stored Document
        // let getResult = await usersCollection.get(id)
        // console.log('Get Result: ', getResult)
        // res.send("hi /users")
        // return res.send()

  
                //   const accessToken = jwt.sign(user, SECRET)
                //   res.json({accessToken: accessToken})
  
                    // // return res.status(500)
                    // return res.status(500).send({
                    //   message: `Something went wrong}`,
                    // });
    });
  

export default router

//  /******************************************** ENDPOINT HIT */
//  const router = express.Router();
//  app.post("/users", async (req: Request, res: Response) => {
//  // router.route("/users").post(async (req: Request, res: Response) => {
//  // router.route("").post(async (req: Request, res: Response) => {
//      // /users route 
//      console.log("Hitting users endpoint")
//      //   const {usersCollection} = await connectToDatabase();
//      //   console.log(usersCollection, "USERS COLLECTION")
   
     
//      //   const username = req.body.username;
//      //   const email =req.body.email
//      //   const password =req.body.pass
//      // const user = {name : username}
//      // already defined below - delete ^
   
//      const cluster = await couchbase.connect(clusterConnStr, {
//        username: username,
//        password: password,
//        // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
//        // when accessing Capella from a different Wide Area Network
//        // or Availability Zone (e.g. your laptop).
//        configProfile: 'wanDevelopment',
//      })
   
//      console.log("Here is the Cluster: ", cluster)
//      const bucket = cluster.bucket(bucketName)
//      console.log("Here is the Bucket: ", bucket)
//      // Get a reference to the default collection, required only for older Couchbase server versions
//      // const defaultCollection = bucket.defaultCollection()
   
//      const usersCollection = bucket.scope('_default').collection('users')
   
//      const users : Users = {
//          username : req.body.username,
//      email :req.body.email,
//      password : bcrypt.hashSync(req.body.pass, 10)
//          }
//          console.log(users, "USERS")
//          const requiredParams = [users.username, users.email, users.password]
   
//          for (let param of requiredParams){
//          if (!req.body[param]){
//              return res.status(400).send({
//              message: `${param} is required`
//              })
//          }
//          }
   
//          // Generate a unique id for the user and save to a variable
//          const id: string = v4()
//          // Create and store a document
//          await usersCollection
//          .upsert(id, users)
//          .then((result: any) => {
//              return res.send({...users, ...result});
//          })
//          .catch((e: {message: any}) => {
//              return res.status(500).send({
//              message: `User Insert Failed: ${e.message}`,
//              });
//          });
//          // Load the Document and print it
//          // Prints Content and Metadata of the stored Document
//          let getResult = await usersCollection.get(id)
//          console.log('Get Result: ', getResult)
//          res.send("hi /users")
//          return res.send()
 
   
//                  //   const accessToken = jwt.sign(user, SECRET)
//                  //   res.json({accessToken: accessToken})
   
//                  //  // Load the Document and print it
//                  //     // Prints Content and Metadata of the stored Document
//                  //     let getResult = await usersCollection.get(id)
//                  //     console.log('Get Result: ', getResult)
   
//                  // //   const id = v4();
//                  //   const users = {
//                  //     pid: id,
//                  //     ...req.body,
//                  //     pass: bcrypt.hashSync(password, 10),
//                  //   };
//                  //   console.log(users, "USERS")
   
//                  //   await usersCollection
//                  //     .insert(id, users)
//                  //     .then((result: any) => {
//                  //       return res.send({...users, ...result});
//                  //     })
//                  //     .catch((e: {message: any}) => {
//                  //       return res.status(500).send({
//                  //         message: `User Insert Failed: ${e.message}`,
//                  //       });
//                  //     });
   
//                  //     return res.send()
//                      // // return res.status(500)
//                      // return res.status(500).send({
//                      //   message: `Something went wrong}`,
//                      // });
//      });
//        /********************** ENDPOINT HIT FINISHED */