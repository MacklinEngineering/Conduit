import bodyParser from 'body-parser';
import express, {Request, Response} from 'express';
import * as couchbase from 'couchbase';
import verifyJWT from '../verifyJWT';
import { Profile } from './profiles';

export interface Users {
    username : string ;
    email : string;
    password :string;
    bio: string;
    image: string;
    token: string;
    id: string;
 }
 
 export interface Comment {
    id: number; //0
    createdAt: string, //"2016-02-18T03:22:56.637Z",
    updatedAt: string; //"2016-02-18T03:48:35.824Z",
    body: string; //"bodyodyodyody"
    author: Profile
 }
 // import * as couchbase from 'couchbase';
 export const clusterConnStr = 'couchbases://cb.yfxtafw9ud1ccllx.cloud.couchbase.com'
 export const capellaUsername = 'Admin1'
 export const capellaPassword = 'Password1!'
 export const bucketName = 'ConduitDemo'

const router = express.Router({ mergeParams: true });

router
    .route("") // /articles/{slug}/comments
    .post(bodyParser.json(),verifyJWT, async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 
        //takes in slug
        //and req.body
        let requestCommentBody = req.body.comment.body
        console.log("inputData", requestCommentBody)

        const commentId = Math.random() //TODO everytime this is called +1
        let date = new Date().toISOString()

        //DO a call to the /profiles endpoint and get the profile (using the token) for this user
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
              .scope('blog')                               
              .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
              })
  
              userQuery.rows.forEach((row) => {
            console.log("WHAT IS THIS", row)
      })
    let databaseUser = userQuery["rows"][0].users

    const articlesQuery = await bucket
    .scope('blog')                                //turn into template literal
    .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {
    })

    console.log("Articles", articlesQuery)
    let singleArticleFromQuery = articlesQuery.rows[0].articles
    console.log("Articles", singleArticleFromQuery)


        //Search articles list for one with slug 
        const comment: Comment = {
            id: commentId,
            createdAt: date,
            updatedAt: date,
            body: requestCommentBody,
            author: {
                username:  singleArticleFromQuery.author.username, ///profile.username,
                bio: singleArticleFromQuery.author.bio,
                image: singleArticleFromQuery.author.image,
                following: singleArticleFromQuery.author.following
            }
        }

        //Create the index for the document to go into
        const bucketIndex = ​`CREATE PRIMARY INDEX ON default:ConduitDemo.blog.comments`   
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
        //Save this document to the comments collection
        const getResult = await commentsCollection
            .upsert(databaseUser.id, comment)  //rewrites the entire document, have to learn how "mutateIn" method works for optimization
            .then((result: any) => {
                console.log("The Article Upsert Works")
            })
            .catch((e: {message: any}) => {
                return res.status(500).send({
                message: `Article Upsert Failed: ${e.message}`,
                });
            });
                
            //TODO: Requires refactor to programmatically add to user nested object 
            
            let commentResult = {"comment" : await commentsCollection.get(databaseUser.id)}
            
            console.log('Create Comment Result: ', commentResult )
            
            const myComment = commentResult.comment.content
            console.log(myComment, "MY Comment")
            return res.status(200).json({comment : myComment})
    })

router
    .route("") // /articles/{slug}/comments
    .get(bodyParser.json(), async (req: Request, res: Response) => {
        var slug = req.params['slug'] 
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

    //    const userQuery = await bucket
    //           .scope('blog')                               
    //           .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
    //           })
  
    //           userQuery.rows.forEach((row) => {
    //         console.log("WHAT IS THIS", row)
    //   })
    // let databaseUser = userQuery["rows"][0].users

    const commentsQuery = await bucket
             .scope('blog')                               
             .query(`SELECT * FROM \`comments\`;`, {
             })

     
            //  console.log("Article Feed Profiles Following", userNames)

             //   //deleteing extra articles key on object
                    let commentsList : Comment[] = []
                    commentsQuery.rows.forEach((row) => {
            //   console.log("ROWS IN THE WORKING put /articles QUERY", row)
            commentsList.push(row.comments)
            })
      

            //  let filteredArticles = commentsList.filter(document => userNames.includes(document.author.username))
            // console.log("FILTERED ARTICLES", filteredArticles)
    // //   console.log(userQuery["rows"].filter(document => document.following ===true))
    //   const followingUsers = userQuery["rows"].filter(document => document.following ===true)
    //   followingUsers

        // return res.send(following)
        return res.status(200).json(  {comments: commentsList}   )

    })
    
router
    .route("") // /articles/{slug}/comments
    .delete(bodyParser.json(),verifyJWT, async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 
        let commentId = req.params['id']
        //takes in slug
        //and req.body
        let requestCommentBody = req.body.comment.body
        console.log("inputData", requestCommentBody)

        //DO a call to the /profiles endpoint and get the profile (using the token) for this user
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
              .scope('blog')                               
              .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
              })
  
              userQuery.rows.forEach((row) => {
            console.log("WHAT IS THIS", row)
      })
    let databaseUser = userQuery["rows"][0].users

    const commentsQuery = await bucket
    .scope('blog')                                //turn into template literal
    .query(`SELECT * FROM \`comments\` WHERE id='${commentId}';`, {
    })

    console.log("Comments", commentsQuery)
    let singleCommentFromQuery = commentsQuery.rows[0].articles
    console.log("Single Comment", singleCommentFromQuery)
        

        //Save this document to the comments collection
        const getResult = await commentsCollection
            .remove(databaseUser.id, singleCommentFromQuery)  //rewrites the entire document, have to learn how "mutateIn" method works for optimization
            .then((result: any) => {
                console.log("The Comment Upsert Works")
            })
            .catch((e: {message: any}) => {
                return res.status(500).send({
                message: `Comment Upsert Failed: ${e.message}`,
                });
            });
                
            //TODO: Requires refactor to programmatically add to user nested object 
            
            let commentResult = {"comment" : await commentsCollection.get(databaseUser.id)}
            
            console.log('Create Comment Result: ', commentResult )
            
            const myComment = commentResult.comment.content
            console.log(myComment, "MY Comment")
            return res.status(200).json({comment : myComment})
    })

export default router
