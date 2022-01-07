The app is using the mongoDB cloud solution 'atlas'. 

To run the web app on a localhost follow these steps:
1. Create a mongoDB atlas database (cloud.mongodb.com).

2. Connect to the database. Within atlas choose the option 'connect your application'. 
  Then copy pase the connection string (with adapted user and password string) into the server.js file (mongoose.connect("")). 
  Note that if you have special characters in your password, you must encode those characters (for further information check https://docs.atlas.mongodb.com/troubleshoot-connection/).

3. Try to start the app, run the following two commands in two terminals


        nodemon server.js

        npm start
       

    If successful, the development server should start on localhost:3000/ within your browser.  
    Otherwise:

4. If necessary, install missing node packages, as the node_modules are not pushed to this repository (e.g., axios, bootstrap, mongoose, ..). Installing express may cover the issues:

        npm install express

6. If the database throws an error while connecting, the reason may be a missing IP whitelist. 
To add your IP, go within mongoDB Atlas > Security > Network Access > Add your IP Address.

  If you want to export your database entries, you may want to use mongoexport (https://docs.mongodb.com/database-tools/mongoexport/).



