import bodyParser from 'body-parser';
import express, {Request, Response} from 'express';
import { tagsMegaList, Article } from './articles';
import * as couchbase from 'couchbase';

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

//  export interface Tags {
//     tags: 
//  }

 // import * as couchbase from 'couchbase';
 export const clusterConnStr = 'couchbases://cb.yfxtafw9ud1ccllx.cloud.couchbase.com'
 export const capellaUsername = 'Admin1'
 export const capellaPassword = 'Password1!'
 export const bucketName = 'ConduitDemo'

router
    .route("") // /users
    .get(bodyParser.json(), async (req: Request, res: Response) => {
        //Searches through articles and takes all tags and appends to massive tags array
        //returns that array of tags
        console.log(tagsMegaList)
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
          
        //Get ALL Articles
        const articlesQuery = await bucket
              .scope('blog')                               
              .query(`SELECT * FROM \`articles\` WHERE tagList!='';`, {
              })
                
              
                // const array1 = ['a', 'b', 'c'];
                // const iterator = array1.values();

                // for (const value of iterator) {
                // console.log(value);
                // }

                
        articlesQuery["rows"].forEach((row) => tagsMegaList.push(row.articles.tagList))
        console.log(tagsMegaList.values())
        // console.log(tagsMegaList)

        

        return res.status(200).json(  {tags: tagsMegaList}   )
    })

export default router