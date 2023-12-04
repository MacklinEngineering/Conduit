import express, {Request, Response} from 'express';
import * as couchbase from 'couchbase';
import bcrypt from 'bcryptjs';
import {v4} from 'uuid';
import {main} from "../app.js";
import bodyParser from 'body-parser';
import verifyJWT from "../verifyJWT.js"
import jwt from 'jsonwebtoken';
import {clusterConnStr,capellaUsername, capellaPassword , bucketName, cluster, bucket, usersCollection, profilesCollection, articlesCollection, commentsCollection, favoritesCollection, tagsCollection, couchbaseConnection} from "../db/plug.ts"

const SECRET = process.env.SECRET || "Mys3cr3tk3y"
​
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

router
    .route("") 
    .post(bodyParser.json(), async (req: Request, res: Response) => {
        const {user} = req.body
   
    const userPassword = bcrypt.hashSync( user.password, 10)
    const userId: string = v4()
    const users : Users = {
        username : user.username,
        email : user.email,
        password : userPassword,
        bio: "",
        image: "",
        token: "",
        id: userId
        }
​
        
        await usersCollection
        .upsert(userId, users)
        .then(async (result: any) => {          

        let getResult = {"user" : await usersCollection.get(userId)}
    
        const myUserObject = getResult.user.content

        return res.status(201).json({"user" : myUserObject})
        })
        .catch((e: {message: any}) => {
            return res.status(500).send({
            message: `User Insert Failed: ${e.message}`,
            });
        });

});
        
/**** 
 Description: Login a registered user 
 Route: /api/users/login
 Auth: NO
 Required fields: Email, password
 Response: returns a user
****/  
​
router
    .route("/login") 
    .post(bodyParser.json(), async (req: Request, res: Response, getResult) => {
        const accessToken = jwt.sign({
                "user": {
                    "email": req.body.user.email, 
                    "password": req.body.user.password,
                }
            },
            SECRET,
            { expiresIn: "1d"}
        );

        //Grab the user from the database
        const idResult = await bucket
            .scope('blog')
            .query(`SELECT * FROM \`users\` WHERE email='${req.body.user.email}';`, {
            })
          let idResult2 =  idResult.rows[0].users.id
            
          let passwordResult =  idResult.rows[0].users.password
           
        const users : Users = {
            username: '',
            email: req.body.user.email,
            password: passwordResult,
            bio: "",
            image: "",
            token: accessToken,
            id: idResult2  
        }
    
        await usersCollection
            .replace(users.id, users) 
            .then(async (result: any) => {
                let loggedInUserResult = {"user" : await usersCollection.get(users.id)}
        
    
                const myUserObject = loggedInUserResult.user.content
            
            const {user} = req.body
        
    ​       let loginUser = async function queryNamed() {
       
                const queryResult = await bucket
                .scope('blog')
                .query(`SELECT * FROM \`users\` WHERE email='${req.body.user.email}';`, {
                })
                
                return queryResult
                }
                
              loginUser()
              .then(res2 => { 
                    if (res2["rows"].length===0) {
                        return res.status(404).json({errors: { message: 'User Not Found' }});
                    }
                    let loggedInUserPassword = res2["rows"][0].users.password
    
                    res2["rows"]
                    .forEach(async (row: { loggedInUserPassword: string; }) => {
                                    const match = await bcrypt.compare(req.body.user.password, loggedInUserPassword);
                                    if (!match) {
                                        return res.status(401).json({errors: { message: 'Unauthorized: Wrong password' }})
                                    }else {
                                        const headers = { headers: { 'Authorization': 'Token ' + users.token } };
                                        return res.status(200).json({
                                            headers: headers,
                                            user: users
                                        });
                                        
                                    }
                ​
                               
                            }) 
                return
                 
    ​
            })            })
            .catch((e: {message: any}) => {
                return res.status(500).send({
                message: `User Insert Failed: ${e.message}`,
                });
            });
});

export default router














