const express = require('express') // require express module
const app = express()
const MongoClient = require('mongodb').MongoClient
const { ObjectId } = require('mongodb')
// what port to host server on on computer:
app.listen(3000, function () {
    // console.log('listening on 3000')
})

// When you receive an object from HTML form, you need to do something with that object before passing it to your handlers:
app.use(express.urlencoded({ extended: true }))
// this tells express to extract data from the <form> element 
// we can't serve up the index.html file and expect quotes from MongoDB to appear because there's no way to add dynamic content to an HTML file. Instead, we'll use a template engine to generate the HTML. 
// I installed npm install ejs to be able to use ejs

app.set('view engine', 'ejs') // this sets the view engine to ejs. This tells express we're using EJS as the template engine. You need to place it before any app.use, app.get, or app.post methods
// with this view engine, we can now generate HTML that contains the quotes. What is this process called? Rendering the HTML
// res.render(view, locals) 
// view is the name of the file we're rendering, the file must be placed inside a views folder. locals is the data passed into the file
// Creates middleware that serves static files, such as HTML, CSS, JavaScript, and images.
app.use(express.static('public'))

app.use(express.json()) // we are setting up the server to be able to read JSON by using express's json middleware. The JSON file will arrive after user on front end clicks button that runs a function that triggers a fetch


// we can connect to MongoDB through the MongoClient's connect method: 
MongoClient.connect('mongodb+srv://jespino:PassWord@cluster0.wizbxmr.mongodb.net/?appName=Cluster0')

    .then(client => {
        const db = client.db('Personal-Wish-List-Fullstack-App') // store link to MongoDB database in variable db. Use name of database from MongoDB exactly as it appears in MongoDB (Case sensitive!) This is what we use to access MongoDB database. Because of this, we need to put our express request handles into the MongoClient's then call
        const WishListItemsCollection = db.collection('WishListItems') // here, we've created a collection to store individually inputted wishListItems from frontend into a wishListItems collection in mongoDB. 

        // Showing wishListItems from mongoDB to users, READ operation! How to steps:
        // CRUD: Read:
        // Get items from MongoDB Atlas.
        // Rendering the items in HTML with a template engine
        app.get('/', (req, res) => { // this is a request handler
            // const cursor = db.collection('quotes')  // this is how we are going to get a user inputted quote from the quotes collection in MongoDB. 
            // cursor is an object that contains all quotes from our database. It has a bunch of methods that lets us get our data
            db.collection('WishListItems')
                .find() // if you console.log(db.collection('quotes').find() it returns an object called a cursor
                .toArray() // this makes the cursor object into an array that lets us get into the data
                .then(results => {
                    const impulseListDocuments = results.filter(documents => documents.list === 'impulseList')
                    const wishListDocuments = results.filter(objects => objects.list === 'wishList') // wishList property is not undefined, meaning it's been defined (by the user pressing the button)
                    res.render(
                        'index.ejs', 
                        { impulseList: impulseListDocuments,
                            wishList: wishListDocuments
                        }) // this shows the array of objects 
                })
                .catch(error => console.error(error))
        })

        // CRUD: Create:
        app.post('/addDocumentToWishListItemsCollection', (req, res) => {
            // req.body.list = 'impulseList'
            WishListItemsCollection
                .insertOne({...req.body, list: 'impulseList'}) // the insertOne method allows us to add items into a MongoDB collection
                .then(result => {

                    res.redirect('/') // asking browser to redirect back to / instead of it waiting for a response from server. otherwise, the loading wheel on the webpage would continue to spin. 
                    console.log(result)
                })
                .catch(error => console.error(error))
        })
        // CRUD: Update
        // this handles the put request from the fetch request in main JS:
        app.put('/moveItems', (req, res) => {
            console.log(req.body)
            WishListItemsCollection
                .findOneAndUpdate(
                    { _id: new ObjectId(req.body.lookUpThisIDinMongoDB) },
                    {
                        $set: {
                           list: 'wishList'
                        }
                    },
                    {
                        upsert: false,
                    },
                )
                // .findOneAndUpdate(query, update, options) // query = lets us filter through our collection, find the object(s) with a matching key-value/property. 
                // update tells MongoDB what to change: uses mongoDB update operators like $set, $inc, and $push
                .then(result => {
                    res.json('Success')
                    console.log(result)
                    console.log('Success')
                })
                .catch(error => console.error(error))
        })
        // const date = new Date("2026-10-01");
        // const today = new Date();

        // if (date < today) {
        //     console.log("Date is in the past");
        // } else if (date > today) {
        //     console.log("Date is in the future");
        // } else {
        //     console.log("Same date and time");
        // }



        // CRUD: Delete - when user clicks delete button of item on wishlist:
        app.delete('/deleteAdocument', (req, res) => {
            console.log(req)
            WishListItemsCollection
                .findOneAndDelete({ _id: new ObjectId(req.body.lookUpThisIDinMongoDB) })
                .then(result => {
                    console.log(result)
                    if (!result) {
                        return res.json('No item to delete')
                    }
                    res.json(`Deleted Item!`)
                })
                .catch(error => console.error(error))
        })
    })