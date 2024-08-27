# songle

Songle is a music quiz game that challenges you to identify your top Spotify tracks based on brief previews (1-6 seconds). It's a fun way to test your music knowledge and revisit your favorite songs!

Due to Spotify's developer limitations, this app is currently not accessible to others. Spotify has not extended the necessary API access beyond my account, so you won't be able to use it directly.

Demo
While the app isn't publicly available, you can still check out a demo of the interface here.

Running Songle Yourself
If you'd like to experience Songle, follow these steps:

Create a Spotify Developer App:

Go to Spotify for Developers.
Create a new app and retrieve your Client ID and Client Secret.
Set the Redirect URI to https://songle.vercel.app/api/callback.
Set Up the Project:

Clone this repository.
Install the required dependencies: npm install.
Update clientId and clientSecret in the server code with your own Spotify app credentials.
Run the App:

Start the server: node index.js.
Visit http://localhost:3000 in your browser.
Now, enjoy guessing your top tracks!
