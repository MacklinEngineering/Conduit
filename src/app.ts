import express, {Request, Response} from 'express';
import bcrypt from 'bcryptjs';
import {v4} from 'uuid';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import * as couchbase from 'couchbase';

import {connectToDatabase} from './db/connection';

const swaggerDocument = YAML.load('./swagger.yaml');

export const app = express();
console.log("app is running")
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/swagger-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/', (req: any, res: {send: (arg0: string) => void}) => {
  res.send(
    '<body onload="window.location = \'/swagger-ui/\'"><a href="/swagger-ui/">Click here to see the API</a>'
  );
});

export const ensureIndexes = async () => {
  const {cluster} = await connectToDatabase();

  const bucketIndex = `CREATE PRIMARY INDEX ON ${process.env.CB_BUCKET}`;
  const profileCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.profile;`;
  const articleCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.article;`;
  const commentCollectionIndex = `CREATE PRIMARY INDEX ON default:${process.env.CB_BUCKET}._default.comment;`;

  try {
    await cluster.query(bucketIndex);
    console.log('Bucket Index Creation: SUCCESS');
  } catch (err) {
    if (err instanceof couchbase.IndexExistsError) {
      console.info('Bucket Index Creation: Index Already Exists');
    } else {
      console.error(err);
    }
  }

  try {
    await cluster.query(profileCollectionIndex);
    console.log('Collection Index Creation: SUCCESS');
  } catch (err) {
    if (err instanceof couchbase.IndexExistsError) {
      console.info('Collection Index Creation: Index Already Exists');
    } else if (err instanceof couchbase.PlanningFailureError) {
      console.info(
        'Collection Index Creation: Profile Collection Not Found. Ensure collection `profile` exists.'
      );
    } else {
      console.log(err);
    }
  }
};

app.post('/profile', async (req: Request, res: Response) => {
  console.log("Hitting profile endpoint")
  const {profileCollection} = await connectToDatabase();
  console.log(profileCollection, "PROFILE COLLECTION")
  if (!req.body.email || !req.body.pass) {
    return res.status(400).send({
      message: `${!req.body.email ? 'email ' : ''}${
        !req.body.email && !req.body.pass
          ? 'and pass are required'
          : req.body.email && !req.body.pass
          ? 'pass is required'
          : 'is required'
      }`,
    });
  }

  const id = v4();
  const profile = {
    pid: id,
    ...req.body,
    pass: bcrypt.hashSync(req.body.pass, 10),
  };
  console.log(profile, "PROFILE")

  await profileCollection
    .insert(id, profile)
    .then((result: any) => {
      return res.send({...profile, ...result});
    })
    .catch((e: {message: any}) => {
      return res.status(500).send({
        message: `Profile Insert Failed: ${e.message}`,
      });
    });

    return res.send()
    // // return res.status(500)
    // return res.status(500).send({
    //   message: `Something went wrong}`,
    // });
});

app.get('/profile/:pid', async (req: Request, res: Response) => {
  const {profileCollection} = await connectToDatabase();
  try {
    await profileCollection
      .get(req.params.pid)
      .then((result: {value: any}) => res.send(result.value))
      .catch((error: {message: any}) =>
        res.status(500).send({
          message: `KV Operation Failed: ${error.message}`,
        })
      );
  } catch (error) {
    console.error(error);
  }
});

app.put('/profile/:pid', async (req: Request, res: Response) => {
  const {profileCollection} = await connectToDatabase();
  try {
    await profileCollection
      .get(req.params.pid)
      .then(
        async (result: {
          value: {
            pid: any;
            firstName: any;
            lastName: any;
            email: any;
            pass: any;
          };
        }) => {
          /* Create a New Document with new values,
          if they are not passed from request, use existing values */
          const newDoc = {
            pid: result.value.pid,
            firstName: req.body.firstName
              ? req.body.firstName
              : result.value.firstName,
            lastName: req.body.lastName
              ? req.body.lastName
              : result.value.lastName,
            email: req.body.email ? req.body.email : result.value.email,
            pass: req.body.pass
              ? bcrypt.hashSync(req.body.pass, 10)
              : result.value.pass,
          };
          /* Persist updates with new doc */
          await profileCollection
            .upsert(req.params.pid, newDoc)
            .then((result: any) => res.send({...newDoc, ...result}))
            .catch((e: any) => res.status(500).send(e));
        }
      )
      .catch((e: {message: any}) =>
        res.status(500).send({
          message: `Profile Not Found, cannot update: ${e.message}`,
        })
      );
  } catch (e) {
    console.error(e);
  }
});

