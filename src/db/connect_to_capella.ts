import * as couchbase from "couchbase";

const clusterConnStr = "couchbases://cb.kduxtf3jgtvundi.cloud.couchbase.com";
const capellaUsername = "Admin1";
const capellaPassword = "Password1!";
const bucketName = "Conduit1";

export const connectCapella = async () => {
  const cluster = await couchbase.connect(clusterConnStr, {
    username: capellaUsername,
    password: capellaPassword,
    // Sets a pre-configured profile called "wanDevelopment" to help avoid latency issues
    // when accessing Capella from a different Wide Area Network
    // or Availability Zone (e.g. your laptop).
    configProfile: "wanDevelopment",
  });

  const bucket = cluster.bucket(bucketName);

  const usersCollection = bucket.scope("blog").collection("users");
  const profilesCollection = bucket.scope("blog").collection("profiles");
  const articlesCollection = bucket.scope("blog").collection("articles");
  const commentsCollection = bucket.scope("blog").collection("comments");
  const favoritesCollection = bucket.scope("blog").collection("favorites");
  const tagsCollection = bucket.scope("blog").collection("tags");

  let couchbaseConnection = {
    cluster,
    bucket,
    usersCollection,
    profilesCollection,
    articlesCollection,
    commentsCollection,
    favoritesCollection,
    tagsCollection,
  };
  return couchbaseConnection;
};

connectCapella();
