// import express, {Request, Response} from 'express';
// import bcrypt from 'bcryptjs';
// import {v4} from 'uuid';
// import cors from 'cors';
// import swaggerUi from 'swagger-ui-express';
// import YAML from 'yamljs';
// import * as couchbase from 'couchbase';
// import jwt from 'jsonwebtoken';
// import {connectToDatabase} from './db/connection.js';
// import expressJwt from "express-jwt";
// import verifyJWT from './verifyJWT.js';
// import { userInfo } from 'os';

// const swaggerDocument = YAML.load('./swagger.yaml');
// const SECRET = process.env.SECRET || "Mys3cr3tk3y"

// export const app = express();
// console.log("app is HUR")
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({extended: true}));

// app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.get('/', (req: Request, res: Response) => {
//   res.send(
//     '<body onload="window.location = \'/swagger-ui/\'"><a href="/swagger-ui/">Click here to see the API</a>'
//   );
// });
// console.log("about to enter ensureIndexes")
// export const ensureIndexes = async () => {

// console.log("entered ensureIndexes")
//   const {cluster} = await connectToDatabase();

//   const bucketIndex = `CREATE PRIMARY INDEX ON ${process.env.CB_BUCKET}`;
//   const usersCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.users;`;
//   const profilesCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.profiles;`;
//   const articlesCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.articles;`;
//   const tagsCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.tags;`;

//   try {
//     await cluster.query(bucketIndex);
//     console.log('Bucket Index Creation: SUCCESS',bucketIndex );
//   } catch (err) {
//     if (err instanceof couchbase.IndexExistsError) { //this is custom to Buckets, make general for all 
//       console.info('Index Creation: Index Already Exists');
//     }
//     else {
//       console.error(err);
//     }
//   }
    
//     try {
//       await cluster.query(usersCollectionIndex);
//     console.log('Users Index Creation: SUCCESS');
//     } catch (err) {
//       if (err instanceof couchbase.IndexExistsError) { //this is custom to Buckets, make general for all 
//         console.info('Users Index Creation: Index Already Exists');
//       }
//       else {
//         console.error(err);
//       }
//     }

//     try {
//       await cluster.query(profilesCollectionIndex);
//       console.log('Profiles Index Creation: SUCCESS');
//     } catch (err) {
//       if (err instanceof couchbase.IndexExistsError) { //this is custom to Buckets, make general for all 
//         console.info('Profiles Index Creation: Index Already Exists');
//       }
//       else {
//         console.error(err);
//       }
//     }

//     try {
//       await cluster.query(articlesCollectionIndex);
//       console.log('Articles Index Creation: SUCCESS');
//     } catch (err) {
//       if (err instanceof couchbase.IndexExistsError) { //this is custom to Buckets, make general for all 
//         console.info('Articles Index Creation: Index Already Exists');
//       }
//       else {
//         console.error(err);
//       }
//     }

//     try {
//       await cluster.query(tagsCollectionIndex);
//       console.log('Tags Index Creation: SUCCESS');
//     } catch (err) {
//       if (err instanceof couchbase.IndexExistsError) { //this is custom to Buckets, make general for all 
//         console.info('Tags Index Creation: Index Already Exists');
//       }
//       else {
//         console.error(err);
//       }
//     }


//   try {
//     await cluster.query(usersCollectionIndex);
//     console.log('Users Index Creation: SUCCESS');
//   } catch (err) {
//     if (err instanceof couchbase.IndexExistsError) {
//       console.info('Users Index Creation: Index Already Exists');
//     } else if (err instanceof couchbase.PlanningFailureError) {
//       console.info(
//         'Collection Index Creation: Users Collection Not Found. Ensure collection `users` exists.'
//       );
//     } else {
//       console.log(err);
//     }
//   }
// };
// const router = express.Router();
// router.get('/', async (req: Request, res: Response) => {
//   console.log("successful!");
//   res.status(200);
//   res.json({message: 'successful'})
// });
// // const api = 'https://api.realworld.io/api'

// router.post('https://api.realworld.io/api/users', async (req: Request, res: Response) => {
//   console.log("Hitting users endpoint")
//   // log.info('Connected to Couchbase');
//   const {usersCollection} = await connectToDatabase();
//   console.log(usersCollection, "USERS COLLECTION")

//   const username = req.body.username;
//   const email =req.body.email
//   const password =req.body.pass
//   // const user = {name : username}

