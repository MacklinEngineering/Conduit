import bodyParser from 'body-parser';
import express, {Request, Response} from 'express';
import * as couchbase from 'couchbase';
import verifyJWT from '../verifyJWT';
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

router
    .route("") // /articles/{slug}/favorites
    .post(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 

        //Take the input by the slug
            // console.log("QUERY RESULT :", userQuery)
            // let databaseUser = userQuery.rows[0].users

            ​const cluster = await couchbase.connect(clusterConnStr, {
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



            const articlesQuery = await bucket
            .scope('blog')                                //turn into template literal
            .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {
            })

            let databaseArticle = articlesQuery.rows[0].articles
            console.log("Database Article", databaseArticle)
            let favoritesCount = databaseArticle.favoritesCount+1
            let favorited = true
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



            // console.log("Articles", articlesQuery)
            // let singleArticleFromQuery = articlesQuery.rows[0].articles
            // console.log("Articles", singleArticleFromQuery)
            // return res.status(200).json(  {article: databaseArticle}   )





        //Increment favoritesCount ++ 
        //Send to database
        //Get from Database
        //Return article
        // return res.send(console.log("Hello Post Articles Favorites"))
    })

router
    .route("") // /articles/{slug}/favorites
    .delete(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
        // const token = req.header("authorization")?.replace("Token ","")
        // return res.send( console.log("Hello Delete Articles Favorites"))

        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 

        //Take the input by the slug
            // console.log("QUERY RESULT :", userQuery)
            // let databaseUser = userQuery.rows[0].users

            ​const cluster = await couchbase.connect(clusterConnStr, {
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