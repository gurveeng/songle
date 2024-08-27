# Songle

Songle is a music quiz game that challenges you to identify your top Spotify tracks based on brief previews (1-6 seconds). It's a fun way to test your music knowledge and revisit your favorite songs!

Due to Spotify's developer limitations, this app is currently not accessible to others. Spotify has not extended the necessary API access beyond my account, so you won't be able to use it directly.

While the app isn't publicly available, you can still check out a demo of the interface [here](https://youtu.be/CcKVk4x3zgg).

If you'd like to experience Songle yourself, follow these steps:

Create a Spotify Developer App:

1. Go to Spotify for Developers.
2. Create a new app and retrieve your Client ID and Client Secret.
3. Set the Redirect URI to http://localhost:3000/api/callback.

Set Up the Project:

4. Clone this repository.
5. Install the required dependencies: npm install.
6. Update clientId and clientSecret in the server code with your own Spotify app credentials.

7. Start the server: node index.js.
8. Visit http://localhost:3000 in your browser.
   Now, enjoy guessing your top tracks!
