import bodyParser from 'body-parser';
import express, {Request, Response} from 'express';
import verifyJWTOptional from '../verifyJWTOptional';
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

 export interface Profile{
    username: string // "jake",
    bio: string; //"I work at statefarm",
    image: string; //"https://api.realworld.io/images/smiley-cyrus.jpg",
    following: boolean; //false
 }

router
    .route("") // /profiles/:username
    .get(verifyJWTOptional, bodyParser.json(), async (req: Request, res: Response) => {

    //     /* Takes in a username, returns a user profile 
    //     {
    //         "profile": {
    //             "username": "string",
    //             "bio": "string",
    //             "image": "string",
    //             "following": true
    //         }
    //     }
    //     */

        console.log(Object.keys(req))
        console.log(req.params)
    var username = req.params['username'] 
   
    console.log("Username :",username);

    
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
            .scope('blog')                                //turn into template literal
            .query(`SELECT * FROM \`users\` WHERE username='${username}';`, {
            })

            userQuery.rows.forEach((row) => {
    console.log("ROWS IN THE WORKING put /user QUERY", row)
    })

    console.log("QUERY RESULT :", userQuery)
    let databaseUser = userQuery.rows[0].users
    let following = false //default to false until a user clicks a button to press following - TODO, possibly also handle if self && logged in

    const profiles : Profile = {
        username : username,
        bio: databaseUser.bio,
        image: databaseUser.image,
        following: following 
        }
        await profilesCollection
        .upsert(databaseUser.id, profiles)
        .then((result: any) => {
            console.log("The PROFILE Upsert Works")
            // return res.send({...users, ...result});
        })
        .catch((e: {message: any}) => {
            return res.status(500).send({
            message: `User Insert Failed: ${e.message}`,
            });
        });

        //NOW Send this object up to the ProfilesCollection

        let getResult = {"profile" : await profilesCollection.get(databaseUser.id)}
    
        console.log('Get Result: ', getResult )

        const myProfileObject = getResult.profile.content
        console.log(myProfileObject, "MY PROFILE OBJECT")


        // GetResult {
        //     content: {
        //       username: 'celeb_u1692368603',
        //       email: 'celeb_u1692368603@mail.com',
        //       password: '$2a$10$URVT2ybrGldYDxXqo9rkEeBuD9p2gubgkZXoYjtJT0167r6Pmady2'
        //     },
          
        
        // res.send("hi /users")
        return res.status(200).json({"profile" : myProfileObject})


    //    const username = req.params
    //    const loggedin = req.loggedin;

    // const user = await User.findOne({ username }).catch(e => log.debug(e, "User not found"));

    // if (!user) {
    //     return res.status(404).json({
    //         message: "User Not Found"
    //     })
    // }
    // if (!loggedin) {
    //     return res.status(200).json({
    //         profile: user.toProfileJSON(false)
    //     });
    // } else {
    //     const loginUser = await User.findOne({ email: req.userEmail }).catch(e => log.debug(e, "User not found"));
    //     if (!loginUser) {
    //         return res.status(404).json({
    //             message: "User Not Found"
    //         })
    //     }
    //     return res.status(200).json({
    //         profile: user.toProfileJSON(loginUser)
    //     })
    // }

        // return res.send(console.log("Hello Get Profile"))
    })

router
    .route("/follow") // /users
    .post(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
        console.log("Inside POST /profiles/:username/follow endpoint")
        console.log(Object.keys(req))
        console.log(req.params)
    var username = req.params['username'] 
   
    console.log("Username :",username);
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
        .scope('blog')                                //turn into template literal
        .query(`SELECT * FROM \`users\` WHERE username='${username}';`, {
        })

        userQuery.rows.forEach((row) => {
console.log("ROWS IN THE WORKING put /user QUERY", row)
})

console.log("QUERY RESULT :", userQuery)
let databaseUser = userQuery.rows[0].users

let following = true

const profiles : Profile = {
    username : username,
    bio: databaseUser.bio,
    image: databaseUser.image,
    following: following //default to false until a user clicks a button to press following - TODO, possibly also handle if self && logged in
    }
    await profilesCollection
    .upsert(databaseUser.id, profiles)
    .then((result: any) => {
        console.log("The PROFILE Upsert Works")
        // return res.send({...users, ...result});
    })
    .catch((e: {message: any}) => {
        return res.status(500).send({
        message: `User Insert Failed: ${e.message}`,
        });
    });

    //NOW Send this object up to the ProfilesCollection

    let getResult = {"profile" : await profilesCollection.get(databaseUser.id)}

    console.log('Get Result: ', getResult )

    const myProfileObject = getResult.profile.content
    console.log(myProfileObject, "MY USER OBJECT")


    // GetResult {
    //     content: {
    //       username: 'celeb_u1692368603',
    //       email: 'celeb_u1692368603@mail.com',
    //       password: '$2a$10$URVT2ybrGldYDxXqo9rkEeBuD9p2gubgkZXoYjtJT0167r6Pmady2'
    //     },
      
    
    // res.send("hi /users")
    return res.status(200).json({"profile" : myProfileObject})
        // return res.send(console.log("Hello POST Profile"))

    })

router
    .route("/follow") // /users
    .delete(bodyParser.json(), verifyJWT, async (req: Request, res: Response) => {
        console.log("Inside DELETE /profiles/:username/follow endpoint")
        console.log(Object.keys(req))
        console.log(req.params)
        var username = req.params['username'] 
   
    console.log("Username :",username);
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
        .scope('blog')                                //turn into template literal
        .query(`SELECT * FROM \`users\` WHERE username='${username}';`, {
        })

        userQuery.rows.forEach((row) => {
console.log("ROWS IN THE WORKING put /user QUERY", row)
})

console.log("QUERY RESULT :", userQuery)
let databaseUser = userQuery.rows[0].users

let following = false

const profiles : Profile = {
    username : username,
    bio: databaseUser.bio,
    image: databaseUser.image,
    following: following //default to false until a user clicks a button to press following - TODO, possibly also handle if self && logged in
    }
    await profilesCollection
    .upsert(databaseUser.id, profiles)
    .then((result: any) => {
        console.log("The PROFILE Upsert Works")
        // return res.send({...users, ...result});
    })
    .catch((e: {message: any}) => {
        return res.status(500).send({
        message: `User Insert Failed: ${e.message}`,
        });
    });

    //NOW Send this object up to the ProfilesCollection

    let getResult = {"profile" : await profilesCollection.get(databaseUser.id)}

    console.log('Get Result: ', getResult )

    const myProfileObject = getResult.profile.content
    console.log(myProfileObject, "MY USER OBJECT")


    // GetResult {
    //     content: {
    //       username: 'celeb_u1692368603',
    //       email: 'celeb_u1692368603@mail.com',
    //       password: '$2a$10$URVT2ybrGldYDxXqo9rkEeBuD9p2gubgkZXoYjtJT0167r6Pmady2'
    //     },
      
    
    // res.send("hi /users")
    return res.status(200).json({"profile" : myProfileObject})
        // return res.send(console.log("Hello POST Profile"))

        // return res.send(console.log("Hello Delete Profile"))
    })

export default router