//   const user = {
//     type: 'user',
//     name: 'Michael',
//     email: 'michael123@test.com',
//     interests: ['Swimming', 'Rowing'],
//   }
//   const accessToken = jwt.sign(user, SECRET)
//   res.json({accessToken: accessToken})

//   if (!email || !password) {
//     return res.status(400).send({
//       message: `${!email ? 'email ' : ''}${
//         !email && !password ? 'and pass are required' : email && !password? 'pass is required': 'is required'
//       }`,
//     });
//   }

//   const id = v4();
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
//     // // return res.status(500)
//     // return res.status(500).send({
//     //   message: `Something went wrong}`,
//     // });
// });

// function authenticateToken(req, res, next){
//   const authHeader = req.headers['authorization']
//   const token = authHeader && authHeader.split(' ')[1]
//   if (token == null) return res.sendStatus(401)

//   jwt.verify(token, SECRET, (err, user)=> {
//     if (err) return res.sendStatus(403)
//     req.user = user
//     next()
//   })
// }
// // app.post('/users', async (req: Request, res: Response) => {
// //   console.log("Hitting users endpoint")
// //   const {usersCollection} = await connectToDatabase();
// //   console.log(usersCollection, "USERS COLLECTION")

// //   const username = req.body.username;
// //   const email =req.body.email
// //   const password =req.body.pass
// //   // const user = {name : username}

// //   const user = {
// //     type: 'user',
// //     name: 'Michael',
// //     email: 'michael123@test.com',
// //     interests: ['Swimming', 'Rowing'],
// //   }
// //   const accessToken = jwt.sign(user, SECRET)
// //   res.json({accessToken: accessToken})

// //   if (!email || !password) {
// //     return res.status(400).send({
// //       message: `${!email ? 'email ' : ''}${
// //         !email && !password ? 'and pass are required' : email && !password? 'pass is required': 'is required'
// //       }`,
// //     });
// //   }

// //   const id = v4();
// //   const users = {
// //     pid: id,
// //     ...req.body,
// //     pass: bcrypt.hashSync(password, 10),
// //   };
// //   console.log(users, "USERS")

// //   await usersCollection
// //     .insert(id, users)
// //     .then((result: any) => {
// //       return res.send({...users, ...result});
// //     })
// //     .catch((e: {message: any}) => {
// //       return res.status(500).send({
// //         message: `User Insert Failed: ${e.message}`,
// //       });
// //     });

// //     return res.send()
// //     // // return res.status(500)
// //     // return res.status(500).send({
// //     //   message: `Something went wrong}`,
// //     // });
// // });

// // function authenticateToken(req, res, next){
// //   const authHeader = req.headers['authorization']
// //   const token = authHeader && authHeader.split(' ')[1]
// //   if (token == null) return res.sendStatus(401)

// //   jwt.verify(token, SECRET, (err, user)=> {
// //     if (err) return res.sendStatus(403)
// //     req.user = user
// //     next()
// //   })
// // }
// //TODO Gets the currently logged-in user
// app.get('/api/user', verifyJWT, async (req: Request, res: Response) => {
//   //TODO: Verify email and password in from database
//   //If authentication is successful, get the current user


