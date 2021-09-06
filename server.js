let express = require("express")

//To create a database in MongoDB, start by creating a MongoClient object, 
let MongoClient = require('mongodb').MongoClient;

//Create a sanitize html object that will inspect user given input for security purposes
//You must install the package using npm (npm install sanitize-html)
let sanitizeHTML = require('sanitize-html')

//Create an objectId object that will be instantiated in line 17
let ObjectId = require('mongodb').ObjectId;

//Create an express server object
let myApp = express()

//Let heroku create their own port during deployment
let port = process.env.PORT
if(port == null || port == ""){ //if its running on localhost, assign it the port number 3000
    port = 3000 
}

//declare an empty database variable
let db

myApp.use(express.static('public')) //express static serves(gives access) to the public folder and its content

//specify a connection URL with the correct ip address and the name of the database you want to create.*/
let connectionString = 'mongodb+srv://cmkAppUser:Kerene394@cluster0.ggemx.mongodb.net/TodoApp?retryWrites=true&w=majority'

MongoClient.connect(connectionString, {useNewUrlParser: true}, function(err, client){

    db = client.db() //Creates a new Db instance sharing the current socket connections.
    myApp.listen(port)
})

myApp.use(express.json()) //Tells express js to take asynchronous requests and add it to a body object on the request object
myApp.use(express.urlencoded({extended: false})) //Tells express js to take submitted form data and add it to a body object on the request object 

//Setting security for the app (Username and Password)
function passwordProtected(req, res, next){
    res.set('WWW-Authenticate', 'Basic realm="ToDo App"')
    console.log(req.headers.authorization)
    if(req.headers.authorization == "Basic Y21rOmNtazEyMw=="){ //evaluates if the user types in the correct username and password. The given string value is the username and password that I set
        next() //ends this current function and moves on the next function
    }else{
        res.status(401).send("Authentication required")
    }
    
}

myApp.use(passwordProtected) //This tell express to use the passwordProtected function as the first function for all the get and post routes

myApp.get('/', function(req, res){
    db.collection('items').find().toArray(function(err, items){
        res.send(`
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple To-Do App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
</head>
<body>
  <div class="container">
    <h1 class="display-4 text-center py-1">CMK's To-Do App</h1>
    
    <div class="jumbotron p-3 shadow-sm">
      <form id= "create-form" action = "/create-item" method = "POST">
        <div class="d-flex align-items-center">
          <input id="create-field" name = "item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
          <button class="btn btn-primary">Add New Item</button>
        </div>
      </form>
    </div>
    
    <ul id = "item-list" class="list-group pb-5">
   
    </ul>
    
  </div>

  <script>
      let items = ${JSON.stringify(items)} //Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
  </script>
        <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
     <script src = "/browser.js"></script>
  
</body>
</html>
    `)
    })
    
})

//Create (Server to database)
myApp.post('/create-item', function(req, res){
    //Create a variable that will hold the typed user input and deny html tags and attributes (only text)
    let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}} )
    db.collection('items').insertOne({text: safeText}, function(err, info){
        if(err) {         console.log('Error occurred while inserting');     } 
        else {        
        let data = {          
                   "_id": info.insertedId,          
                  "text": req.body.text        
        }       
         res.json(data);    
         }    
    })
    
})



//Update (Server to database)
myApp.post("/update-item", function(req, res){
    
    let myquery = { _id: new ObjectId(req.body.id) }; 
    //Create a variable that will hold the typed user input and deny html tags and attributes (only text)
    let safeText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}} )

    db.collection('items').updateOne(myquery, {$set: {text: safeText}}, function(){
        res.send("Success")
    })
})

//Delete (Server to database)
myApp.post("/delete-item", function(req, res){
    
    let myquery = { _id: new ObjectId(req.body.id) }; 
    db.collection('items').deleteOne(myquery, function(){
        res.send("Success")
    })
})

//Read happens when you reload the page (It reads and displays the existing database)




//install nodemon for automatic restarts of the server each time you make a change
//npm install nodemon 
//then type "watch": "nodemon server", in the script section in package.json
//then type npm run watch in your terminal


/*In MongoDB
    a collection is a table 
    a document is a record
*/

/*MongoDB waits until you have created a collection (table), with at least one document 
(record) before it actually creates the database (and collection).
*/