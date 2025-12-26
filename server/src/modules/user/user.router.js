const router = require("express").Router();
const userCtrl = require("./user.controller");
const logincheck = require("../../middlewares/logincheck");
const hasPermission = require("../../middlewares/rbac.middleware");
const { bodyValidator } = require("../../middlewares/validator.middleware.js");
const { UserCreateDTO } = require("./user.request.js");


router.use(logincheck);


router.get("/me", userCtrl.getProfile);
router.put("/me",bodyValidator(UserCreateDTO), userCtrl.updateProfile);


router.get("/", hasPermission(["admin"]), userCtrl.getAllUsers);
router.post("/", hasPermission(["admin"]),bodyValidator(UserCreateDTO), userCtrl.createUser);
router.delete("/:id", hasPermission(["admin"]), userCtrl.deleteUser);
router.put("/:id", hasPermission(["admin"]), userCtrl.adminupdate);

module.exports = router;
