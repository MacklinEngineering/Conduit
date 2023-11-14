import bodyParser from 'body-parser';
import express, {Request, Response} from 'express';
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
 

router
    .route("") // /articles/{slug}/favorites
    .post(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 

        
            const userQuery = await bucket
            .scope('blog')                                //turn into template literal
            .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
            })

            userQuery.rows.forEach((row) => {
            console.log("ROWS IN THE WORKING put /user QUERY", row)
            })

            console.log("QUERY RESULT :", userQuery)

            let databaseUser = userQuery.rows[0].users

            const articlesQuery = await bucket
            .scope('blog')                                //turn into template literal
            .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {
            })

            let databaseArticle = articlesQuery.rows[0].articles
            console.log("Database Article", databaseArticle)
            let favoritesCount = databaseArticle.favoritesCount+1
            let favorited = true
            // console.log("NEW COUNT", favoritesCount)

            const getResult = await articlesCollection
                                        //Spread across the Article object and update favoritesCount & favorited value only
            .replace(databaseUser.id, {...databaseArticle, favoritesCount, favorited})  //rewrites the entire document, have to learn how "mutateIn" method works for optimization
            .then((result: any) => {
                console.log("The Replace Works")
            })
            .catch((e: {message: any}) => {
                return res.status(500).send({
                message: `Article Insert Failed: ${e.message}`,
                });
            });

            let updateArticleResult = {"article" : await articlesCollection.get(databaseUser.id)}
          
            console.log('Update Article Result: ', updateArticleResult )
          
            const myArticleObject = updateArticleResult.article.content
            console.log(myArticleObject, "MY USER OBJECT AFTER REPLACE METHOD WITH TOKEN AND ID")
    
    
        return res.status(200).json(  {article: myArticleObject}   )

    })

router
    .route("") // /articles/{slug}/favorites
    .delete(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
       

        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 

            const userQuery = await bucket
            .scope('blog')                                //turn into template literal
            .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
            })

            userQuery.rows.forEach((row) => {
            console.log("ROWS IN THE WORKING put /user QUERY", row)
            })

            console.log("QUERY RESULT :", userQuery)

            let databaseUser = userQuery.rows[0].users



            const articlesQuery = await bucket
            .scope('blog')                                //turn into template literal
            .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {
            })

            let databaseArticle = articlesQuery.rows[0].articles
            console.log("Database Article", databaseArticle)
            let favoritesCount = databaseArticle.favoritesCount-1
            let favorited = false
            console.log("NEW COUNT", favoritesCount)

            const getResult = await articlesCollection
                                        //Spread across the Article object and update favoritesCount & favorited value only
            .replace(databaseUser.id, {...databaseArticle, favoritesCount, favorited})  //rewrites the entire document, have to learn how "mutateIn" method works for optimization
            .then((result: any) => {
                console.log("The Replace Works")
            })
            .catch((e: {message: any}) => {
                return res.status(500).send({
                message: `Article Insert Failed: ${e.message}`,
                });
            });

            let updateArticleResult = {"article" : await articlesCollection.get(databaseUser.id)}
          
            console.log('Update Article Result: ', updateArticleResult )
          
            const myArticleObject = updateArticleResult.article.content
            console.log(myArticleObject, "MY USER OBJECT AFTER REPLACE METHOD WITH TOKEN AND ID")
    
    
        return res.status(200).json(  {article: myArticleObject}   )
    })

export default router