# Components of the software
The web application is separated into two components, client and server.
The client contains code in React, and the server contains code in ExpressJS.
There are extra files that are not found in the server folder, which is the ".env" file because it contains sensitive information to 
access the database in MongoDB and a Gmail account.
The .env file contains fields such as:
- **MongoDB**
This contains the link to connect to MongoDB. Some details such as the name of the user, the password associated with that name, and the name of the cluster are manually typed in.
- **SECRET_KEY**
This is a randomly generated key using the file "genereateSecretKey.js" found in the server folder. This is required to create user tokens.
- **USER**
This is the Gmail account. It is required for sending emails.
- **PASSWORD**
This is the app password generated from Gmail. This is also requied for sending emails.


# How to run the application
To run the application, the Node environment needs to be installed. This link, https://nodejs.org/en, provides a downloadable executable.
The setup wizard provides further instructions for installation.
When the Node environment is setup, the client and server are ready to run.
Firstly, from the command line of the computer, access the server folder. For example, the command may be "cd Documents/fa335/code/branches/master/server"
depending on where the folder is saved.
When inside the server folder, the next command is "npm install" to install all the packages.
Afterwards, the next command is "npm run start". In the command line, there should be a text "Connected to MongoDB", which indicates that the server is running 
and the database ir responding.
Next, it is the client folder that needs to be accessed from another command line, not the same that was used for the server. 
The instructions are the same for accessing the client folder, since the components are within the same folder.
Then, the next command is "npm install" to install the packages.
After installing the packages, the next command is "npm run dev". The command line will provide a link, "http://localhost:3000", which is the point of access to the 
web application. Hold the Ctrl key and left-click the link.
Now the website is up and running.

Please note that the application will not work without the .env file. To produce the .env file, the user needs to create a MongoDB account and create a their own cluster, 
using free tier cluster should be enough. More details are found in this website, https://www.mongodb.com/docs/guides/atlas/account/.
To obtain the SECRET_KEY to set in .env, the generateSecretKey.js needs to be run separately in the server folder, from the command line, and the command is 
"node generateSecretKey.js".