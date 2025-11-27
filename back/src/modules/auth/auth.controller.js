const { StatusType } = require("../../config/constant.config");
const userSvc = require("../user/user.service");
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const mailSvc = require("../../services/mail.service")

class AuthController{
    sendActivationEmail = async ({
        name,
        email,
        token,
        sub = "Activate your account !!",
      }) => {
        try {
          await mailSvc.sendEmail({
            to: email,
            sub: sub,
            message: `
                    Dear ${name}, <br/>
                    <p> Your account has been registered sucessfully .</p>
                    <p> Please click on the link below  or copy paste the url in the browser to activate your account :</p>
                    <a href = "${process.env.FRONTEND_URL + "auth/activate/" + token}">${
              process.env.FRONTEND_URL + "auth/activate/" + token
            }</a>
                    <br>
    
                    <p>-------------------------------------------</p>
                    <p> Regards,</p>
                    <p> system Admin </p>
                    <p> ${process.env.SMTP_FROM}</p>
              
                    <p>
                    <small><em>Please do not reply to this email.</em></small>
                    </p>
                    <p> 
                    `,
          });
        } catch (exception) {
          throw exception;
        }
      };
    generateUserActivationToken = (data) => {
    data.activationToken = randomStringGenerator(100);
    data.activateFor = new Date(
      Date.now() + process.env.TOKEN_ACTIVE_TIME * 60 * 60 * 1000
    );
    return data;
  };
    activateUser = async (req, res , next) => {
        try{
           
            const { token } = req.params;
        
        // Token length validation
        if (token.length !== 100) {
            throw { status: 422, message: "Invalid Token" };
        }

        // Retrieve the user by token
        const user = await userSvc.getSingleUserByFilter({
            activationToken: token
        });

        // If user is not found, respond with 404
        if (!user) {
            throw { status: 404, message: "User not found or already activated" };
        }

        // Token expiration check
        const today = Date.now();
        const activateFor = user.activateFor.getTime();
        if (activateFor < today) {
            throw { status: 422, message: "Token expired." };
        }

        // Activate user and clear token to prevent reuse
        user.activationToken = null;
        user.activateFor = null;
        user.status = "ACTIVE";
        await user.save();

        res.json({
            result: null,
            message: "Your account has been activated successfully."
        });
        }
        catch(exception){
            next(exception)
        }
       
        
    }
    login = async (req, res, next) => {
        try {
            const { email, password } = req.body;
            const user = await userSvc.getSingleUserByFilter({ email: email });

            if (!user) {
                throw { status: 404, message: "User not found" };
            }

            if (bcrypt.compareSync(password, user.password)) {
                if (user.status === "ACTIVE") {
                    const token = jwt.sign(
                        { sub: user._id },
                         process.env.JWT_SECRET
                        // ,{
                        //     expiresIn : "1 day",
                        //     algorithm:
                        // }



                    );
                    const refreshToken = jwt.sign({
                        sub: user._id ,
                        type: "refresh"
                    }, process.env.JWT_SECRET,{
                        expiresIn : "1 day"
                    })
                    res.json({
                        result: {
                            userDetail: {
                                _id: user._id,
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                image:user.image
                            },
                            token:{ token, refreshToken}
                        },
                        message: "Login successful",
                        meta: null
                    });
                } else {
                    throw { status: 422, message: "Your account has not been activated yet" };
                }
            } else {
                throw { status: 422, message: "Credentials do not match" };
            }
        } catch (exception) {
            next(exception);
        }
    }
     resendActivationToken = async (req,res,next) => {
     try{
        const {id} = req.params;
        let user = await userSvc.getSingleUserByFilter({
            _id:id 
        })
         if (!user) {
            return res.status(404).json({
                result: null,
                message: "User not found",
                meta: null
            });
        }

        user = this.generateUserActivationToken(user);
        await user.save()   // insertt or update
        await this.sendActivationEmail({
            email: user.email,
            name : user.name,
            token:user.activationToken,
            sub: " re-send , activate your account !!"

        })
        res.json({
            result : null,
            message:" a new activation link has been sent tp your registered email",
            meta : null
        })
     }   catch(exception){
        next(exception)

     }
    }
     refreshToken = async (req,res,next) => {
        try{

            let token = req.headers['authorization'] || null;
            if(!token){
                throw {status:401, message:"token required "}
            }
            token = token.split(" ").pop()
            const {sub , type} = jwt.verify(token, process.env.JWT_SECRET);
            if(!type || type!= 'refresh'){
                throw{status:401,message: "refresh token required"}
            }
            await userSvc.getSingleUserByFilter({
                _id:sub
            })
            const accesstoken = jwt.sign({ sub: sub }, process.env.JWT_SECRET
                // ,{
                //     expiresIn : "1 day",
                //     algorithm:
                // }



            );
            const refreshToken = jwt.sign({
                sub: sub ,
                type: "refresh"
            }, process.env.JWT_SECRET,{
                expiresIn : "1 day"
            })
            res.json({
                result: {
                    
                    token: accesstoken,
                    refreshToken: refreshToken
                },
                message: "token refresh  successful",
                meta: null
            });

        }catch(exception){
            next(exception)
        }
    }
}



module.exports = new AuthController()