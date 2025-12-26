require("dotenv").config()
const http = require("http")
const app = require("./src/config/express.config")
const server= http.createServer(app)
const port =process.env.PORT || 9005

server.listen( port ,'127.0.0.1', (error)=>{
if(error){
    console.log("server error")
}
else{
    console.log("server is running on port :9005")
    console.log("Press ctrl +c  to discontinue server")
}

}) 