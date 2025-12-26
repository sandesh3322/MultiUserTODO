const LoginDTO = require("./auth.request");
const authController = require("./auth.controller");
const { bodyValidator } = require("../../middlewares/validator.middleware");
const userCtrl = require("../user/user.controller")
const router = require("express").Router();
const {UserCreateDTO} = require("./../user/user.request.js");
const hasPermission = require("../../middlewares/rbac.middleware.js");
const logincheck = require("../../middlewares/logincheck.js")

router.get("/admin",logincheck,hasPermission(['admin']), authController.checkadmin)
router.post("/register",bodyValidator(UserCreateDTO), userCtrl.createUser)
router.get("/activate/:token", authController.activateUser)
router.post("/login", bodyValidator(LoginDTO), authController.login);
router.get("/resend-activationtoken/:token", authController.resendActivationToken);
router.get("/refresh",authController.refreshToken)
module.exports = router;