app.delete('/profile/:pid', async (req: Request, res: Response) => {
  const {profileCollection} = await connectToDatabase();
  try {
    await profileCollection
      .remove(req.params.pid)
      .then((result: {value: any}) => res.send(result.value))
      .catch((error: {message: any}) =>
        res.status(500).send({
          message: `Profile Not Found, cannot delete: ${error.message}`,
        })
      );
  } catch (e) {
    console.error(e);
  }
});

app.get('/profiles', async (req: Request, res: Response) => {
  const {cluster} = await connectToDatabase();
  try {
    const options = {
      parameters: {
        SKIP: Number(req.query.skip || 0),
        LIMIT: Number(req.query.limit || 5),
        SEARCH: `%${req.query.search?.toString().toLowerCase()}%`,
      },
    };
    console.log("options ", options)
    const query = `
       SELECT p.*
       FROM ${process.env.CB_BUCKET}._default.profile
       WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH`
    // const query = `
    //   SELECT p.*
    //   FROM ${process.env.CB_BUCKET}._default.profile p
    //   WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH
    //   LIMIT $LIMIT OFFSET $SKIP;
    // `;
    console.log("cluster.query ", cluster.query)
    await cluster
      .query(query, options)
      .then((result: {rows: any}) => res.send(result.rows))
      .catch((error: {message: any}) =>
        res.status(500).send({
          message: `Query failed: ${error.message}`,
        })
      );
  } catch (e) {
    console.error(e);
  }
});

app.post('/profile/{pid}/article/{aid}', async (req: Request, res: Response) => {
  const {articleCollection} = await connectToDatabase();
  if (!req.body.email || !req.body.pass) {
    return res.status(400).send({
      message: `${!req.body.email ? 'email ' : ''}${
        !req.body.email && !req.body.pass
          ? 'and pass are required'
          : req.body.email && !req.body.pass
          ? 'pass is required'
          : 'is required'
      }`,
    });
  }

  const id = v4();
  const profile = {
    pid: id,
    ...req.body,
    pass: bcrypt.hashSync(req.body.pass, 10),
  };
  await articleCollection
    .insert(id, profile)
    .then((result: any) => {return res.send({...profile, ...result})})
    .catch((e: {message: any}) =>
      {return res.status(500).send({
        message: `Profile Insert Failed: ${e.message}`,
      })}
    );
    return res.status(500).send({
      message: `something went wrong`,
    })
});

app.get('/profile/article/:aid', async (req: Request, res: Response) => {
  const {articleCollection} = await connectToDatabase();
  try {
    await articleCollection
      .get(req.params.pid)
      .then((result: {value: any}) => res.send(result.value))
      .catch((error: {message: any}) =>
        res.status(500).send({
          message: `KV Operation Failed: ${error.message}`,
        })
      );
  } catch (error) {
    console.error(error);
  }
});

app.put('/profile/article/:aid', async (req: Request, res: Response) => {
  const {articleCollection} = await connectToDatabase();
  try {
    await articleCollection
      .get(req.params.pid)
      .then(
        async (result: {
          value: {
            pid: any;
            firstName: any;
            lastName: any;
            email: any;
            pass: any;
          };
        }) => {
          /* Create a New Document with new values,
          if they are not passed from request, use existing values */
          const newDoc = {
            pid: result.value.pid,
            firstName: req.body.firstName
              ? req.body.firstName
              : result.value.firstName,
            lastName: req.body.lastName
              ? req.body.lastName
              : result.value.lastName,
            email: req.body.email ? req.body.email : result.value.email,
            pass: req.body.pass
              ? bcrypt.hashSync(req.body.pass, 10)
              : result.value.pass,
          };
          /* Persist updates with new doc */
          await articleCollection
            .upsert(req.params.pid, newDoc)
            .then((result: any) => res.send({...newDoc, ...result}))
            .catch((e: any) => res.status(500).send(e));
        }
      )
      .catch((e: {message: any}) =>
        res.status(500).send({
          message: `Profile Not Found, cannot update: ${e.message}`,
        })
      );
  } catch (e) {
    console.error(e);
  }
});

app.delete('/profile/article/:aid', async (req: Request, res: Response) => {
  const {articleCollection} = await connectToDatabase();
  try {
    await articleCollection
      .remove(req.params.pid)
      .then((result: {value: any}) => res.send(result.value))
      .catch((error: {message: any}) =>
        res.status(500).send({
          message: `Profile Not Found, cannot delete: ${error.message}`,
        })
      );
  } catch (e) {
    console.error(e);
  }
});

