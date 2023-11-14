import * as couchbase from 'couchbase';

export const clusterConnStr = 'couchbases://cb.v0wbkoon3f5oxbeh.cloud.couchbase.com'
export const capellaUsername = 'Admin1'
export const capellaPassword = 'Password1!'
export const bucketName = 'Conduit1'

export const cluster = await couchbase.connect(clusterConnStr, {
    username: capellaUsername,
    password: capellaPassword,
    // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
    // when accessing Capella from a different Wide Area Network
    // or Availability Zone (e.g. your laptop).
    configProfile: 'wanDevelopment',
  })

export const bucket = cluster.bucket(bucketName)

export const usersCollection = bucket.scope('blog').collection('users')
export const profilesCollection = bucket.scope('blog').collection('profiles')
export const articlesCollection = bucket.scope('blog').collection('articles')
export const commentsCollection = bucket.scope('blog').collection('comments')
export const favoritesCollection = bucket.scope('blog').collection('favorites')
export const tagsCollection = bucket.scope('blog').collection('tags')

export let couchbaseConnection = {
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