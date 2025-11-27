const router = require("express").Router();
const userCtrl = require("./user.controller");
const logincheck = require("../../middlewares/logincheck.js");
const hasPermission = require("../../middlewares/rbac.middleware");


router.use(logincheck);


router.get("/me", userCtrl.getProfile);
router.put("/me", userCtrl.updateProfile);


router.get("/", hasPermission(["admin"]), userCtrl.getAllUsers);
router.post("/", hasPermission(["admin"]), userCtrl.createUser);
router.delete("/:id", hasPermission(["admin"]), userCtrl.deleteUser);

module.exports = router;
