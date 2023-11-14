
// import {clusterConnStr, username, password, bucketName} from "../app"
import * as couchbase from 'couchbase';
//  const clusterConnStr = 'couchbases://cb.kduxtf3jgtvundi.cloud.couchbase.com'
//  const username = 'Admin1'
//  const password = 'Password1!'
//  const bucketName = 'Conduit1'
// import * as couchbase from 'couchbase';

 const clusterConnStr = 'couchbases://cb.v0wbkoon3f5oxbeh.cloud.couchbase.com'
 const capellaUsername = 'Admin1'
 const capellaPassword = 'Password1!'
 const bucketName = 'Conduit1'



export const connectCapella = async () => {
   const cluster = await couchbase.connect(clusterConnStr, {
    username: capellaUsername,
    password: capellaPassword,
    // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
    // when accessing Capella from a different Wide Area Network
    // or Availability Zone (e.g. your laptop).
    configProfile: 'wanDevelopment',
  })

 const bucket = cluster.bucket(bucketName)

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
    //  const cluster = await couchbase.connect(clusterConnStr, {
    //     username: username,
    //     password: password,
    //     // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
    //     // when accessing Capella from a different Wide Area Network
    //     // or Availability Zone (e.g. your laptop).
    //     configProfile: 'wanDevelopment',
    //   })
    
    //   // console.log("Here is the Cluster: ", cluster)
    //   const bucket = cluster.bucket(bucketName)
    //   // console.log("Here is the Bucket: ", bucket)
    //   // Get a reference to the default collection, required only for older Couchbase server versions
    //   // const defaultCollection = bucket.defaultCollection()
    
    //   const usersCollection = bucket.scope('_default').collection('users')
    //   const profilesCollection = bucket.scope('_default').collection('profiles')
    //   const articlesCollection = bucket.scope('_default').collection('articles')
    //   const commentsCollection = bucket.scope('_default').collection('comments')
    //   const favoritesCollection = bucket.scope('_default').collection('favorites')
    //   const tagsCollection = bucket.scope('_default').collection('tags')

    //   let couchbaseConnection = {
    //     cluster,
    //     bucket,
    //     // collection,
    //     usersCollection,
    //     profilesCollection,
    //     articlesCollection,
    //     commentsCollection,
    //     favoritesCollection,
    //     tagsCollection
    //   }

    //   let userEmail = await usersCollection.get(email)
    //   let user = await usersCollection.

      return couchbaseConnection;
}

connectCapella()

