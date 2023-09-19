import bodyParser from 'body-parser';
import express, {Request, Response} from 'express';
import * as couchbase from 'couchbase';
import verifyJWTOptional from '../verifyJWTOptional';
import verifyJWT from '../verifyJWT';
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
//  let articles = []
 // import * as couchbase from 'couchbase';
 export const clusterConnStr = 'couchbases://cb.yfxtafw9ud1ccllx.cloud.couchbase.com'
 export const capellaUsername = 'Admin1'
 export const capellaPassword = 'Password1!'
 export const bucketName = 'ConduitDemo'

//  export interface Users {
//     username : string ;
//     email : string;
//     password :string;
//     bio: string;
//     image: string;
//     token: string;
//     id: string;
//  }

export interface Articles {
    articles: Article[]; //I THINK this works, saying Articles is an ARRAY of article
    articlesCount: number;
}
//  export interface Article{
     export interface Article{
    
      slug: string; //"how-to-train-your-dragon",
      title: string; //"How to train your dragon",
      description: string; //"Ever wonder how?",
      body: string; //"It takes a Jacobian",
      tagList: string[]; //["dragons", "training"],
      createdAt: string, //"2016-02-18T03:22:56.637Z",
      updatedAt: string; //"2016-02-18T03:48:35.824Z",
      favorited: boolean; //false,
      favoritesCount: number; //0,
      author: Author; //specifically the PROFILE (not user) object
  }
  export interface Author{
        username: string; // "jake",
        bio: string; //"I work at statefarm",
        image:string; // "https://i.stack.imgur.com/xHWG8.jpg",
        following: boolean; //false
  }
  
  export let tagsMegaList: string[] = []
       
  
 
