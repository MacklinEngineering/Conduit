import bodyParser from 'body-parser';
import express, {Request, Response} from 'express';
import * as couchbase from 'couchbase';
import verifyJWTOptional from '../verifyJWTOptional.js';
import verifyJWT from '../verifyJWT.js';
import {clusterConnStr,capellaUsername, capellaPassword , bucketName, cluster, bucket, usersCollection, profilesCollection, articlesCollection, commentsCollection, favoritesCollection, tagsCollection, couchbaseConnection} from "../db/plug.ts"

const router = express.Router();
export interface Users {
    username : string ;
    email : string;
    password :string;
    bio: string;
    image: string;
    token: string;
    id: string;
 }

export interface Articles {
    articles: Article[]; 
    articlesCount: number;
}

export interface Article{
      slug: string; 
      title: string; 
      description: string; 
      body: string; 
      tagList: string[]; 
      createdAt: string, 
      updatedAt: string; 
      favorited: boolean; 
      favoritesCount: number; 
      author: Author; 
  }
  export interface Author{
        username: string; 
        bio: string; 
        image:string; 
        following: boolean; 
  }
  
  export let tagsMegaList: string[] = []
       
 
router
    .route("") // /articles
    .get(bodyParser.json(), verifyJWTOptional,  async (req: Request, res: Response) => {
        const author = req.query.author
           
        let limit = 20;
        let offset = 0;
        let query = {};
        if (req.query.limit) {
            let limit = req.query.limit;
        }
    
        if (req.query.offset) {
            let offset = req.query.offset;
        }

          //Might not need to run a query for the user
          const userQuery = await bucket
              .scope('blog')                               
              .query(`SELECT * FROM \`articles\`;`, {
              })

            //deleteing extra articles key on object
              let newArticles : Article[] = []
              userQuery.rows.forEach((row) => {
              newArticles.push(row.articles)
      })
  
    //   console.log("QUERY RESULT GET ARTICLES :", newArticles)
    //   if (req.query.tagList) {
    //     // tagList = [ 'training', 'dragons' ]
    //     // let filteredArticles = newArticles.filter(document => tagList.includes(document.author.username)
    //     // newArticles.filter("")
    //     //TODO: NEED TO FIX
    //     // let query[`"${req.query.tag}"`] = { $in: { $field: 'tagList' } }
    //     // query.tagList = { $in: [req.query.tag] } // Works with
    // }

      const articles: Articles = {
        articlesCount: userQuery.rows.length,
        articles: newArticles
      }

    //   let favoritesCount = databaseArticle.favoritesCount+1

        
      return res.status(200).json(articles)
   


    });  

router
    .route("") // /articles
    .post(verifyJWT, bodyParser.json(), async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        console.log("Got into POST /articles")

          //Search if there are any articles at all - return up to 20 of them
         
          //Also, if user enters a param, search any articles by that username

          //Grab the user by the token
          const userQuery = await bucket
              .scope('blog')                               
              .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
              })
  
              userQuery.rows.forEach((row) => {
            console.log("WHAT IS THIS", row)
      })

      //grab that users bio, image, and username - populate the article object 

  
    //   console.log("QUERY RESULT POST:", userQuery["rows"])

       //Create an Article
       console.log(req.body)
       let databaseUser = userQuery["rows"][0].users
       let slug = req.body.article.title.replace(/ /g,'-')
       let date = new Date().toISOString()
       let favorited = false
       let favoritedCount = 0

         
        
        ///TODO: ISSUE - TAGS LIST FOR TAGS ONLY YOU HAVE MADE - NOT EVERY USER :()
        req.body.article.tagList.forEach((item) => {
            tagsMegaList.push(item)
      })
      console.log("MEGA LIST OF TAGS:", tagsMegaList)
       
       const article: Article = {
        slug: slug, 
        title: req.body.article.title, 
        description: req.body.article.description,
        body: req.body.article.body, 
        tagList: req.body.article.tagList,
        createdAt: date, 
        updatedAt: date, 
        favorited: favorited, 
        favoritesCount: favoritedCount, 
        author: { 
            username: databaseUser.username, 
            bio: databaseUser.bio, 
            image: databaseUser.image, 
            following: false, 
        }
      }
      
    
      const getResult = await articlesCollection
      .upsert(databaseUser.id, article)  //rewrites the entire document, have to learn how "mutateIn" method works for optimization
      .then((result: any) => {
          console.log("The Article Upsert Works")
      })
      .catch((e: {message: any}) => {
          return res.status(500).send({
          message: `Article Upsert Failed: ${e.message}`,
          });
      });
        
    
      let articleResult = {"article" : await articlesCollection.get(databaseUser.id)}
    
      console.log('Create Article Result: ', articleResult )
    
      const myArticle = articleResult.article.content
      console.log(myArticle, "MY ARTICLE")
                return res.status(200).json({article : myArticle})
              
    });

