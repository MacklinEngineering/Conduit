import express, {Request, Response} from 'express';
import * as couchbase from 'couchbase';
import bcrypt from 'bcryptjs';
import {v4} from 'uuid';
// import {connectCapella} from "../db/connect_to_capella"
import {main} from "../app";
import bodyParser from 'body-parser';
import verifyJWT from "../verifyJWT"
import jwt from 'jsonwebtoken';
// import {clusterConnStr, username, password, bucketName} from "../db/connect_to_capella"
​
const SECRET = process.env.SECRET || "Mys3cr3tk3y"
​
// main()
console.log("in users")
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
// import * as couchbase from 'couchbase';
export const clusterConnStr = 'couchbases://cb.yfxtafw9ud1ccllx.cloud.couchbase.com'
export const capellaUsername = 'Admin1'
export const capellaPassword = 'Password1!'
export const bucketName = 'ConduitDemo'



// export const connectCapella = async () => {
//      const cluster = await couchbase.connect(clusterConnStr, {
//         username: username,
//         password: password,
//         // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
//         // when accessing Capella from a different Wide Area Network
//         // or Availability Zone (e.g. your laptop).
//         configProfile: 'wanDevelopment',
//       })
    
//       // console.log("Here is the Cluster: ", cluster)
//       const bucket = cluster.bucket(bucketName)
//       // console.log("Here is the Bucket: ", bucket)
//       // Get a reference to the default collection, required only for older Couchbase server versions
//       // const defaultCollection = bucket.defaultCollection()
    
//       const usersCollection = bucket.scope('_default').collection('users')
//       const profilesCollection = bucket.scope('_default').collection('profiles')
//       const articlesCollection = bucket.scope('_default').collection('articles')
//       const commentsCollection = bucket.scope('_default').collection('comments')
//       const favoritesCollection = bucket.scope('_default').collection('favorites')
//       const tagsCollection = bucket.scope('_default').collection('tags')

//       let couchbaseConnection = {
//         cluster,
//         bucket,
//         // collection,
//         usersCollection,
//         profilesCollection,
//         articlesCollection,
//         commentsCollection,
//         favoritesCollection,
//         tagsCollection
//       }

//     //   let userEmail = await usersCollection.get(email)
//     //   let user = await usersCollection.

//       return couchbaseConnection;
// }

// connectCapella()
​
​
            // username: this.username,
            // email: this.email,
            // bio: this.bio,
            // image: this.image,
            // token: this.generateAccessToken()
        
