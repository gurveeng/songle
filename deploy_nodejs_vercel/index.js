const express = require('express');
const app = express();
const port = 3000;
const querystring = require('querystring');
const crypto = require('crypto');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
import http from 'http';


app.use(cors());
app.use(bodyParser.json());

const corsOptions = {
  origin: 'http://127.0.0.1:8080',
  methods: 'GET,POST',
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

const server = http.createServer((req, res) => {
  // Set the response header
  res.writeHead(200, {'Content-Type': 'text/plain'});
  // Write some text to the response
  res.redirect('../public/home.html');
});

app.use(cors(corsOptions));

class Track {
  constructor(title, artist, previewUrl) {
    this.title = title;
    this.artist = artist;
    this.previewUrl = previewUrl;
  }
}


// Function to generate a random string
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.randomBytes(length);
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join('');
};

// Redirect URI and Spotify credentials
const redirectUri = 'http://localhost:3000/callback';
const clientId = '438a6377672b4b89995262d15d4d39ec';
const clientSecret = '6e8ee31f27fb429e80281903e235a8ad'; 



// Route for initiating the authentication flow
app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  const scope = 'user-top-read user-read-recently-played streaming'; // Specify your desired scopes here
  console.log("reached endpoint");

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      state: state
    }));
});

// Route for handling the callback from Spotify
app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  if (!code) {
    res.status(400).send('Authorization code not provided');
    return;
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    accessToken = tokenData.access_token;
    req.session.accessToken = accessToken;


    res.redirect('/main.html');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send(error.message);
  }
});

app.get('/sendTrackList', async (req,res) => {
  try {
    const toptracks = await fetchTopTracks(accessToken);

    // input toptracks title, artist, preview data into array of Tracks 
    let trackList = new Array(50).fill(null);

    const trackListLength = 50;

    let i = 0;
    while (i < trackListLength) {
      trackList[i] = new Track(toptracks.items[i].name, toptracks.items[i].artists[0].name, toptracks.items[i].preview_url);
      i = i + 1;
    }

    if (!trackList) {
      res.status(404).send('Track list not found');
      return;
    }

    // Send the track list as JSON
    res.json({ trackList });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
});


// fetch top tracks data 
async function fetchTopTracks(token) {
  const result = await fetch("https://api.spotify.com/v1/me/top/tracks?limit=50", {
      method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  return await result.json();
}



// fetch search results
async function fetchSearchResults(searchInput) {
  console.log(searchInput);
  const result = await fetch(`https://api.spotify.com/v1/search?q=${searchInput}&type=track&limit=3`, {
    method: "GET",
    headers: { 
      Authorization: `Bearer ${accessToken}`
    }
  });
  return await result.json();
}


// send search results
app.post('/sendSearchResults', async (req, res) => {
  try {
    const { searchInput } = req.body; // Destructure searchInput from req.body
    console.log(searchInput);
    const searchResults = await fetchSearchResults(searchInput);

    // Send the search results as JSON
    res.json({ searchResults });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