//   const {usersCollection} = await connectToDatabase();
//   try {
//     await usersCollection
//       .get(req.body.email)
//       .then((result: {value: any}) => res.send(result.value))
//       .catch((error: {message: any}) =>
//         res.status(500).send({
//           message: `Failed to get user: ${error.message}`,
//         })
//       );
//   } catch (error) {
//     console.error(error);
//   }
// });
// // app.get('/profile/:pid', async (req: Request, res: Response) => {
// //   const {profilesCollection} = await connectToDatabase();
// //   try {
// //     await profilesCollection
// //       .get(req.params.pid)
// //       .then((result: {value: any}) => res.send(result.value))
// //       .catch((error: {message: any}) =>
// //         res.status(500).send({
// //           message: `KV Operation Failed: ${error.message}`,
// //         })
// //       );
// //   } catch (error) {
// //     console.error(error);
// //   }
// // });
// // app.put('/user:uid')
// app.put('api/user', verifyJWT, async (req: Request, res: Response) => {
//   const {usersCollection} = await connectToDatabase(); //check if users collectiom and grab ID of current user 
//   try {
//     await usersCollection
//       .get(req.body.email) //check how they expect to grab the logged in user wihtout an attached uid
//       .then(
//         async (result: {
//           value: {
//              // pid: any;
//              email: string;
//              pass: string;
//              username: string;
//              bio: string;
//              image: string;
//           };
//         }) => {
//           /* Create a New Document with new values,
//           if they are not passed from request, use existing values */
//           const updatedUser = {
//             // pid: result.value.pid,
//             email: req.body.email ? req.body.email : result.value.email,
//             pass: req.body.pass
//               ? bcrypt.hashSync(req.body.pass, 10)
//               : result.value.pass,
//             username: req.body.username
//               ? req.body.username
//               : result.value.username,
//             bio: req.body.bio
//               ? req.body.bio
//               : result.value.bio,
//             image: req.body.image
//               ? req.body.image
//               : result.value.image,
//           };
//           /* Persist updates with new doc */
//           await usersCollection
//             .upsert(updatedUser)
//             // .upsert(req.params.pid, updatedUser)
//             .then((result: any) => res.send({...updatedUser, ...result}))
//             .catch((e: any) => res.status(500).send(e));
//         }
//       )
//       .catch((e: {message: any}) =>
//         res.status(500).send({
//           message: `User Not Found, cannot update: ${e.message}`,
//         })
//       );
//   } catch (e) {
//     console.error(e);
//   }
// });
// // app.put('/profile/:pid', async (req: Request, res: Response) => {
// //   const {profilesCollection} = await connectToDatabase();
// //   try {
// //     await profilesCollection
// //       .get(req.params.pid)
// //       .then(
// //         async (result: {
// //           value: {
// //             pid: any;
// //             firstName: any;
// //             lastName: any;
// //             email: any;
// //             pass: any;
// //           };
// //         }) => {
// //           /* Create a New Document with new values,
// //           if they are not passed from request, use existing values */
// //           const newDoc = {
// //             pid: result.value.pid,
// //             firstName: req.body.firstName
// //               ? req.body.firstName
// //               : result.value.firstName,
// //             lastName: req.body.lastName
// //               ? req.body.lastName
// //               : result.value.lastName,
// //             email: req.body.email ? req.body.email : result.value.email,
// //             pass: req.body.pass
// //               ? bcrypt.hashSync(req.body.pass, 10)
// //               : result.value.pass,
// //           };
// //           /* Persist updates with new doc */
// //           await profilesCollection
// //             .upsert(req.params.pid, newDoc)
// //             .then((result: any) => res.send({...newDoc, ...result}))
// //             .catch((e: any) => res.status(500).send(e));
// //         }
// //       )
// //       .catch((e: {message: any}) =>
// //         res.status(500).send({
// //           message: `Profile Not Found, cannot update: ${e.message}`,
// //         })
// //       );
// //   } catch (e) {
// //     console.error(e);
// //   }
// // });

// // No auth required 
// app.post('api/users/login', async (req: Request, res: Response) => {
//   console.log("Hitting user login endpoint")
//   const {usersCollection} = await connectToDatabase();
//   console.log(usersCollection, "USERS COLLECTION")
//   if (!req.body.email || !req.body.pass) {
//     return res.status(400).send({
//       message: `${!req.body.email ? 'email ' : ''}${
//         !req.body.email && !req.body.pass
//           ? 'and pass are required'
//           : req.body.email && !req.body.pass
//           ? 'pass is required'
//           : 'is required'
//       }`,
//     });
//   }

//   // const id = v4();
//   // const profile = {
//   //   pid: id,
//   //   ...req.body,
//   //   pass: bcrypt.hashSync(req.body.pass, 10),
//   // };
//   // console.log(profile, "PROFILE")

//   // await usersCollection
//   //   .insert(id, user)
//   //   .then((result: any) => {
//   //     return res.send({...user, ...result});
//   //   })
//   //   .catch((e: {message: any}) => {
//   //     return res.status(500).send({
//   //       message: `User Insert Failed: ${e.message}`,
//   //     });
//   //   });

//     return res.send()
//     // return res.status(500)
//     // return res.status(500).send({
//     //   message: `Something went wrong}`,
//     // });
// });

// app.post('api/articles/feed', async (req: Request, res: Response) => {
//   console.log("Hitting articles endpoint")
//   const {articlesCollection} = await connectToDatabase();
//   console.log(articlesCollection, "ARTICLES COLLECTION")
//   const article = req.body.article;
//   const title = req.body.title
//   const description = req.body.description
//   const body = req.body.body
//   const tagList = [req.body.tagList] // TODO write code to insert tags into the list and be able to separate by commas (remember string.toLowerCase)
//   const requiredParams = [article, title, description, body, tagList]