app.get('/profile/articles', async (req: Request, res: Response) => {
  const {cluster} = await connectToDatabase();
  try {
    const options = {
      parameters: {
        SKIP: Number(req.query.skip || 0),
        LIMIT: Number(req.query.limit || 5),
        SEARCH: `%${req.query.search?.toString().toLowerCase()}%`,
      },
    };
    const query = `
      SELECT p.*
      FROM ${process.env.CB_BUCKET}._default.profile.comments p
      WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH
      LIMIT $LIMIT OFFSET $SKIP;
    `;
    await cluster
      .query(query, options)
      .then((result: {rows: any}) => res.send(result.rows))
      .catch((error: {message: any}) =>
        res.status(500).send({
          message: `Query failed: ${error.message}`,
        })
      );
  } catch (e) {
    console.error(e);
  }
});

app.post('/profile/article/comment', async (req: Request, res: Response) => {
  const {commentCollection} = await connectToDatabase();
  if (!req.body.email || !req.body.pass) {
    return res.status(400).send({
      message: `${!req.body.email ? 'email ' : ''}${
        !req.body.email && !req.body.pass
          ? 'and pass are required'
          : req.body.email && !req.body.pass
          ? 'pass is required'
          : 'is required'
      }`,
    });
  }

  const id = v4();
  const profile = {
    pid: id,
    ...req.body,
    pass: bcrypt.hashSync(req.body.pass, 10),
  };
  await commentCollection
    .insert(id, profile)
    .then((result: any) => {return res.send({...profile, ...result})})
    .catch((e: {message: any}) =>
      {return res.status(500).send({
        message: `Profile Insert Failed: ${e.message}`,
      })}
    );
    return res.status(500).send({
      message: `Something went wrong`,
    })
});

app.get('/profile/article/:aid', async (req: Request, res: Response) => {
  const {commentCollection} = await connectToDatabase();
  try {
    await commentCollection
      .get(req.params.pid)
      .then((result: {value: any}) => res.send(result.value))
      .catch((error: {message: any}) =>
        res.status(500).send({
          message: `KV Operation Failed: ${error.message}`,
        })
      );
  } catch (error) {
    console.error(error);
  }
});

app.put('/profile/article/:aid', async (req: Request, res: Response) => {
  const {commentCollection} = await connectToDatabase();
  try {
    await commentCollection
      .get(req.params.pid)
      .then(
        async (result: {
          value: {
            pid: any;
            firstName: any;
            lastName: any;
            email: any;
            pass: any;
          };
        }) => {
          /* Create a New Document with new values,
          if they are not passed from request, use existing values */
          const newDoc = {
            pid: result.value.pid,
            firstName: req.body.firstName
              ? req.body.firstName
              : result.value.firstName,
            lastName: req.body.lastName
              ? req.body.lastName
              : result.value.lastName,
            email: req.body.email ? req.body.email : result.value.email,
            pass: req.body.pass
              ? bcrypt.hashSync(req.body.pass, 10)
              : result.value.pass,
          };
          /* Persist updates with new doc */
          await commentCollection
            .upsert(req.params.pid, newDoc)
            .then((result: any) => res.send({...newDoc, ...result}))
            .catch((e: any) => res.status(500).send(e));
        }
      )
      .catch((e: {message: any}) =>
        res.status(500).send({
          message: `Profile Not Found, cannot update: ${e.message}`,
        })
      );
  } catch (e) {
    console.error(e);
  }
});

app.delete('/profile/article/:aid', async (req: Request, res: Response) => {
  const {commentCollection} = await connectToDatabase();
  try {
    await commentCollection
      .remove(req.params.pid)
      .then((result: {value: any}) => res.send(result.value))
      .catch((error: {message: any}) =>
        res.status(500).send({
          message: `Profile Not Found, cannot delete: ${error.message}`,
        })
      );
  } catch (e) {
    console.error(e);
  }
});

app.get('/profile/article/comment', async (req: Request, res: Response) => {
  const {cluster} = await connectToDatabase();
  try {
    const options = {
      parameters: {
        SKIP: Number(req.query.skip || 0),
        LIMIT: Number(req.query.limit || 5),
        SEARCH: `%${req.query.search?.toString().toLowerCase()}%`,
      },
    };
    const query = `
      SELECT p.*
      FROM ${process.env.CB_BUCKET}._default.profile.comments p
      WHERE lower(p.firstName) LIKE $SEARCH OR lower(p.lastName) LIKE $SEARCH
      LIMIT $LIMIT OFFSET $SKIP;
    `;
    await cluster
      .query(query, options)
      .then((result: {rows: any}) => res.send(result.rows))
      .catch((error: {message: any}) =>
        res.status(500).send({
          message: `Query failed: ${error.message}`,
        })
      );
  } catch (e) {
    console.error(e);
  }
});

const port = parseInt(process.env.APP_PORT || '') || 3000;

app.listen(port)

module.exports = {app, ensureIndexes};
