require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const queryString = require('querystring')

const REDIRECT_URI = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/'
  : process.env.REDIRECT_URI
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

const PORT = process.env.PORT || 3001
const app = express()

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('hi')
})

const axiosErrorLog = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log('Error', error.message);
  }
  console.log(error.config);
}

app.post('/login', (req, res, next) => {
  console.log('Incoming Login Request')
  const code = req.body.code
  const data = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  }).toString()

  const headers = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  axios.post('https://accounts.spotify.com/api/token', data, headers)
    .then(response => res.json({
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in
    }))
    .catch(axiosErrorLog)
})

app.post('/refresh_token', (req, res, next) => {
  console.log('Incoming RefreshToken Request')
  const refreshToken = req.body.refreshToken;

  const clientCredentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const encodedCredentials = Buffer.from(clientCredentials).toString('base64');
  
  const headers = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${encodedCredentials}`
    }
  }

  const data = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }).toString()

  axios.post('https://accounts.spotify.com/api/token', data, headers)
    .then(response => res.json({
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in
    }))
    .catch(axiosErrorLog)
})

app.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`)
})
