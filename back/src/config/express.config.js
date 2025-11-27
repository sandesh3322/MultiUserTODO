const express=require('express')
const cors=require('cors');
require("./db.config");
const router = require("./router.config");
const app=express();
app.use(cors())
app.use(express.json()); // parse JSON requests
app.use(express.urlencoded({ extended: true })); // parse URL-encoded data (optional if not using forms)
app.use(router); // your API routes

app.use((req,res,next)=>{
  next({status:404,message:"resource not found."})
})

app.use((error,req,res,next)=>{

    console.log("error", error);
    let statusCode = error.status || 500 ; 
    let message = error.message || "server error..."
    let detail = error.detail || null;
    


    // mongo db unique error handling 
    if(error.code == 11000){
      const uniqueFailedKeys = Object.keys(error.keyPattern)
      detail = {};
      message = "validation failed";

      uniqueFailedKeys.map((field)=>{
          detail[field] = field+'should be unique'
      })
      statusCode = 400
  }

    
    res.status(statusCode).json({
       result: detail,
       message: message,
       meta:null
    })

})

module.exports = app ;