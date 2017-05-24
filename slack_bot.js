"use strict";

const rp = require('request-promise');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');

const TOKEN = '#';
app.use(bodyParser.urlencoded({ extended: false }))

// Just an example request to get you started..
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

const fetchGithub = () => {
  return request('https://api.github.com', (error, response, body) => {
    console.log(response)
  })
}

app.post('/', (request, resp) => {
  if(request.body.token !== TOKEN){
    resp.statusCode = 400
    resp.end()
  }else if(!request.body.text){
    resp.statusCode = 400
    let noUserName = {
      "text": "Put in a username next time"
    }
    resp.end(JSON.stringify(noUserName))
  }else{
    let username = request.body.text.split(' ')[0]
    let search = request.body.text.split(' ')[1]
    console.log(`username: ${username}, search: ${search}`)
    let options = (username) => {
      return {
        uri: `https://api.github.com/users/${username}`,
        token: "#",
        rate: {
          limit: 5000
        },
        headers: {
          "User-Agent": "hwalborn"
        }
      }
    }
    rp(options(username))
    .then((response) => {
      let parsedResponse = JSON.parse(response)
      let info = {
        "text": [parsedResponse.login, parsedResponse.html_url ]
      }
      search ? info.text.push(parsedResponse[search].toString()) : null
      resp.send(JSON.stringify(info))
    }).catch((err) => {
      resp.statusCode = 404
      let errorResponse = {
        "text": "Unkown Username"
      }
      resp.end(JSON.stringify(errorResponse))
    })
  }
})
// This code "exports" a function 'listen` that can be used to start
// our server on the specified port.
exports.listen = function(port, callback) {
  callback = (typeof callback != 'undefined') ? callback : () => {
    console.log('Listening on ' + port + '...');
  };
  app.listen(port, callback);
};
