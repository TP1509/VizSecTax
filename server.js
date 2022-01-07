const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const app = express();
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cors())


//Import DB model entry file
const entry = require('./model/entry')


//MongoDB connection, add connection string here
mongoose.connect("",{
    useNewUrlParser: true,
}).then(()=>{
    console.log("Database connected...");
})


//Get all data from MongoDb
app.get("/api/data",async(req, res)=>{
    let allData = await entry.find()
    res.send(allData)

})


//Post and save new entry in MongoDB
app.post("/api/data", async (req, res)=>{
    try{
        data = new entry(req.body)
        await data.save();
        console.log('Adding new entry to the DB:');
        console.log(data);
    }catch(err){
        console.log(err);
    }

})

//Delete object in MongoDB
app.post('/api/data/delete', async (req, res) => {
    console.log('Deleting one object from the DB:');
    console.log(req.body.obj)
    try{
      entry.deleteOne({_id:req.body.obj}).then(result=>{
        res.send("Deleted")
      }).catch(error=>console.log(error))
    } catch(err){
        console.log(err);
    }
  })


//Port of backend server
app.listen(2000,()=>{
    console.log("Server is running...")
    
});

//Hello World on localhost:2000/ 
app.get("/", (req, res)=>{
    res.send("Hello World")
    
})
