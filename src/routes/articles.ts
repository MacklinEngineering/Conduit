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
    .route("")
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

          const userQuery = await bucket
              .scope('blog')                               
              .query(`SELECT * FROM \`articles\`;`, {
              })

              let newArticles : Article[] = []
              userQuery.rows.forEach((row) => {
              newArticles.push(row.articles)
      })

      const articles: Articles = {
        articlesCount: userQuery.rows.length,
        articles: newArticles
      }
        
      return res.status(200).json(articles)
   
    });  

router
    .route("")
    .post(verifyJWT, bodyParser.json(), async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
          const userQuery = await bucket
              .scope('blog')                               
              .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
              })
     
       let databaseUser = userQuery["rows"][0].users
       let slug = req.body.article.title.replace(/ /g,'-')
       let date = new Date().toISOString()
       let favorited = false
       let favoritedCount = 0

        req.body.article.tagList.forEach((item) => {
            tagsMegaList.push(item)
      })
       
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
      .upsert(databaseUser.id, article) 
      .then(async (result: any) => {
        let articleResult = {"article" : await articlesCollection.get(databaseUser.id)}
          
        const myArticle = articleResult.article.content
                  return res.status(200).json({article : myArticle})
      })
      .catch((e: {message: any}) => {
          return res.status(500).send({
          message: `Article Upsert Failed: ${e.message}`,
          });
      });
              
    });

router
    .route("/feed")
    .get(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
        
          const profilesQuery = await bucket
              .scope('blog')                               
              .query(`SELECT * FROM \`profiles\``, {
              })

            //Establish a usernames array to do the query 
              let userNames : string[] = []  
              profilesQuery.rows.forEach((row) => {
            if(row.profiles.following) userNames.push(row.profiles.username)
             })

             const articlesQuery = await bucket
             .scope('blog')                               
             .query(`SELECT * FROM \`articles\`;`, {
             })

             //Delete extra articles key on object
                    let newArticles : Article[] = []
                    articlesQuery.rows.forEach((row) => {
            newArticles.push(row.articles)
            })
      
             let filteredArticles = newArticles.filter(document => userNames.includes(document.author.username))
   
        return res.status(200).json(  {articles: filteredArticles, articlesCount: filteredArticles.length}   )
    }); 

router
    .route("/:slug") 
    .get(bodyParser.json(),verifyJWTOptional, async (req: Request, res: Response) => {
        
        var slug = req.params['slug'] 
           
        const articlesQuery = await bucket
        .scope('blog')                                //turn into template literal
        .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {
        })

        let singleArticleFromQuery = articlesQuery.rows[0].articles
        return res.status(200).json(  {article: singleArticleFromQuery}   )
        
    });
    
router
    .route("/:slug") 
    .put(bodyParser.json(),verifyJWT, async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 
   
            const userQuery = await bucket
            .scope('blog')                               
            .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
            })

            let databaseUser = userQuery.rows[0].users

            const articlesQuery = await bucket
            .scope('blog')                               
            .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {
            })
    

            let databaseArticle = articlesQuery.rows[0].articles
            let inputData = req.body.article
        
            //Loop through the User request body and update the document object for each key inputted
            Object.keys(inputData).forEach(key => {
                databaseArticle[key] = inputData[key]
            });

            
            const getResult = await articlesCollection
            .replace(databaseUser.id, databaseArticle)
            .then(async (result: any) => {
                let updateArticleResult = {"article" : await articlesCollection.get(databaseUser.id)}
                    
            const myArticleObject = updateArticleResult.article.content    
    
        return res.status(200).json(  {article: myArticleObject}   )
            })
            .catch((e: {message: any}) => {
                return res.status(500).send({
                message: `User Insert Failed: ${e.message}`,
                });
            });
    }); 

router
    .route("/:slug") 
    .delete(bodyParser.json(),verifyJWT, async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 
       
            const userQuery = await bucket
            .scope('blog')                               
            .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
            })

            let databaseUser = userQuery.rows[0].users

            const articlesQuery = await bucket
            .scope('blog')                                //turn into template literal
            .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {
            })

             let databaseArticle = articlesQuery.rows[0].articles
            const getResult = await articlesCollection
            .remove(databaseUser.id, databaseArticle)  //rewrites the entire document, have to learn how "mutateIn" method works for optimization
            .then((result: any) => {
                return res.status(200).json(  {article: databaseArticle}   )
            })
            .catch((e: {message: any}) => {
                return res.status(500).send({
                message: `User Insert Failed: ${e.message}`,
                });
            });

        
    });

export default router