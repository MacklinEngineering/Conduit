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
    .route("") // /users
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
        console.log(users, "USERS")
        
        await usersCollection
        .upsert(userId, users)
        .then(async (result: any) => {
            console.log("The Upsert Works")
            // Load the Document and print it
            // Prints Content and Metadata of the stored Document
            //TODO: Requires refactor to programmatically add to user nested object 

        let getResult = {"user" : await usersCollection.get(userId)}
    
        console.log('Get Result: ', getResult )

        const myUserObject = getResult.user.content
        console.log(myUserObject, "MY USER OBJECT")

        return res.status(201).json({"user" : myUserObject})
        })
        .catch((e: {message: any}) => {
            return res.status(500).send({
            message: `User Insert Failed: ${e.message}`,
            });
        });

});
        
        
       

​
  
                
​
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
        console.log("Hello inside login")
    console.log("RESUEST, ", req.body) //only has email and password inside 
    

​
        const accessToken = jwt.sign({
                "user": {
                    // "id": this.id,
                    "email": req.body.user.email, //this.email,
                    "password": req.body.user.password,//this.password
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
            
            console.log("ID RESULT2", idResult2)

            // GEt the password from the database and input into the new document 

            
          let passwordResult =  idResult.rows[0].users.password
            //place ID in new user object
           
        const users : Users = {
            // username : username,
            username: '', //TODO: GRAB THE USERNAME FROM CB OR OLD RESPONSE
            email: req.body.user.email,
            password: passwordResult,
            bio: "",
            image: "",
            token: accessToken,
            id: idResult2 //why did I re-add? What did I need this for? 
                            //Maybe to use to replace the user object with th enew one with a token 
        }
        console.log("USERS in login", users)
    
        await usersCollection
            .replace(users.id, users)  //rewrites the entire document, have to learn how "mutateIn" method works for optimization
            // .upsert(users.id, users )
            .then((result: any) => {
                console.log("The Replace Works")
                // return res.send({...users, ...result});
            })
            .catch((e: {message: any}) => {
                return res.status(500).send({
                message: `User Insert Failed: ${e.message}`,
                });
            });
    
            // Load the Document and print it
            // Prints Content and Metadata of the stored Document
    
    
            //TODO: Requires refactor to programmatically add to user nested object 
    
            let loggedInUserResult = {"user" : await usersCollection.get(users.id)}
        
            console.log('Get Result: ', loggedInUserResult )
    
            const myUserObject = loggedInUserResult.user.content
            console.log(myUserObject, "MY USER OBJECT AFTER REPLACE METHOD WITH TOKEN AND ID")
        
        console.log(users, "USERS")
        const {user} = req.body
        
​
        
​       let loginUser = async function queryNamed() {
            console.log("OH EHY BABY")
    // Perform a SQL++  Query
   
            const queryResult = await bucket
            .scope('blog')
            .query(`SELECT * FROM \`users\` WHERE email='${req.body.user.email}';`, {
            })
            
    
            queryResult.rows.forEach((row) => {
            console.log("ROWS IN THE WORKING QUERY", row)
            })
            return queryResult
            }
            
          //Now login
          loginUser()
          .then(res2 => { 
                if (res2["rows"].length===0) {
                    return res.status(404).json({errors: { message: 'User Not Found' }});
                }
                // console.log("ROWS", res2["rows"]) //Gives UserPassword in Rows object
                let loggedInUserPassword = res2["rows"][0].users.password
                // console.log(loggedInUserPassword)

                res2["rows"]
                .forEach(async (row: { loggedInUserPassword: string; }) => {
                    console.log("I'm about to Try Catch")
                                // console.log("PASSWORD",req.body.user.password, loggedInUserPassword)
                                const match = await bcrypt.compare(req.body.user.password, loggedInUserPassword);
                                // console.log(match)
                                if (!match) {
                                    console.log("NO match, ", match) //showing NO MATCH when passwords are the same?

                                    return res.status(401).json({errors: { message: 'Unauthorized: Wrong password' }})
                                }else {
                                    // console.log("ITS A MATCH")
                                   
                                    const headers = { headers: { 'Authorization': 'Token ' + users.token } };
                                    // console.log("HEADERS: ", headers)
                                    return res.status(200).json({
                                        headers: headers,
                                        user: users
                                    });
                                    
                                }
            ​
                           
                        }) 
            return
             
​
        })
​
});
​
​
​
​
export default router