router
    .route("") // /articles
    .get(bodyParser.json(), verifyJWTOptional,  async (req: Request, res: Response) => {
        // const token = req.header("authorization")?.replace("Token ","")
        const author = req.query.author
       
        console.log(author)
        console.log("Got into /articles")
        let limit = 20;
        let offset = 0;
        let query = {};
        if (req.query.limit) {
            let limit = req.query.limit;
        }
    
        if (req.query.offset) {
            let offset = req.query.offset;
        }
        
    
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
          
          //Search if there are any articles at all - return up to 20 of them
         
          //Also, if user enters a param, search any articles by that username


          //Might not need to run a query for the user
          const userQuery = await bucket
              .scope('blog')                               
              .query(`SELECT * FROM \`articles\`;`, {
              })

            //deleteing extra articles key on object
              let newArticles : Article[] = []
              userQuery.rows.forEach((row) => {
    //   console.log("ROWS IN THE WORKING put /articles QUERY", row)
      newArticles.push(row.articles)
      })
  
      console.log("QUERY RESULT GET ARTICLES :", newArticles)
      if (req.query.tagList) {
        // tagList = [ 'training', 'dragons' ]
        // let filteredArticles = newArticles.filter(document => tagList.includes(document.author.username)
        // newArticles.filter("")
        //TODO: NEED TO FIX
        // let query[`"${req.query.tag}"`] = { $in: { $field: 'tagList' } }
        // query.tagList = { $in: [req.query.tag] } // Works with
    }

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
        // let limit = 20;
        // let offset = 0;
        // let query = {};
        // if (req.query.limit) {
        //     let limit = req.query.limit;
        // }
    
        // if (req.query.offset) {
        //     let offset = req.query.offset;
        // }
        // if (req.query.tag) {
        //     //TODO: NEED TO FIX
        //     // let query[`"${req.query.tag}"`] = { $in: { $field: 'tagList' } }
        //     // query.tagList = { $in: [req.query.tag] } // Works with
        // }
    
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

  
      console.log("QUERY RESULT POST:", userQuery["rows"])
    //   let userId =  userQuery.rows[0].users.id
    //   let userToken =  userQuery.rows[0].users.token

       //Create an Article
       console.log(req.body)
       let databaseUser = userQuery["rows"][0].users
       let slug = req.body.article.title.replace(/ /g,'-')
       let date = new Date().toISOString()
       let favorited = false
       let favoritedCount = 0

         
        //  Object.keys(inputData).forEach(key => {
        //     databaseUser[key] = inputData[key]
        //   });

        // var keys = Object.keys(data);

        // keys.forEach(function(key) {
        // console.log(data[key].Name[0], 'on root key', key);
        // });


        ///TODO: ISSUE - TAGS LIST FOR TAGS ONLY YOU HAVE MADE - NOT EVERY USER :()
        req.body.article.tagList.forEach((item) => {
            tagsMegaList.push(item)
      })
      console.log("MEGA LIST OF TAGS:", tagsMegaList)
        // var values = Object.values(req.body.article.tagList);

        // values.forEach(function(key) {
        // // console.log(req.body.article.tagList[key].Name[0], 'on root key', key);
        // tagsMegaList.push(values)
        // });
    //    tagsMegaList.push(req.body.article.tagList)
      
      

       const article: Article = {
        slug: slug, //"how-to-train-your-dragon",
        title: req.body.article.title, //"How to train your dragon",
        description: req.body.article.description, //"Ever wonder how?",
        body: req.body.article.body, //"It takes a Jacobian",
        tagList: req.body.article.tagList, //["dragons", "training"],
        createdAt: date, //"2016-02-18T03:22:56.637Z",
        updatedAt: date, //"2016-02-18T03:48:35.824Z", //set at date, OR, take timestamp when updated via PUT
        favorited: favorited, //false,
        favoritesCount: favoritedCount, //0,
        author: { 
            username: databaseUser.username, // "jake",
            bio: databaseUser.bio, //"I work at statefarm",
            image: databaseUser.image, // "https://i.stack.imgur.com/xHWG8.jpg",
            following: false, //false}, //Profile info inserted here
        }
      }
      
    //   console.log(articles, "ARTICLES")

      /*******
       * 
       * To Order my articles use ORDER BY createdAt
       * 
       * 
       * 
       * 
       */
      const bucketIndex = ​`CREATE PRIMARY INDEX ON default:ConduitDemo.blog.articles`   
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
        
      //TODO: Requires refactor to programmatically add to user nested object 
    
      let articleResult = {"article" : await articlesCollection.get(databaseUser.id)}
    
      console.log('Create Article Result: ', articleResult )
    
      const myArticle = articleResult.article.content
      console.log(myArticle, "MY ARTICLE")
                return res.status(200).json({article : myArticle})
                // return res.status(200).json({articles : myArticle}) //START HERE MONDAY SEPT 18
        // return res.send(console.log("Hello"))
    });

router
    .route("/feed") // /articles/feed
    .get(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
        //PResents ONLY articles where following = true
        //Query the database for articles


        /*******
         * LOGIC VERSION
         * GET ALL THE PROFILES WHERE FOLLIWNG = TRUE
         * LIST ALL THEIR ARTICLES 
         * 
         * 
         */
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

          //Search if there are any articles at all - return up to 20 of them
         
          //Also, if user enters a param, search any articles by that username


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

     
             console.log("Article Feed Profiles Following", userNames)

             //   //deleteing extra articles key on object
                    let newArticles : Article[] = []
                    articlesQuery.rows.forEach((row) => {
            //   console.log("ROWS IN THE WORKING put /articles QUERY", row)
            newArticles.push(row.articles)
            })
      

             let filteredArticles = newArticles.filter(document => userNames.includes(document.author.username))
            console.log("FILTERED ARTICLES", filteredArticles)
    // //   console.log(userQuery["rows"].filter(document => document.following ===true))
    //   const followingUsers = userQuery["rows"].filter(document => document.following ===true)
    //   followingUsers

        // return res.send(following)
        return res.status(200).json(  {articles: filteredArticles, articlesCount: filteredArticles.length}   )
    }); 

