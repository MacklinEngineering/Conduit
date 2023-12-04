# ![RealWorld Example App](logo.png)

> ### Express.js + Couchbase + Typescript codebase containing real world examples (CRUD, auth, advanced patterns, etc) that adheres to the [RealWorld](https://github.com/gothinkster/realworld) spec and API.

### [Demo](https://demo.realworld.io/)&nbsp;&nbsp;&nbsp;&nbsp;[RealWorld](https://github.com/gothinkster/realworld)

This codebase was created to demonstrate a fully fledged fullstack application built with **Express.js + Couchbase + Typescript** including CRUD operations, authentication, routing, pagination, and more.

We've gone to great lengths to adhere to the **Express.js + Couchbase + Typescript** community styleguides & best practices.

For more information on how to this works with other frontends/backends, head over to the [RealWorld](https://github.com/gothinkster/realworld) repo.

# Getting started

1. install npm
2. Run `npm install` in the project folder
3. Export your variables
4. Run `npm run dev` for dev mode and `npm run start` for regular mode

# How it works

> All the routes are defined in the `routes` folder, and their corresponding controllers are implemented in the `controllers` folder.

# Design Choices and Tradeoffs

TODO:

- Only one `access_token_secret` is used for all the accounts registration and login. Drawback: data can be forged if this secret is leaked
- Usernames are case-sensitive