​
router
    .route("") // /users
    .post(bodyParser.json(), async (req: Request, res: Response) => {
        const {user} = req.body
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
  
    // console.log("here is the request body: ", req.body)
    // const newpass= "heyboo"
    // const userPassword = bcrypt.hashSync( newpass, 10)
    const userPassword = bcrypt.hashSync( user.password, 10)
    const userId: string = v4()
    // console.log("here is the hashed password, ", userPassword)
    const users : Users = {
        username : user.username,
        email : user.email,
        password : userPassword,
        bio: "",
        image: "",
        token: "",
        id: userId
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
    
        //   let userEmail = await usersCollection.get(email)
        //   let user = await usersCollection.
        
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

        await usersCollection
        .upsert(userId, users)
        .then((result: any) => {
            console.log("The Upsert Works")
            // return res.send({...users, ...result});
        })
        .catch((e: {message: any}) => {
            return res.status(500).send({
            message: `User Insert Failed: ${e.message}`,
            });
        });

        // Load the Document and print it
        // Prints Content and Metadata of the stored Document


        //TODO: Requires refactor to programmatically add to user nested object 

        let getResult = {"user" : await usersCollection.get(userId)}
    
        console.log('Get Result: ', getResult )

        const myUserObject = getResult.user.content
        console.log(myUserObject, "MY USER OBJECT")


        // GetResult {
        //     content: {
        //       username: 'celeb_u1692368603',
        //       email: 'celeb_u1692368603@mail.com',
        //       password: '$2a$10$URVT2ybrGldYDxXqo9rkEeBuD9p2gubgkZXoYjtJT0167r6Pmady2'
        //     },
          
        
        // res.send("hi /users")
        return res.status(201).json({"user" : myUserObject})
});
        
        
        // await connectCapella()
        // .then((async () => {
        //     await usersCollection
        // }))

        // const userCollectionResult = 
        // Create and store a document
        // await usersCollection
        // .upsert(id, users)
        // .then((result: any) => {
        //     console.log("The Upsert Works")
        //     // return res.send({...users, ...result});
        // })
        // .catch((e: {message: any}) => {
        //     return res.status(500).send({
        //     message: `User Insert Failed: ${e.message}`,
        //     });
        // });

        // // Load the Document and print it
        // // Prints Content and Metadata of the stored Document


        // //TODO: Requires refactor to programmatically add to user nested object 

        // let getResult = {"user" : await usersCollection.get(id)}
    
        // console.log('Get Result: ', getResult )

        // const myUserObject = getResult.user.content
        // console.log(myUserObject, "MY USER OBJECT")


        // // GetResult {
        // //     content: {
        // //       username: 'celeb_u1692368603',
        // //       email: 'celeb_u1692368603@mail.com',
        // //       password: '$2a$10$URVT2ybrGldYDxXqo9rkEeBuD9p2gubgkZXoYjtJT0167r6Pmady2'
        // //     },
          
        
        // // res.send("hi /users")
        // return res.status(201).json({user : myUserObject})

        // Turn GetResultInto
        // username : string ;
        // email : string;
        // password :string
        // bio: string
        // image: string
        // token: string


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
    // });
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
    console.log("RESUEST, ", req.body) //only has email and password inside 
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
    // getResult.content
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
    // const travelbucket = cluster.bucket("travel-sample")
    // console.log("Here is the Bucket: ", bucket)
    // Get a reference to the default collection, required only for older Couchbase server versions
    // const defaultCollection = bucket.defaultCollection()
  
    const usersCollection = bucket.scope('blog').collection('users')
  
    // console.log("here is the request body for POST /users/login: ", req.body)
    // const newpass= "heyboo"
​
    //TODO dont want another hash, want old hash from response -- await?
    // const userPassword = bcrypt.hashSync( req.body.user.password, 10)
    // const userPassword = getResult.content.email
    // interface Users {
    //    email : string;
    //    password : string ;
    // }
    
//    const generateAccessToken(){
        const accessToken = jwt.sign({
                "user": {
                    // "id": this.id,
                    "email": req.body.user.email, //this.email,
                    "password": req.body.user.password,//this.password
                }
            },
            SECRET,
            { expiresIn: "1d"}
        );

        //Grab the user from the database
        const idResult = await bucket
            .scope('blog')
            .query(`SELECT * FROM \`users\` WHERE email='${req.body.user.email}';`, {
            })
          let idResult2 =  idResult.rows[0].users.id
            //Grab the id from the user object
            // ID ROWS {
            //     users: {
            //       bio: '',
            //       email: 'JESUSLAWDY',
            //       id: 'ea11a9a1-a8fd-43e9-8ce5-91fd1884fcbe',
            //       image: '',
            //       password: '$2a$10$QvcO5SoihCksUQQwaMA9Xuyq.u7hpTde6oqanPPvOjBru0dzONGmO',
            //       token: '',
            //       username: 'JESUSLAWDY'
            //     }
            //   }
            console.log("ID RESULT2", idResult2)

            // GEt the password from the database and input into the new document 

            
          let passwordResult =  idResult.rows[0].users.password
            //place ID in new user object
           
        const users : Users = {
            // username : username,
            username: '', //GRAB THE USERNAME FROM CB OR OLD RESPONSE
            email: req.body.user.email,
            password: passwordResult,
            bio: "",
            image: "",
            token: accessToken,
            id: idResult2 //why did I re-add? What did I need this for? 
                            //Maybe to use to replace the user object with th enew one with a token 
        }
        console.log("USERS in login", users)
    
        await usersCollection
            .replace(users.id, users)  //rewrites the entire document, have to learn how "mutateIn" method works for optimization
            // .upsert(users.id, users )
            .then((result: any) => {
                console.log("The Replace Works")
                // return res.send({...users, ...result});
            })
            .catch((e: {message: any}) => {
                return res.status(500).send({
                message: `User Insert Failed: ${e.message}`,
                });
            });
    
            // Load the Document and print it
            // Prints Content and Metadata of the stored Document
    
    
            //TODO: Requires refactor to programmatically add to user nested object 
    
            let loggedInUserResult = {"user" : await usersCollection.get(users.id)}
        
            console.log('Get Result: ', loggedInUserResult )
    
            const myUserObject = loggedInUserResult.user.content
            console.log(myUserObject, "MY USER OBJECT AFTER REPLACE METHOD WITH TOKEN AND ID")
        // return accessToken;
    // }
    // let getResult = await collection.get('michael123')
    //  const username = await usersCollection.get()
    
        
       
    // const users : Users = {
    //     // username : req.body.user.username,
    //     email :req.body.user.email,
    //     password : userPassword
    //     }

        console.log(users, "USERS")
        const {user} = req.body
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
const bucketIndex = ​`CREATE PRIMARY INDEX ON default:ConduitDemo.blog.users`   
try{
    await cluster.query(bucketIndex)
   console.log("BUCKET INDEX CREATION SUCCESS")
}
catch (err){
    if (err instanceof couchbase.IndexExistsError) {
        console.info('Bucket Index Creation: Index Already Exists')
      } else {
        console.error(err)
      }
}
​
        //TODO
    //     const match = await bcrypt.compare(user.password, loginUser.password);
    // if (!match) {return res.status(401).json({errors: { message: 'Unauthorized: Wrong password' }})}
        // console.log(req.body, "body hoe")
        // console.log(req.body.user.email, "what is this")
        //how do we grab an id from the database
        // const id = "123"
        // var result = await usersCollection.lookupIn('users', [
        //     couchbase.LookupInSpec.get('email'),
        //   ])
        //  console.log(result, "HARD WORK")
​       let loginUser = async function queryNamed() {
            console.log("OH EHY BABY")
    // Perform a SQL++ (N1QL) Query
    // const queryResult = await travelbucket
            const queryResult = await bucket
            .scope('blog')
            .query(`SELECT * FROM \`users\` WHERE email='${req.body.user.email}';`, {
            })
            //TESTING WITH TRAVEL SAMPLE
            // .scope('inventory')
            // .query('SELECT name FROM `airline` WHERE country=$1 LIMIT 10', {
            // parameters: ['United States'],
            // })
    
            queryResult.rows.forEach((row) => {
            console.log("ROWS IN THE WORKING QUERY", row)
            })
            return queryResult
            }
            
    
          //Frontend would store the value somewhere, and add the token to the header. 

          //Best way to see - postman collection . 
          //Now login
          loginUser()
          .then(res2 => { 
            //TODO: Refactor and use a switch case that checks the response values and sends the correspnding status code and message
            // let response
                 //TODO: If there isn't anything in rows, send a 404 error
                 // SOOOO lololol, this is to check if the rows length is falsy. Hacky, and needs to be refactored. 
                 console.log("RES2", res2)
                if (res2["rows"].length===0) {
                    // response = "User Not Found"
                    return res.status(404).json({errors: { message: 'User Not Found' }});
                }
                console.log("ROWS", res2["rows"]) //Gives UserPassword in Rows object
                // let loggedInEmail = res2["rows"][0].users.email
                let loggedInUserPassword = res2["rows"][0].users.password
                console.log(loggedInUserPassword)

                res2["rows"]
                .forEach(async (row: { loggedInUserPassword: string; }) => {
                    console.log("I'm about to Try Catch")
                                // console.log(req.body,user.password)
                                console.log("PASSWORD",req.body.user.password, loggedInUserPassword)
                                const match = await bcrypt.compare(req.body.user.password, loggedInUserPassword);
                                console.log(match)
                                if (!match) {
                                    console.log("NO match, ", match) //showing NO MATCH when passwords are the same?

                                // response = "Wrong password"
                                    return res.status(401).json({errors: { message: 'Unauthorized: Wrong password' }})
                                }else {
                                    console.log("ITS A MATCH")
                                   
                                    const headers = { headers: { 'Authorization': 'Token ' + users.token } };
                                    // const headers = res.setHeader(`headers`, `{ 'Authorization': 'Token ' + users.token }`)
                                    console.log("HEADERS: ", headers)
                                    //  console.log(res)
                                    return res.status(200).json({
                                        headers: headers,
                                        user: users
                                    });
                                    
                                }
            ​
                           
                        }) 
            return
             
​
        })
​
});
​
​
​
​
​
 /**** 
//  Description: Updates a single current user 
//  Route: /api/user
//  Auth: YES
//  Required fields: none
//  Response: returns the current user
// ****/    
​
//  router
//      .route("")
//      //call for the token, then use the token for every call
//      .get(verifyJWT, bodyParser.json(), async (req: Request, res: Response) => {


//      })
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














