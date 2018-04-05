var express = require('express')
var router = express.Router()

var Link = require('../models/Link')

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

/*
  GET the new link page
  Simply renders our new link view (no dynamic content)
*/
router.get('/new', function (req, res) {
  res.render('new')
})

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

module.exports = router
