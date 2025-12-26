require('dotenv').config()
const nodemailer = require("nodemailer")
class MailService{

    #transport ;
    constructor(){
        try{
                const config = {
                    host:process.env.SMTP_HOST,
                    port:process.env.SMTP_PORT,
                    // service: "gmail",
                    // secure:false,
                    auth:{
                        user:process.env.SMTP_USER,
                        pass:process.env.SMTP_PASSWORD
                    }
                }
                if(process.env.SMTP_PROVIDER ==="gmail"){
                    config['service'] = 'gmail'
                }
                this.#transport = nodemailer.createTransport(config)
        }catch(exception){
            console.log(exception);
            console.log("Error connecting mail server....")
            
        }
    }
    sendEmail = async ({to , sub , message, attachments = null}) => {
        try{
            const msgOPts ={
                
                    to: to ,
                    from: process.env.SMTP_FROM,
                    subject: sub,
                    html:message,

            
            }
            console.log(msgOPts)
            if(attachments){
                msgOPts['attachments']=attachments;
            }
        const response = await  this.#transport.sendMail(msgOPts);
        return response

        } catch(exception){
            console.log(exception);
            console.log("error sending email")
            throw{status : 500 , message: "error sending email ", detail : exception}
        }
    }
}
const mailSvc = new MailService()
module.exports  = mailSvc;