router
    .route("/feed") // /articles/feed
    .get(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
        
          //Grab the user by the token
          const profilesQuery = await bucket
              .scope('blog')                               
              .query(`SELECT * FROM \`profiles\``, {
              })

            //Establish a usernames array to do the query 
              let userNames : string[] = [] //["dsfsdf"] //We need articles by 
              profilesQuery.rows.forEach((row) => {
                console.log("Article Feed Profiles Following", row.profiles)
            //if I am following a user, push that username into the usernames array
            if(row.profiles.following) userNames.push(row.profiles.username)
             })

             const articlesQuery = await bucket
             .scope('blog')                               
             .query(`SELECT * FROM \`articles\`;`, {
             })

     
             console.log("Article Feed Usernames Following", userNames)

             //   //deleteing extra articles key on object
                    let newArticles : Article[] = []
                    articlesQuery.rows.forEach((row) => {
            newArticles.push(row.articles)
            })
      

             let filteredArticles = newArticles.filter(document => userNames.includes(document.author.username))
            console.log("FILTERED ARTICLES", filteredArticles)
   
        return res.status(200).json(  {articles: filteredArticles, articlesCount: filteredArticles.length}   )
    }); 

router
    .route("/:slug") // /articles/feed
    .get(bodyParser.json(),verifyJWTOptional, async (req: Request, res: Response) => {
        
        var slug = req.params['slug'] 
   
    console.log("Slug :",slug);
        
        const articlesQuery = await bucket
        .scope('blog')                                //turn into template literal
        .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {
        })

        console.log("Articles", articlesQuery)
        let singleArticleFromQuery = articlesQuery.rows[0].articles
        console.log("Articles", singleArticleFromQuery)
        return res.status(200).json(  {article: singleArticleFromQuery}   )
        
    });
    
router
    .route("/:slug") // /articles/feed
    .put(bodyParser.json(),verifyJWT, async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 
   
        console.log("Slug :",slug);

            const userQuery = await bucket
            .scope('blog')                               
            .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
            })


            console.log("QUERY RESULT :", userQuery)
            let databaseUser = userQuery.rows[0].users

            const articlesQuery = await bucket
            .scope('blog')                               
            .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {
            })
    

            //Update Article 
            console.log("QUERY RESULT :", articlesQuery)
            let databaseArticle = articlesQuery.rows[0].articles
            console.log("DATABVASE ARTICLE:", databaseArticle)
            let inputData = req.body.article
            console.log("inputData", inputData)
        
            //Loop through the User request body and update the document object for each key inputted
            Object.keys(inputData).forEach(key => {
                databaseArticle[key] = inputData[key]
            });

            
            const getResult = await articlesCollection
            .replace(databaseUser.id, databaseArticle)  //rewrites the entire document, have to learn how "mutateIn" method works for optimization
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
                    
            let updateArticleResult = {"article" : await articlesCollection.get(databaseUser.id)}
          
            console.log('Update Article Result: ', updateArticleResult )
          
            const myArticleObject = updateArticleResult.article.content
            console.log(myArticleObject, "MY USER OBJECT AFTER REPLACE METHOD WITH TOKEN AND ID")
    
    
        return res.status(200).json(  {article: myArticleObject}   )
    }); 

router
    .route("/:slug") // /articles/feed
    .delete(bodyParser.json(),verifyJWT, async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 
   
        console.log("Slug :",slug);
    
            const userQuery = await bucket
            .scope('blog')                               
            .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
            })


            console.log("QUERY RESULT :", userQuery)
            let databaseUser = userQuery.rows[0].users

            const articlesQuery = await bucket
            .scope('blog')                                //turn into template literal
            .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {
            })


             let databaseArticle = articlesQuery.rows[0].articles
             console.log("Database Article", databaseArticle)
            const getResult = await articlesCollection
            .remove(databaseUser.id, databaseArticle)  //rewrites the entire document, have to learn how "mutateIn" method works for optimization
            .then((result: any) => {
                console.log("The Replace Works")
            })
            .catch((e: {message: any}) => {
                return res.status(500).send({
                message: `User Insert Failed: ${e.message}`,
                });
            });

            return res.status(200).json(  {article: databaseArticle}   )
        
    });

export default router