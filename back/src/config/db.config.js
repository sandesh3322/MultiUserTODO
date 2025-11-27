require("dotenv").config();
const mongoose = require('mongoose');


const mongouri =process.env.MONGODB_URL;
mongoose.connect(mongouri,{   // it cant be asynced so using then and catch 
    dbName: process.env.MONGODB_NAME ,
    autoCreate : true , 
    autoIndex : true,
}).then(()=>{
    console.log("DB server connected sucessfully ....")
})
.catch((err) => {
    console.log(err)
    process.exit(1)
})