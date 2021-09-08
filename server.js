require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const axios = require('axios')
const queryString = require('querystring')

const REDIRECT_URI = process.env.REDIRECT_URI
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

const port = 3001
const app = express()

app.use(bodyParser.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('hi')
})

app.post('/login', (req, res, next) => {
  console.log('Incoming Request')
  const code = req.body.code
  const data = queryString.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    })
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
    .catch(next);
})

app.listen(port, () => {
  console.log(`Listening to the port ${port}`)
})