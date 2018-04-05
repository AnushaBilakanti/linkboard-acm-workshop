# LinkBoard Node Workshop

## Introduction
Hey all, thanks for coming to this ACM Node.js Backend Web Dev workshop! Today you'll be introduced to Node.js, Express, and JavaScript backend web development. I'll be going over some web concepts as well as some Node/Javascript specific stuff. 

By the end of today, hopefully you'll have a better understanding of Node backend web dev and can setup a basic web app.

NOTE: Before you read on, make sure to check out the slides I prepared for the workshop ([slides link](https://docs.google.com/presentation/d/1Gp9t75kZWHF7yDz8ZwgZcHpDmXkzeKu3QYSV20GokqQ/edit?usp=sharing))  

## Pre-Requisites
Before this workshop, you should have installed Node.js/NPM and MongoDB. If you haven't, here are the links

* Install Node.js and NPM ([https://nodejs.org/en/download/package-manager/](https://nodejs.org/en/download/package-manager/))  
  * (Note: for Mac users, if you have HomeBrew, it is recommended to install Node via HomeBrew versus the installer)  
* Install MongoDB ([https://docs.mongodb.com/manual/installation/](https://docs.mongodb.com/manual/installation/))

[If you haven't installed MongoDB at this point, that's ok. There are a few alternative steps you can take though you should probably install MongoDB for future dev purposes]

## Workshop Set Up
At this point, you should have Node and NPM installed. Sweet! Let's install some Node packages so we can start making web apps.

* Run the command `npm install -g express-generator` 

With NPM, we can install global packages which allows us to run JavaScript libraries from any folder on our computer. This package will generate an Express template project we can build off of.

Once you've installed express-generator, `cd` into a folder you would like to have your project folder in. Once you've done that...

* Run the command `express --view=ejs linkboard`

This will generate a project in a folder called `linkboard`. The `--view=ejs` specifies the templating engine we're using. EJS is like writing JavaScript embedded into HTML which is why I've chosen that for this workshop. 

* Now, run `cd linkboard` so we're inside the linkboard folder then run `npm install`

Express-generator created a template project but now we need to install the dependencies. Once that's done, open the linkboard folder in your favorite code editor and inspect the files.

You should see `package.json`. This is a file that defines our dependencies (and is where we'll write down any dependencies we add in the future). When we run `npm install`, NPM will fetch these packages from a central repository and install it in our `node_modules` folder. Nifty right? 

So you have this code, now what..

* Run `npm start` to start the Node.js web server then open `localhost:3000` in your browser

Sweet! You just ran your first Node web server. But how does this work?

## Getting Familiar With Express
Open up `app.js` in your text editor and give it a look. This is the entry point for our web server. First, we import a bunch of libraries (that we can access thanks to package.json and NPM). We initialize an Express app and configure it to use **middleware**. Some of this middleware helps our app process POST forms and JSON data, some of it helps with logging, some of it helps load static files. I won't spend too much time on this stuff today but hopefully if you keep getting into Node.js, `app.js` will make more sense.

Anyways, remember how I discussed routing? Let's see routing in action. Check out line 7 of `app.js`. This is referring to the JavaScript code located in `routes/index.js`. It imports it, stores it in a variable, that we then later tell our Express app to use on line 22. Now, for any route that begins with `/`, Express will check to see if the request route matches any handlers we've defined.

Open `routes/index.js` up and check it out. Not too exciting right? Lets write our first route. 

## Our First Route
You should see a route already for `GET /`.  Let's define a route for `GET /hello/:name`. Right below the `router.get('/', ...)` code you see, paste in the following then save.

```javascript
router.get('/hello/:name', function(req, res, next) {
  res.render('index', { title: req.params.name });
});
```

Go back to the terminal and restart the Node server. Now if you visit `localhost:3000/hello/yourname`, you should see a custom message catered to your name. 

How does this work? First, we need a reference to our Express router. Once we have that, we specify what HTTP verb we want to handle. In this case, we're handling GET. 

The first argument specifies the route. Here we allow a parameter `:name`. This allows us to take data via the URL which we can access using req.params. 

Then, we respond with a rendered template. We render the `index` template and pass along the variable title which is the data we get from the URL. 

For future reference, we can get data from a request through either the request parameters or the request body.

* Request Parameters - Passed in through the URL
* Request Body - Embedded in an HTML request (typically through a POST call)

Now that you have a basic understanding of routing and how an Express app is set up, let's start building Linkboard.

## Setting up for LinkBoard
We're going to be hooking up our web app to a Mongo database. Before we do that, let's install some packages

* Run `npm install --save mongoose` 

This will install a package called Mongoose into `node_modules` and will document it as a dependency in `package.json`. Mongoose is a package that makes working with MongoDB easy by allowing us to define schemas/models that represent our data. 

Next, let's start a MongoDB instance. If you don't have MongoDB installed, ignore this. 

* Open a separate Terminal window and `cd` to a folder that can hold our database
* Run `mkdir linkboard-db` then `mongod --dbpath=./linkboard-db` 
* This will start a database in our linkboard-db folder. You can close out of this Terminal window now as it'll run in the background. 

Now, if you have MongoDB installed, insert the following code in `app.js` 

```javascript
// Connect to database
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/linkboard')
```

If you don't have MongoDB installed, insert the following code in `app.js`

```javascript
// Connect to database
var mongoose = require('mongoose')
mongoose.connect('mongodb://trojans:fighton@ds235609.mlab.com:35609/acm-linkboard-workshop-2018')
```

(The difference here is that I'm allowing y'all to use a remote sandbox DB that I set up for the workshop -- I encourage you to use your own MongoDB instance as this is a shared DB that other people can use and access as long as they have the credentials. If you're viewing this a week after this workshop, this won't be available)

If you restart your Node server, nothing will happen as this is something that runs behind the scenes. However, if your program didn't crash, that means your server successfully connected to MongoDB. SICK. Now let's start building LinkBoard

## Defining a Link Model
So LinkBoard is an app that lets users post, share, and discuss links, similar to Reddit. Our app will revolve around the creation and viewing of a Link object which we can model using Mongoose. We're going to define a schema and model in our project so that we're consistent with what we store/read from our Mongo database.

* Create a folder called `models` then create a file called `Link.js`. Feel free to copy and paste the following code into the file.
```javascript
var mongoose = require('mongoose')

/*
  Used to validate whether or not a given input is a valid URL
  Function taken from https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url/22648406#22648406
*/
var validURL = function (str) {
  var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$'
  var url = new RegExp(urlRegex, 'i')
  return str.length < 2083 && url.test(str)
}

/*
  Define our Link schema
*/
var linkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true,
    validate: {
      validator: validURL,
      message: '{VALUE} is not a valid URL!'
    }
  },
  community: {
    type: String,
    required: true
  },
  user: {
    type: String,
    default: 'anonymous'
  },
  created: {
    type: Date,
    default: Date.now
  },
  comments: [String]
})

module.exports = mongoose.model('Link', linkSchema)
```

Note: I rarely advocate for the copying/pasting of code but here I can walk you through what's happening so you have a good understanding of what's going on. 

First, we have to import the mongoose package into this file so we can reference mongoose functions and objects.

The next chunk of code is a validation function that we store in a variable. We'll be using this to verify that we only store valid URLs in our database.

Next, we define a schema -- essentially we're telling our code how to structure a Link object. Here, our Link schema has several fields with different requirements and types.

Note `comments`. We can make it so that our schema stores an array of Strings which is what comments represents. We can also specify default values such as `created` and/or specify whether or not a field is required or not.

Lastly, look at `url`. Note that we define a validate field within that field. Essentially, we tell Mongoose to run that function before we store it in our database. If it returns false (i.e. invalid), then we return an error message to the user and cancel the DB operation.

The last line of the file is the export line. Defining our exports is key because that's what gets imported when other files reference this file. In this case, we export our schema as a 'link' model. 

## LinkBoard Views
So you saw how Express works, got MongoDB and Mongoose set up, and defined your first model/schema. Exciting but right now.. not much happens. Your site right now doesn't do anything at all. Let's change that.

Before we start writing LinkBoard routes, you'll want to add some files I've already created into your project. For time sakes, I've already written and coded up all the EJS views and stylesheets for you. 

This workshop focuses mostly on backend so I didn't want to get to bogged down in the front end. 

In this repository, there is a folder called `linkboard` which contains the completed LinkBoard code from this workshop. You can refer to this anytime you get lost. In that folder, there is a `views` folder. Go ahead and copy/paste the files in that folder into the views folder of your linkboard project. In addition, go ahead and copy/paste the `public/stylesheets/stylesheet.css` into your own project as well.

Feel free to take a look at each EJS file. Essentially, you use embedded JavaScript to tell the server when/what/where to embed dynamic data into a web page. The data that gets passed into these files is determined by the routes that we define. 

If you have the `views` folder and the `stylesheet.css` file copied into your version of linkboard, let's move on to the next part.

## LinkBoard Routes
Let's write some of our own routes to handle the various actions we want for LinkBoard. We want to be able to do the following:
* View all of the Links posted (GET /)
* Create a new Link (POST /new)
* View the comment thread for a specific Link (GET /link/:id)
* See Links for certain communities (GET /lb/:community) 
* Comment on a specific Link (POST /link/:id/comment)

Let's begin. In `app.js`, feel free to delete the line of code that says:
```javascript
var usersRouter = require('./routes/users');
```

and the line of code that says:
```javascript
app.use('/users', usersRouter);
```

You don't necessarily need to delete those lines but they add nothing to LinkBoard so why bother. 

Open up `routes/index.js` and add the following line of code somewhere at the top

```javascript
var Link = require('../models/Link')
```
Remember how we defined our Link model and exported it earlier? This allows us to perform actions with the Link model like finding Links in the database, creating new Links, etc. 

Now, let's tackle our first requirement: view all of the links posted. Go ahead and replace the default `GET /` route with the following:

```javascript
/*
  GET home page.
  Gets all the Links stored in the database, sorts it by created date,
  then send the data to our index view for rendering
*/
router.get('/', function (req, res, next) {
  Link.find({}, null, {sort: {created: -1}}, function (err, links) {
    if (err) {
      res.render('error')
    } else {
      res.render('index', { links })
    }
  })
})
```

What this does is do a search for Links in the database (with no conditions, therefore finding ALL Links), sorts it by the created field, then passes along the found links to a template (if there are no errors). What's happening here is an asynchronous database call. We don't want to give the user a response until the database has finished its operations, therefore we provide the find() function a callback function. This callback structure is common in JavaScript/Node development.

If you restart your Node server and navigate to `localhost:3000`, you should see an empty page with no links. Right now, your web app is actually hitting the database but there are no results stored (duh). If you click `New Link` you should get a 404 error message or something. Let's define the routes for creating/adding new links to the database. 

First, we define the route for `GET /new`. This simply renders the `new` view which is a form for adding new links. When the user clicks submit, it will send a POST request to the `/new` route which is what we'll handle next. 
```javascript
/*
  GET the new link page
  Simply renders our new link view (no dynamic content)
*/
router.get('/new', function (req, res) {
  res.render('new')
})
```

This next route handles what happens when a user submits via a form. Note the difference in HTTP verb (get vs. post). Here, we create a new Link object and fill it with data that we obtain from the request body object. This corresponds to the values that the user submits via the form (see `views/new.ejs` to see what the form markup looks like)

Then, we `save()` the Link object which needs a callback function. If there is an error, we want to bring the user back to the new form view with an error message. Otherwise, we redirect the user to see the link they just created. 
```javascript
/*
  POST a new link
  Takes in data submitted via a form
  If there is an error, render the new link view w/ an error message
  Otherwise, redirect the user to the newly created link
*/
router.post('/new', function (req, res) {
  var link = new Link({
    title: req.body.title,
    url: req.body.url,
    community: req.body.community,
    user: req.body.user
  })

  link.save(function (err) {
    if (err) {
      res.render('new', { error: err })
    } else {
      res.redirect('/link/' + link._id)
    }
  })
})
```

Save then restart your web server. Then access `localhost:3000/new`. You should see a form for adding in new links. You should be able to fill out the form and click submit. You should get a 404 error because we haven't defined the routes for viewing Link discussion threads yet but we'll get to that now!

Next, define the `GET /link/:id` route with the following code. Mongoose provides a findById() function that lets us specify an ID. Every MongoDB object has a specific/unique Mongo ID we can access it by. For this route, we get this ID from the URL. Again, we pass a callback function to deal with a failed/successful DB query. If there is an error or we get a null link, we render the error page. Otherwise, we render the `link` view and pass along the link data.
```javascript
/*
  GET a link by ID
  We find a link by an ID specified by the URL then send that data
  to our link view to dynamically render
*/
router.get('/link/:id', function (req, res) {
  Link.findById(req.params.id, function (err, link) {
    if (err) {
      res.render('error')
    } else {
      if (link) {
        res.render('link', { link })
      } else {
        res.render('error')
      }
    }
  })
})
```

Our web app is almost complete! However, right now we haven't added the functionality for filtering Links by community. The following route handles `GET /lb/:community`. Again, this code is very similar to `GET /` except we filter the Links we want by a community parameter which we get from the URL. 
```javascript
/*
  GET community page.
  Gets all the Links where the community matches the URL parameter,
  sorts it by created date, then send the data to our index view for rendering
*/
router.get('/lb/:community', function (req, res) {
  Link.find({community: req.params.community}, null, {sort: {created: -1}}, function (err, links) {
    if (err) {
      res.render('error')
    } else {
      var community = req.params.community
      res.render('index', { links, community })
    }
  })
})
```

At this point, you should be able to navigate around the site, post links, filter by community, and see comment discussion threads. However... we can't post any comments yet. Let's change that. In the `link` view, there is a comment form that sends a POST request to `/link/:id/comment`. Let's write the route to support comment functionality. The following code does the following:
* first it finds the Link specified by the given ID from the URL
* then it adds a new entry to the comments array. the data for this entry comes from the request POST body
* since we've changed Link, we call the `save` function to update the database. If the save was successful, we redirect the user to the Link discussion page

```javascript
/*
  POST a new link comment
  Takes in data submitted via a form and pushes a new comment to our link
*/
router.post('/link/:id/comment', function (req, res) {
  Link.findById(req.params.id, function (err, link) {
    if (err) {
      res.render('error')
    } else {
      link.comments.push(req.body.comment)

      link.save(function (err) {
        if (err) {
          res.render('error')
        } else {
          res.redirect('/link/' + req.params.id)
        }
      })
    }
  })
})
```

Save your code, restart your web server, and navigate to `localhost:3000`. Click on the comments thread of a previously posted Link. You should be able to start commenting now! The comments for LinkBoard are quite simple, we're just storing an array of Strings... but in the future you could store an array of Comment models (which is a different topic for another workshop :^)) 

## Conclusion
Congrats! At this point, you should have written all the routes needed to support the functionality we wanted for LinkBoard. You should be able to play around the site, add links, add comments, and all that fun stuff. Now that you know how routes work, how to read/write data from a MongoDB, and more, I challenge you to start adding in new features like voting, a comment user field, etc. 

I hope you understand how Node/NPM works, what Express is, how routing works, and how to access a database and read/write data. I tried my best to explain my code as best as I can but if there are any outstanding comments or questions, please let me know!