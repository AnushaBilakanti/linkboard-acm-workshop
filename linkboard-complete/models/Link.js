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
