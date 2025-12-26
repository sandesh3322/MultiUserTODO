const userSvc = require("./user.service");
const bcrypt = require("bcryptjs");
const mailSvc = require("../../services/mail.service")
require('dotenv').config()

class UserController {
   randomStringGenerator= (n) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars[randomIndex];
  }
  return result;
}
  
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
    data.activationToken = this.randomStringGenerator(100);
    data.activateFor = new Date(
      Date.now() + process.env.TOKEN_ACTIVE_TIME * 60 * 60 * 1000
    );
    return data;
  };
 

  // Create a new user (for system/admin use only)
 createUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body; // <--- destructure here
    console.log(req.body);

    // 1️⃣ Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return next({
        status: 400,
        message: "All fields (name, email, password, confirmPassword) are required",
        detail: null,
      });
    }

    // 2️⃣ Confirm password check
    // if (password !== confirmPassword) {
    //   return next({
    //     status: 400,
    //     message: "Password and confirm password do not match",
    //     detail: null,
    //   });
    // }

    // 3️⃣ Check if user already exists
    const existingUser = await userSvc.getSingleUserByFilter({email:email});
    if (existingUser) {
      return next({
        status: 400,
        message: "Email is already registered",
        detail: { email: "Email must be unique" },
      });
    }

    // 4️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5️⃣ Prepare user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      status: "INACTIVE",
      role: "user",
    };

    this.generateUserActivationToken(userData); // adds activationToken & activateFor

    // 6️⃣ Save user to DB
    const newUser = await userSvc.createUser(userData);

    // 7️⃣ Send activation email
    try {
      await this.sendActivationEmail({
        name: newUser.name,
        email: newUser.email,
        token: newUser.activationToken,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(201).json({
        result: { user: newUser },
        message: "User created but failed to send activation email",
        meta: emailError.message,
      });
    }
    let userdata = {
      name: newUser.name,
      email: newUser.email,
      status: newUser.status,
      created_at : newUser.createdAt,
      updated_at: newUser.updatedAt

    }

    // 8️⃣ Success response
    res.status(201).json({
      result: { user: userdata },
      message: "User created successfully. Please check your email to activate your account.",
      meta: null,
    });

  } catch (error) {
    console.error("Unexpected error in createUser:", error);
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
  adminupdate = async (req, res, next) => {
    try {
      const { name } = req.body;
      const params = req.params.id;
      const updatedUser = await userSvc.getUserById(params);

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

      await user.deleteOne();
      res.json({ result: null, message: "User deleted successfully" });
    } catch (error) {
      next(error);
    }
  };
  
}

module.exports = new UserController();
