const LoginDTO = require("./auth.request");
const authController = require("./auth.controller");
const { bodyValidator } = require("../../middlewares/validator.middleware");
const {userCtrl} = require("../user/user.controller.js")

authRouter.post("/register",bodyValidator(UserCreateDTO),userCtrl.createUser)
authRouter.get("/activate/:token", authController.activateUser)
authRouter.post("/login", bodyValidator(LoginDTO), authController.login);
authRouter.get("/resend-activationtoken/:id", authController.resendActivationToken);
authRouter.get("/refresh",authController.refreshToken)
module.exports = authRouter;
