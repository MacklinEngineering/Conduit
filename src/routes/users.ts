import express, {Request, Response} from 'express';
import * as couchbase from 'couchbase';
import bcrypt from 'bcryptjs';
import {v4} from 'uuid';
import {main} from "../app";
import bodyParser from 'body-parser';
import verifyJWT from "../verifyJWT"
import jwt from 'jsonwebtoken';
​
const SECRET = process.env.SECRET || "Mys3cr3tk3y"
​
// main()
console.log("in users")
const router = express.Router();
interface Users {
    username : string ;
   email : string;
   password :string
   bio?: string
   image?: string
   token?: string
}
​
const clusterConnStr = 'couchbases://cb.kduxtf3jgtvundi.cloud.couchbase.com'
const username = 'Admin1'
const password = 'Password1!'
const bucketName = 'Conduit1'
​
​
            // username: this.username,
            // email: this.email,
            // bio: this.bio,
            // image: this.image,
            // token: this.generateAccessToken()
        
​
router
    .route("")
    .post(bodyParser.json(), async (req: Request, res: Response) => {
    // /users route 
    // res.send("HOLY SHIT SNACKS")
    // ^^ Endpoint actually works HOMYGAWD 
​
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
    const newpass= "heyboo"
    // const userPassword = bcrypt.hashSync( newpass, 10)
    const userPassword = bcrypt.hashSync( req.body.user.password, 10)
    console.log("here is the hashed password, ", userPassword)
    const users : Users = {
        username : req.body.user.username,
        email :req.body.user.email,
        password : userPassword
        }
​
        console.log(users, "USERS")
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
        // res.append(id)
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
​
  
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
​
/**** 
 Description: Login a registered user 
 Route: /api/users/login
 Auth: NO
 Required fields: Email, password
 Response: returns a user
****/  
​
router
    .route("/login") //QUESTION: where is the actual parameter that says you are logged in. Is it the passing of thr JWT token from route to route?
    .post(bodyParser.json(), async (req: Request, res: Response, getResult) => {
    // /users route 
    // res.send("HOLY SHIT SNACKS")
    // ^^ Endpoint actually works HOMYGAWD 
​
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
  
    console.log("here is the request body for POST /users/login: ", req.body)
    // const newpass= "heyboo"
​
    //TODO dont want another hash, want old hash from response -- await?
    const userPassword = bcrypt.hashSync( req.body.user.password, 10)
    // const userPassword = getResult.content.email
    interface Users {
       email : string;
       password : string ;
    }
    const users : Users = {
        // username : req.body.user.username,
        email :req.body.user.email,
        password : userPassword
        }

        console.log(users, "USERS")
        // const requiredParams = [req.body.user.username, req.body.user.email, req.body.user.password]
  
        // for (let param of requiredParams){
        // if (!req.body[param]){
        //     return res.status(400).send({
        //     message: `${param} is required`
        //     })
        // }
        //}
  
        // Generate a unique id for the user and save to a variable
        // const id: string = v4()
        //TODO: Check if the email is already in use
        //Then, fail this and notify the user
        // Create and store a document
        // await usersCollection
        // .upsert(id, users)
        // .then((result: any) => {
        //     return res.send({...users, ...result});
        // })
        // .catch((e: {message: any}) => {
        //     return res.status(500).send({
        //     message: `User Insert Failed: ${e.message}`,
        //     });
        // });
        // Load the Document and print it
        // Prints Content and Metadata of the stored Document
​
​
        //TODO
    //     const match = await bcrypt.compare(user.password, loginUser.password);
    // if (!match) {return res.status(401).json({errors: { message: 'Unauthorized: Wrong password' }})}
        console.log(req.body, "body hoe")
        console.log(req.body.user.email, "what is this")
        //how do we grab an id from the database
        // const id = "123"
        // var result = await usersCollection.lookupIn('users', [
        //     couchbase.LookupInSpec.get('email'),
        //   ])
        //  console.log(result, "HARD WORK")
​
        var loginUser =  async function queryNamed() {
            //Define query
            const query = `
              SELECT *
              FROM \`Conduit1\`._default.users
              WHERE email='${req.body.user.email}';`
                //Send the query
                let result = await cluster.query(query, { adhoc: false }).catch(error => console.error('Query failed: ', error))
                console.log(result, "REZZY")
           
            //   return Promise.resolve()
            
            //Return result so it ends up in loginUser variable
            return result
            //   return result.resolve().catch(error => console.error('Query failed: ', error))
              //  try {
            //   let result = await cluster.query(query, { adhoc: false })
        
            //   result.rows.forEach((row) => {
            //     console.log('Query row: ', row)
            //   return result})
            // } catch (error) {
            //   console.error('Query failed: ', error)
            // }
          }
​
        const generateAccessToken = function() {
            const accessToken = jwt.sign({
                    "user": {
                        // "id": usersCollection.get(id), //this.id,
                        "email": users.email,//this.email,
                        "password": users.password//this.password
                    }
                },
                SECRET,
                { expiresIn: "1d"}
            );
            return accessToken;
        }
        
        const token = generateAccessToken()
          console.log("ACCESS TOKEN: ", token)
          res.append(token)
          console.log(res)
          //Now login
          loginUser().then(res2 => { 
                 //TODO: If there isn't anything in rows, send a 404 error
                 // SOOOO lololol, this is to check if the rows length is falsy. Hacky, and needs to be refactored. 
                 if (res2["rows"].length===0) {
                    return res.status(404).json({errors: { message: 'User Not Found' }});
                }
                res2["rows"].forEach(async (row: { password: string; }) => {
                    
                //TODO: If we do find something in rows, find password in there, do the match with both passwords and do same magic as Laurent
                 try
                {
                    console.log("PASSWORD MATCH",users.password, row.password)
                    const match = await bcrypt.compare(users.password, row.password);
                    if (!match) {return res.status(401).json({errors: { message: 'Unauthorized: Wrong password' }})}
​
                } catch(error){
                        console.error()
                }
                return res.send()
                // console.log('Query row: ', row)
                // console.log(res2, "RES2")
            }) 
            return 
​
        })
​
        //   const match = await bcrypt.compare(users.password, loginUser.users.password);
        //   if (!match) {return res.status(401).json({errors: { message: 'Unauthorized: Wrong password' }})}
        //   res.status(200).json({
        //       user: loginUser.toUserResponse()
        //   });
        
        // result().then(res2 => {
            //     console.log(res2, "RES2")
        // })        
​
// let getResult = await usersCollection.get(id)
// console.log('Get Result: ', getResult)
// res.send("hi /users")
return res.send()
​

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
​
​
​
​
​
// /**** 
//  Description: Get's a single current user 
//  Route: /api/user
//  Auth: YES
//  Required fields: none
//  Response: returns the current user
// ****/    
​
// router
//     .route("")
//     //call for the token, then use the token for every call
//     .get(verifyJWT, bodyParser.json(), async (req: Request, res: Response) => {
//         console.log("YOO INSIDE GET")
//         //    const accessToken = jwt.sign(user, SECRET)
//         //     res.json({accessToken: accessToken})

//     const cluster = await couchbase.connect(clusterConnStr, {
//       username: username,
//       password: password,
//       // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
//       // when accessing Capella from a different Wide Area Network
//       // or Availability Zone (e.g. your laptop).
//       configProfile: 'wanDevelopment',
//     })

//     // console.log("Here is the Cluster: ", cluster)
//     const bucket = cluster.bucket(bucketName)
//     // console.log("Here is the Bucket: ", bucket)

//     const usersCollection = bucket.scope('_default').collection('users')

//     console.log("here is the request body: ", req.body)
//     // const userPassword = bcrypt.hashSync( req.body.user.password, 10)
//     // console.log("here is the hashed password, ", userPassword)
​
​
//     // const users : Users = {
//     //     username : req.body.user.username,
//     //     email :req.body.user.email,
//     //     password : userPassword
//     //     }
//         const email = req.body.user.email
​
//         console.log(email, "User email")
​
//         // const user = await usersCollection.find()
//         // Load the Document and print it
//         // Prints Content and Metadata of the stored Document
//         let user = await usersCollection.get(email)
//         console.log('Get User: ', user)
//         return res.send()
//         // res.send("hi /users")
//         //TODO: Handle required params vs NOT
​
//         // const requiredParams = [req.body.user.username, req.body.user.email, req.body.user.password]

//         // for (let param of requiredParams){
//         // if (!req.body[param]){
//         //     return res.status(400).send({
//         //     message: `${param} is required`
//         //     })
//         // }
//         //}

//         // // Generate a unique id for the user and save to a variable
//         // const id: string = v4()
//         // //TODO: Check if the email is already in use
//         // //Then, fail this and notify the user
//         // // Create and store a document
//         // await usersCollection
//         // .upsert(id, users)
//         // .then((result: any) => {
//         //     return res.send({...users, ...result});
//         // })
//         // .catch((e: {message: any}) => {
//         //     return res.status(500).send({
//         //     message: `Get User Failed: ${e.message}`,
//         //     });
//         // });
//         // // Load the Document and print it
//         // // Prints Content and Metadata of the stored Document
//         // let getResult = await usersCollection.get(id)
//         // console.log('Get Result: ', getResult)
//         // res.send("hi /users")
//         // return res.send()
​

//                 //   const accessToken = jwt.sign(user, SECRET)
//                 //   res.json({accessToken: accessToken})

//                     // // return res.status(500)
//                     // return res.status(500).send({
//                     //   message: `Something went wrong}`,
//                     // });
//     });
​
// //  /******************************************** ENDPOINT HIT */
// //  const router = express.Router();
// //  app.post("/users", async (req: Request, res: Response) => {
// //  // router.route("/users").post(async (req: Request, res: Response) => {
// //  // router.route("").post(async (req: Request, res: Response) => {
// //      // /users route 
// //      console.log("Hitting users endpoint")
// //      //   const {usersCollection} = await connectToDatabase();
// //      //   console.log(usersCollection, "USERS COLLECTION")


// //      //   const username = req.body.username;
// //      //   const email =req.body.email
// //      //   const password =req.body.pass
// //      // const user = {name : username}
// //      // already defined below - delete ^

// //      const cluster = await couchbase.connect(clusterConnStr, {
// //        username: username,
// //        password: password,
// //        // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
// //        // when accessing Capella from a different Wide Area Network
// //        // or Availability Zone (e.g. your laptop).
// //        configProfile: 'wanDevelopment',
// //      })

// //      console.log("Here is the Cluster: ", cluster)
// //      const bucket = cluster.bucket(bucketName)
// //      console.log("Here is the Bucket: ", bucket)
// //      // Get a reference to the default collection, required only for older Couchbase server versions
// //      // const defaultCollection = bucket.defaultCollection()

// //      const usersCollection = bucket.scope('_default').collection('users')

// //      const users : Users = {
// //          username : req.body.username,
// //      email :req.body.email,
// //      password : bcrypt.hashSync(req.body.pass, 10)
// //          }
// //          console.log(users, "USERS")
// //          const requiredParams = [users.username, users.email, users.password]

// //          for (let param of requiredParams){
// //          if (!req.body[param]){
// //              return res.status(400).send({
// //              message: `${param} is required`
// //              })
// //          }
// //          }

// //          // Generate a unique id for the user and save to a variable
// //          const id: string = v4()
// //          // Create and store a document
// //          await usersCollection
// //          .upsert(id, users)
// //          .then((result: any) => {
// //              return res.send({...users, ...result});
// //          })
// //          .catch((e: {message: any}) => {
// //              return res.status(500).send({
// //              message: `User Insert Failed: ${e.message}`,
// //              });
// //          });
// //          // Load the Document and print it
// //          // Prints Content and Metadata of the stored Document
// //          let getResult = await usersCollection.get(id)
// //          console.log('Get Result: ', getResult)
// //          res.send("hi /users")
// //          return res.send()


// //                  //   const accessToken = jwt.sign(user, SECRET)
// //                  //   res.json({accessToken: accessToken})

// //                  //  // Load the Document and print it
// //                  //     // Prints Content and Metadata of the stored Document
// //                  //     let getResult = await usersCollection.get(id)
// //                  //     console.log('Get Result: ', getResult)

// //                  // //   const id = v4();
// //                  //   const users = {
// //                  //     pid: id,
// //                  //     ...req.body,
// //                  //     pass: bcrypt.hashSync(password, 10),
// //                  //   };
// //                  //   console.log(users, "USERS")

// //                  //   await usersCollection
// //                  //     .insert(id, users)
// //                  //     .then((result: any) => {
// //                  //       return res.send({...users, ...result});
// //                  //     })
// //                  //     .catch((e: {message: any}) => {
// //                  //       return res.status(500).send({
// //                  //         message: `User Insert Failed: ${e.message}`,
// //                  //       });
// //                  //     });

// //                  //     return res.send()
// //                      // // return res.status(500)
// //                      // return res.status(500).send({
// //                      //   message: `Something went wrong}`,
// //                      // });
// //      });
// //        /********************** ENDPOINT HIT FINISHED */
​
​
export default router