//   for (let param of requiredParams){
//     if (!req.body[param]){
//       return res.status(400).send({
//         message: `${param} is required`
//       })
//     }
//   }

//   // if (!article || !title || !description ||!body || !tagList ) {
//   //   return res.status(400).send({
//   //     //TODO Fix this message w the conditional logic from items above
//   //     message: `${!email ? 'email ' : ''}${
//   //       !email && !password ? 'and pass are required' : email && !password? 'pass is required': 'is required'
//   //     }`,
//   //   });
//   // }

//   // 

//   await articlesCollection
//     .insert(article, title, description, body, tagList)
//     .then((result: any) => {
//       return res.send({...article, title, description, body, tagList, ...result});
//     })
//     .catch((e: {message: any}) => {
//       return res.status(500).send({
//         message: `Article Insert Failed: ${e.message}`,
//       });
//     });

//     return res.send()
//     // // return res.status(500)
//     // return res.status(500).send({
//     //   message: `Something went wrong}`,
//     // });
// });
// // app.get('/articles/feed', async (req: Request, res: Response) => {
// //   const {articlesCollection} = await connectToDatabase();
// //   try {
// //     await articlesCollection
// //       .get(req.params.pid)
// //       .then((result: {value: any}) => res.send(result.value))
// //       .catch((error: {message: any}) =>
// //         res.status(500).send({
// //           message: `KV Operation Failed: ${error.message}`,
// //         })
// //       );
// //   } catch (error) {
// //     console.error(error);
// //   }
// // });

// app.put('/profile/:pid', async (req: Request, res: Response) => {
//   const {profilesCollection} = await connectToDatabase();
//   try {
//     await profilesCollection
//       .get(req.params.pid)
//       .then(
//         async (result: {
//           value: {
//             pid: any;
//             firstName: any;
//             lastName: any;
//             email: any;
//             pass: any;
//           };
//         }) => {
//           /* Create a New Document with new values,
//           if they are not passed from request, use existing values */
//           const newDoc = {
//             pid: result.value.pid,
//             firstName: req.body.firstName
//               ? req.body.firstName
//               : result.value.firstName,
//             lastName: req.body.lastName
//               ? req.body.lastName
//               : result.value.lastName,
//             email: req.body.email ? req.body.email : result.value.email,
//             pass: req.body.pass
//               ? bcrypt.hashSync(req.body.pass, 10)
//               : result.value.pass,
//           };
//           /* Persist updates with new doc */
//           await profilesCollection
//             .upsert(req.params.pid, newDoc)
//             .then((result: any) => res.send({...newDoc, ...result}))
//             .catch((e: any) => res.status(500).send(e));
//         }
//       )
//       .catch((e: {message: any}) =>
//         res.status(500).send({
//           message: `Profile Not Found, cannot update: ${e.message}`,
//         })
//       );
//   } catch (e) {
//     console.error(e);
//   }
// });

// app.delete('/profile/:pid', async (req: Request, res: Response) => {
//   const {profilesCollection} = await connectToDatabase();
//   try {
//     await profilesCollection
//       .remove(req.params.pid)
//       .then((result: {value: any}) => res.send(result.value))
//       .catch((error: {message: any}) =>
//         res.status(500).send({
//           message: `Profile Not Found, cannot delete: ${error.message}`,
//         })
//       );
//   } catch (e) {
//     console.error(e);
//   }
// });

// app.get('/profiles', async (req: Request, res: Response) => {
//   const {cluster} = await connectToDatabase();
//   try {
//     const options = {
//       parameters: {
//         SKIP: Number(req.query.skip || 0),
//         LIMIT: Number(req.query.limit || 5),
//         SEARCH: `%${req.query.search?.toString().toLowerCase()}%`,
//       },
//     };
//     console.log("options ", options)
//     const query = `
//        SELECT p.*
//        FROM ${process.env.CB_BUCKET}._default.profile
//        WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH`
//     // const query = `
//     //   SELECT p.*
//     //   FROM ${process.env.CB_BUCKET}._default.profile p
//     //   WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH
//     //   LIMIT $LIMIT OFFSET $SKIP;
//     // `;
//     console.log("cluster.query ", cluster.query)
//     await cluster
//       .query(query, options)
//       .then((result: {rows: any}) => res.send(result.rows))
//       .catch((error: {message: any}) =>
//         res.status(500).send({
//           message: `Query failed: ${error.message}`,
//         })
//       );
//   } catch (e) {
//     console.error(e);
//   }
// });

