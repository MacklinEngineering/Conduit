
// import {clusterConnStr, username, password, bucketName} from "../app"
import * as couchbase from 'couchbase';
export const clusterConnStr = 'couchbases://cb.kduxtf3jgtvundi.cloud.couchbase.com'
export const username = 'Admin1'
export const password = 'Password1!'
export const bucketName = 'Conduit1'



export const connectCapella = async () => {
     const cluster = await couchbase.connect(clusterConnStr, {
        username: username,
        password: password,
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
    
      const usersCollection = bucket.scope('_default').collection('users')
      const profilesCollection = bucket.scope('_default').collection('profiles')
      const articlesCollection = bucket.scope('_default').collection('articles')
      const commentsCollection = bucket.scope('_default').collection('comments')
      const favoritesCollection = bucket.scope('_default').collection('favorites')
      const tagsCollection = bucket.scope('_default').collection('tags')

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

    //   let userEmail = await usersCollection.get(email)
    //   let user = await usersCollection.

      return couchbaseConnection;
}

connectCapella()

