const userSvc = require("./user.service");
const bcrypt = require("bcryptjs");
const mailSvc = require("../../services/mail.service")

class UserController {
  
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
 

  // Create a new user (for system/admin use only)
  createUser = async (req, res, next) => {
    try {
      const data = req.body;

      // hash password
      data.password =  bcrypt.hash(data.password, 10);
      
      data = this.generateUserActivationToken(data);
      data.status = "INACTIVE"
      data.role = "user"


      await userSvc.createUser(data);
      await this.sendActivationEmail({name: data.name , email:data.email , token:data.activationToken})


      res.json({
        result:data,
        message: "User created successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // Get logged-in user's profile
  getProfile = async (req, res, next) => {
    try {
      const user = await userSvc.getUserById(req.authuser._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        result: { _id: user._id, name: user.name, email: user.email, role: user.role, },
        message: "Profile fetched successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // Update logged-in user's profile
  updateProfile = async (req, res, next) => {
    try {
      const { name } = req.body;
      const updatedUser = await userSvc.getUserById(req.authuser._id);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // update allowed fields
      if (name) updatedUser.name = name;

      await updatedUser.save();

      res.json({
        result: { _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  // Admin: get all users
// Admin: get all users (unsanitized)
// Admin: get all users except password
getAllUsers = async (req, res, next) => {
    try {
      const users = await userSvc.getAllUsers();

      const cleaned = users.map(u => {
        const userObj = u.toObject();
        delete userObj.password;
        return userObj;
      });

      res.json({
        result: cleaned,
        message: "Users fetched successfully"
      });

    } catch (error) {
      next(error);
    }
};


  // Admin: delete user
  deleteUser = async (req, res, next) => {
    try {
      const userId = req.params.id;
      const user = await userSvc.getUserById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      await user.remove();
      res.json({ result: null, message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();