router
    .route("/:slug") // /articles/feed
    .get(bodyParser.json(),verifyJWTOptional, async (req: Request, res: Response) => {
        //Take in req.param
        var slug = req.params['slug'] 
   
    console.log("Slug :",slug);
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
    
        const bucketIndex = ​`CREATE PRIMARY INDEX ON default:ConduitDemo.blog.profiles`   
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
        const articlesQuery = await bucket
        .scope('blog')                                //turn into template literal
        .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {
        })

        console.log("Articles", articlesQuery)
        let singleArticleFromQuery = articlesQuery.rows[0].articles
        console.log("Articles", singleArticleFromQuery)
        return res.status(200).json(  {article: singleArticleFromQuery}   )



        // userQuery.rows.forEach((row) => {
        //     console.log("ROWS IN THE WORKING put /user QUERY", row)
        //     })
        
        //     console.log("QUERY RESULT :", userQuery)
        //     let databaseUser = userQuery.rows[0].users
        //     let following = false //default to false until a user clicks a button to press following - TODO, possibly also handle if self && logged in
        
        //     const profiles : Profile = {
        //         username : username,
        //         bio: databaseUser.bio,
        //         image: databaseUser.image,
        //         following: following 
        //         }
        //         await profilesCollection
        //         .upsert(databaseUser.id, profiles)
        //         .then((result: any) => {
        //             console.log("The PROFILE Upsert Works")
        //             // return res.send({...users, ...result});
        //         })
        //         .catch((e: {message: any}) => {
        //             return res.status(500).send({
        //             message: `User Insert Failed: ${e.message}`,
        //             });
        //         });
        
        //         //NOW Send this object up to the ProfilesCollection
        
        //         let getResult = {"profile" : await profilesCollection.get(databaseUser.id)}
            
        //         console.log('Get Result: ', getResult )
        
        //         const myProfileObject = getResult.profile.content
        //         console.log(myProfileObject, "MY USER OBJECT")
        
        //Search articles database for articles.slug
        
    });
    
router
    .route("/:slug") // /articles/feed
    .put(bodyParser.json(),verifyJWT, async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 
   
        console.log("Slug :",slug);
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
            .scope('blog')                               
            .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
            })

            //         userQuery.rows.forEach((row) => {
            // console.log("ROWS IN THE WORKING put /user QUERY", row)
            // })

            console.log("QUERY RESULT :", userQuery)
            let databaseUser = userQuery.rows[0].users

            const articlesQuery = await bucket
            .scope('blog')                               
            .query(`SELECT * FROM \`articles\` WHERE slug='${slug}';`, {
            })
    
            // console.log("Articles", articlesQuery)
            // let singleArticleFromQuery = articlesQuery.rows[0].articles
            // console.log("Articles", singleArticleFromQuery)

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
          
          
            //TODO: Requires refactor to programmatically add to user nested object 
          
            let updateArticleResult = {"article" : await articlesCollection.get(databaseUser.id)}
          
            console.log('Update Article Result: ', updateArticleResult )
          
            const myArticleObject = updateArticleResult.article.content
            console.log(myArticleObject, "MY USER OBJECT AFTER REPLACE METHOD WITH TOKEN AND ID")
    
    
        return res.status(200).json(  {article: myArticleObject}   )
        // return res.send(console.log("Hello Put Article Slug"))
    }); 

router
    .route("/:slug") // /articles/feed
    .delete(bodyParser.json(),verifyJWT, async (req: Request, res: Response) => {
        const token = req.header("authorization")?.replace("Token ","")
        var slug = req.params['slug'] 
   
        console.log("Slug :",slug);
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
        
            const bucketIndex = ​`CREATE PRIMARY INDEX ON default:ConduitDemo.blog.profiles`   
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

            const userQuery = await bucket
            .scope('blog')                               
            .query(`SELECT * FROM \`users\` WHERE token='${token}';`, {
            })

            //         userQuery.rows.forEach((row) => {
            // console.log("ROWS IN THE WORKING put /user QUERY", row)
            // })

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

            // console.log("Articles", articlesQuery)
            // let singleArticleFromQuery = articlesQuery.rows[0].articles
            // console.log("Articles", singleArticleFromQuery)
            return res.status(200).json(  {article: databaseArticle}   )
        
    });

export default router