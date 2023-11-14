import bodyParser from 'body-parser';
import express, {Request, Response} from 'express';
import * as couchbase from 'couchbase';
import verifyJWT from '../verifyJWT.js';
import { Profile } from './profiles.js';
import {clusterConnStr,capellaUsername, capellaPassword , bucketName, cluster, bucket, usersCollection, profilesCollection, articlesCollection, commentsCollection, favoritesCollection, tagsCollection, couchbaseConnection} from "../db/plug.ts"


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


const router = express.Router({ mergeParams: true });

router
    .route("") // /articles/{slug}/comments
    .post(bodyParser.json(),verifyJWT, async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 
        
        let requestCommentBody = req.body.comment.body
        // console.log("inputData", requestCommentBody)

        const commentId = Math.random() //TODO everytime this is called +1
        let date = new Date().toISOString()

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
    

    const commentsQuery = await bucket
             .scope('blog')                               
             .query(`SELECT * FROM \`comments\`;`, {
             })
             //   //deleteing extra articles key on object
                    let commentsList : Comment[] = []
                    commentsQuery.rows.forEach((row) => {
            //   console.log("ROWS IN THE WORKING put /articles QUERY", row)
            commentsList.push(row.comments)
            })
      
        return res.status(200).json(  {comments: commentsList}   )

    })
    
router
    .route("") // /articles/{slug}/comments
    .delete(bodyParser.json(),verifyJWT, async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 
        let commentId = req.params['id']
        let requestCommentBody = req.body.comment.body
        console.log("inputData", requestCommentBody)

        

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
