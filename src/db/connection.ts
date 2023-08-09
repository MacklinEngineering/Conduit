import * as couchbase from 'couchbase'
import {cache} from './cache'

const CB_USER = process.env.CB_USER
const CB_PASS = process.env.CB_PASS
const CB_URL = process.env.CB_URL
const CB_BUCKET = process.env.CB_BUCKET
const IS_CAPELLA = process.env.IS_CAPELLA

if (!CB_USER) {
  throw new Error(
      'Please define the CB_USER environment variable inside dev.env'
  )
}

if (!CB_PASS) {
  throw new Error(
      'Please define the CB_PASS environment variable inside dev.env'
  )
}

if (!CB_URL) {
  throw new Error(
      'Please define the CB_URL environment variable inside dev.env'
  )
}

if (!CB_BUCKET) {
  throw new Error(
      'Please define the CB_BUCKET environment variable inside dev.env'
  )
}

if (!IS_CAPELLA) {
  throw new Error(
      'Please define the IS_CAPELLA environment variable inside dev.env. \nSet to \`true\` if you are connecting to a Capella cluster, and \`false\` otherwise.\n'
  )
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
console.log("hi")
let cached = cache.get('couchbase')

if (!cached) {
  cache.set('couchbase',  { conn: null })
  cached =cache.get('couchbase')
}
console.log("before createCouchbaseCluster")
console.log(IS_CAPELLA)
async function createCouchbaseCluster() {
  console.log("createCouchbaseCluster")
  if (cached.conn) {
    return cached.conn
  }
  console.log(IS_CAPELLA)
  if (IS_CAPELLA === 'true') {
    // Capella requires TLS connection string but we'll skip certificate verification with `tls_verify=none`

    try {
      // cached.conn = await couchbase.connect('couchbases://' + CB_URL + '?tls_verify=none', {
      cached.conn = await couchbase.connect("couchbases://cb.kduxtf3jgtvundi.cloud.couchbase.com?tls_verify=none",{
      username: CB_USER,
      password: CB_PASS,
    })
    } catch (error) {
      console.log("ERROR HOE", error)
    }
  } else {
    // no TLS needed, use traditional connection string
    // cached.conn = await couchbase.connect('couchbase://' + CB_URL, {
      cached.conn = await couchbase.connect('couchbases://cb.kduxtf3jgtvundi.cloud.couchbase.com', {
      username: CB_USER,
      password: CB_PASS,
    })
  }

  return cached.conn
}

export async function connectToDatabase() {
  console.log("I got into createCouchbaseCluster")
  const cluster = await createCouchbaseCluster()
  console.log("This is the cluster, ", cluster)
  const bucket = cluster.bucket(CB_BUCKET);
  const collection = bucket.defaultCollection();
  const usersCollection = bucket.collection('users');
  const profileCollection = bucket.collection('profile');
  const articleCollection = bucket.collection('article');
  const commentCollection = bucket.collection('comment');

  let dbConnection = {
    cluster,
    bucket,
    collection,
    usersCollection,
    profileCollection,
    articleCollection,
    commentCollection
  }

  return dbConnection;
}

createCouchbaseCluster()
connectToDatabase()



