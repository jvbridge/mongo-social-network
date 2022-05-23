# mongo-social-network
An implementation of a social network backend using MongoDB

## About

This is a simple API that creates a "social network" created in MongoDB, and 
managed by mongoose. The server itself is run using Express.js and Node.js

## Installation

This project requires [Node.js](https://nodejs.org/en/) and 
[MongoDB](https://www.mongodb.com/) to be installed in order to work.
Additionally MongoDB must be running on the default port (as of writing this 
readme the default port for MongoDb is 27017)

If deployed using Heroku or a similar platform the project looks for the port 
stored in `process.env.MONGODB_URI`

Download the repositry and run `npm install` inside of the root directory for it

After the installation finishes optionally run `npm run seed` in order to put 
some psuedo random data (includes users, thoughts, and reactions), if you wish 
to have more data or less data you can change the constants in `/seed/seed.js`
in order to fit your preferences. Running the command will delete the database,
before seeding so ensure that there's nothing in there that you want. 

### Models 

There two main models. Users and Thoughts. 

**Users**
 * `username`
  * a unique string that is required to make a user
  * case sensitive
* `email`
  * a unique string that is required to make a user
  * all lower case
  * verified by regex
* `thoughts`
  * an array of `_id` values refrencing the thoughts model
* `friends`
  * an array of `_id` values referencing this model
* Virtuals
  * friendcount
    * just a simple demo of what a virtual can do by computing how many friends 
    a user has
  * timestamps
    * timestamps are gotten and set using the node module 
    [luxon](https://moment.github.io/luxon/#/)

**Thought**

* `thoughtText` 
  * A string that must be present and is long as a tweet
* `username`
  * the username of the user associated with the thought
  * must be present as well
* `reactions`
  * an array of nested documents that are created with the `reactionsSchema`
  * these also have a text and username field, the text is as long as a tweet
* both reactions and the thought itself are timestampped at creation

## Usage
This project is a REST API, which means it will take requests that conform to 
the standards. Every request made will query the database and optionally will 
update it as applicable. I tested it using 
[insomnia](https://insomnia.rest/download) which will nicely make the requests 
for you. For detailed usage look at the [Routes](#routes)

### Routes
All routes are under `/api/` since the non api routes are presumably used for
a front end

* `/api/users`
  * POST: create a new user
    * body must have both a `username` and an `email`
  * GET: gets all users
  * `/api/users/:id` where `:id` is substitued with the string of their id
    * GET: gets the user with that id
    * PUT: updates the user with that id, may update both username and email
    neither must be in use already
    * DELETE: deletes that user. Will delete all their thoughts and remove them 
    from other users friends lists
    * `/api/users/:id/friends`
      * GET: gets JUST the user's friends
      * `/api/users/:id/friends/:fid` where `:fid` is another user's id
        * POST: adds the users to each other's friends list
        * DELETE: removes the users from each other's friends list
* `/api/thoughts`
  * GET: gets all thoughts that exist
  * POST: adds a new thought, must have a `username` and `thoughtText` in the 
  body
  * `/api/thoughts/:id` where `:id` is the id of a thought
    * GET: gets that thought
    * PUT: updates that thought's values based on the body of the request
    * DELETE: deletes that thought
    * `/api/thoughts/:id/reactions`
      * POST: creates a reaction for the thought based on the body of the 
      request
      * `/api/thoughts/:id/reactions/:rid` where `:rid` is the id of a reaction
        * DELETE: deletes that reaction

## Demonstration

Seeding the database:

This is simple video showing how the database gets seeded

User operations:

This video shows all the basic operations that can be made with a user.
* gettting all uses
* getting a single user
* updating a user
* creating a friendship
* deleting a friendship
* deleting a user

Thought operations

This video shows all the basic operations that can be done with thoughts
* getting all thoughts
* adding a thought
* adding a reaction
* deleting a reaction
* deleting a thought
* deleting a user and showing the cascade to their thoughts




## Technologies used

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

![NPM](https://img.shields.io/badge/NPM-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white)

Node modules used:

* [Mongoose](https://mongoosejs.com/) for interfacing with MongoDB
* [Luxon](https://moment.github.io/luxon/#/) for time stamping
* [Nodemon](https://www.npmjs.com/package/nodemon) for easier developmen

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Credits

License from https://gist.github.com/lukas-h/2a5d00690736b4c3a7ba

Technology badges from https://github.com/Ileriayo/markdown-badges