// app.post('/profile/{pid}/article/{aid}', async (req: Request, res: Response) => {
//   const {articlesCollection} = await connectToDatabase();
//   if (!req.body.email || !req.body.pass) {
//     return res.status(400).send({
//       message: `${!req.body.email ? 'email ' : ''}${
//         !req.body.email && !req.body.pass
//           ? 'and pass are required'
//           : req.body.email && !req.body.pass
//           ? 'pass is required'
//           : 'is required'
//       }`,
//     });
//   }

//   const id = v4();
//   const profile = {
//     pid: id,
//     ...req.body,
//     pass: bcrypt.hashSync(req.body.pass, 10),
//   };
//   await articlesCollection
//     .insert(id, profile)
//     .then((result: any) => {return res.send({...profile, ...result})})
//     .catch((e: {message: any}) =>
//       {return res.status(500).send({
//         message: `Profile Insert Failed: ${e.message}`,
//       })}
//     );
//     return res.status(500).send({
//       message: `something went wrong`,
//     })
// });

// app.get('/profile/article/:aid', async (req: Request, res: Response) => {
//   const {articlesCollection} = await connectToDatabase();
//   try {
//     await articlesCollection
//       .get(req.params.pid)
//       .then((result: {value: any}) => res.send(result.value))
//       .catch((error: {message: any}) =>
//         res.status(500).send({
//           message: `KV Operation Failed: ${error.message}`,
//         })
//       );
//   } catch (error) {
//     console.error(error);
//   }
// });

// app.put('/profile/article/:aid', async (req: Request, res: Response) => {
//   const {articlesCollection} = await connectToDatabase();
//   try {
//     await articlesCollection
//       .get(req.params.pid)
//       .then(
//         async (result: {
//           value: {
//             pid: any;
//             firstName: any;
//             lastName: any;
//             email: any;
//             pass: any;
//           };
//         }) => {
//           /* Create a New Document with new values,
//           if they are not passed from request, use existing values */
//           const newDoc = {
//             pid: result.value.pid,
//             firstName: req.body.firstName
//               ? req.body.firstName
//               : result.value.firstName,
//             lastName: req.body.lastName
//               ? req.body.lastName
//               : result.value.lastName,
//             email: req.body.email ? req.body.email : result.value.email,
//             pass: req.body.pass
//               ? bcrypt.hashSync(req.body.pass, 10)
//               : result.value.pass,
//           };
//           /* Persist updates with new doc */
//           await articlesCollection
//             .upsert(req.params.pid, newDoc)
//             .then((result: any) => res.send({...newDoc, ...result}))
//             .catch((e: any) => res.status(500).send(e));
//         }
//       )
//       .catch((e: {message: any}) =>
//         res.status(500).send({
//           message: `Profile Not Found, cannot update: ${e.message}`,
//         })
//       );
//   } catch (e) {
//     console.error(e);
//   }
// });

// app.delete('/profile/article/:aid', async (req: Request, res: Response) => {
//   const {articlesCollection} = await connectToDatabase();
//   try {
//     await articlesCollection
//       .remove(req.params.pid)
//       .then((result: {value: any}) => res.send(result.value))
//       .catch((error: {message: any}) =>
//         res.status(500).send({
//           message: `Profile Not Found, cannot delete: ${error.message}`,
//         })
//       );
//   } catch (e) {
//     console.error(e);
//   }
// });

// app.get('/profile/articles', async (req: Request, res: Response) => {
//   const {cluster} = await connectToDatabase();
//   try {
//     const options = {
//       parameters: {
//         SKIP: Number(req.query.skip || 0),
//         LIMIT: Number(req.query.limit || 5),
//         SEARCH: `%${req.query.search?.toString().toLowerCase()}%`,
//       },
//     };
//     const query = `
//       SELECT p.*
//       FROM ${process.env.CB_BUCKET}._default.profile.comments p
//       WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH
//       LIMIT $LIMIT OFFSET $SKIP;
//     `;
//     await cluster
//       .query(query, options)
//       .then((result: {rows: any}) => res.send(result.rows))
//       .catch((error: {message: any}) =>
//         res.status(500).send({
//           message: `Query failed: ${error.message}`,
//         })
//       );
//   } catch (e) {
//     console.error(e);
//   }
// });

