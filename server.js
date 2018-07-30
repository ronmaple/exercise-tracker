const express = require('express')
const app = express()
const bodyParser = require('body-parser')


const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )
const { Schema } = mongoose;

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const schema = new Schema({
  username: {
    type: String,
    required: true
  },
  _id: {
    type: String,
    required: true
  },
  activity: [{
    description: String,
    duration: Number,
    date: Date
  }]
})

const Users = mongoose.model('Users', schema);

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// schemas: /new-user => {username, _id }
//          /add => 
//                 { username, description, duration, _id, date }
// exercise/log?{userId} => 
//                

app.post('/api/exercise/new-user', (req, res) => {
  console.log(req.body);
  var _id = require('shortid').generate();
  var username = req.body.username;

  Users.findOne({username}, (err, data) => {
    console.log('_id', _id);
    if (err) console.error(err);
    
    if (data.length == 0) {
      var _id = require('shortid').generate();  
      
      var profile = {
        username,
        _id
      }

      console.log('profile', profile);
      
      let userProfile = new Users(profile);
      
      userProfile.save();
      
      res.json(profile)
    } else {
      res.send(`User profile ${username} already taken`);
    }
  })

  
  
})

app.post('/api/exercise/add', (req, res) => {
  console.log(req.body);
})


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