// // app.post('/profile/article/comment', async (req: Request, res: Response) => {
// //   const {commentCollection} = await connectToDatabase();
// //   if (!req.body.email || !req.body.pass) {
// //     return res.status(400).send({
// //       message: `${!req.body.email ? 'email ' : ''}${
// //         !req.body.email && !req.body.pass
// //           ? 'and pass are required'
// //           : req.body.email && !req.body.pass
// //           ? 'pass is required'
// //           : 'is required'
// //       }`,
// //     });
// //   }

// //   const id = v4();
// //   const profile = {
// //     pid: id,
// //     ...req.body,
// //     pass: bcrypt.hashSync(req.body.pass, 10),
// //   };
// //   await commentCollection
// //     .insert(id, profile)
// //     .then((result: any) => {return res.send({...profile, ...result})})
// //     .catch((e: {message: any}) =>
// //       {return res.status(500).send({
// //         message: `Profile Insert Failed: ${e.message}`,
// //       })}
// //     );
// //     return res.status(500).send({
// //       message: `Something went wrong`,
// //     })
// // });

// // app.get('/profile/article/:aid', async (req: Request, res: Response) => {
// //   const {commentCollection} = await connectToDatabase();
// //   try {
// //     await commentCollection
// //       .get(req.params.pid)
// //       .then((result: {value: any}) => res.send(result.value))
// //       .catch((error: {message: any}) =>
// //         res.status(500).send({
// //           message: `KV Operation Failed: ${error.message}`,
// //         })
// //       );
// //   } catch (error) {
// //     console.error(error);
// //   }
// // });

// // app.put('/profile/article/:aid', async (req: Request, res: Response) => {
// //   const {commentCollection} = await connectToDatabase();
// //   try {
// //     await commentCollection
// //       .get(req.params.pid)
// //       .then(
// //         async (result: {
// //           value: {
// //             pid: any;
// //             firstName: any;
// //             lastName: any;
// //             email: any;
// //             pass: any;
// //           };
// //         }) => {
// //           /* Create a New Document with new values,
// //           if they are not passed from request, use existing values */
// //           const newDoc = {
// //             pid: result.value.pid,
// //             firstName: req.body.firstName
// //               ? req.body.firstName
// //               : result.value.firstName,
// //             lastName: req.body.lastName
// //               ? req.body.lastName
// //               : result.value.lastName,
// //             email: req.body.email ? req.body.email : result.value.email,
// //             pass: req.body.pass
// //               ? bcrypt.hashSync(req.body.pass, 10)
// //               : result.value.pass,
// //           };
// //           /* Persist updates with new doc */
// //           await commentCollection
// //             .upsert(req.params.pid, newDoc)
// //             .then((result: any) => res.send({...newDoc, ...result}))
// //             .catch((e: any) => res.status(500).send(e));
// //         }
// //       )
// //       .catch((e: {message: any}) =>
// //         res.status(500).send({
// //           message: `Profile Not Found, cannot update: ${e.message}`,
// //         })
// //       );
// //   } catch (e) {
// //     console.error(e);
// //   }
// // });

// // app.delete('/profile/article/:aid', async (req: Request, res: Response) => {
// //   const {commentCollection} = await connectToDatabase();
// //   try {
// //     await commentCollection
// //       .remove(req.params.pid)
// //       .then((result: {value: any}) => res.send(result.value))
// //       .catch((error: {message: any}) =>
// //         res.status(500).send({
// //           message: `Profile Not Found, cannot delete: ${error.message}`,
// //         })
// //       );
// //   } catch (e) {
// //     console.error(e);
// //   }
// // });

// // app.get('/profile/article/comment', async (req: Request, res: Response) => {
// //   const {cluster} = await connectToDatabase();
// //   try {
// //     const options = {
// //       parameters: {
// //         SKIP: Number(req.query.skip || 0),
// //         LIMIT: Number(req.query.limit || 5),
// //         SEARCH: `%${req.query.search?.toString().toLowerCase()}%`,
// //       },
// //     };
// //     const query = `
// //       SELECT p.*
// //       FROM ${process.env.CB_BUCKET}._default.profile.comments p
// //       WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH
// //       LIMIT $LIMIT OFFSET $SKIP;
// //     `;
// //     await cluster
// //       .query(query, options)
// //       .then((result: {rows: any}) => res.send(result.rows))
// //       .catch((error: {message: any}) =>
// //         res.status(500).send({
// //           message: `Query failed: ${error.message}`,
// //         })
// //       );
// //   } catch (e) {
// //     console.error(e);
// //   }
// //});

// const port = parseInt(process.env.APP_PORT || '') || 3000;

// app.listen(port)
// ensureIndexes()
// module.exports = {app, ensureIndexes};
