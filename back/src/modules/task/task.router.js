const router = require("express").Router();
const taskCtrl = require("./task.controller");
const logincheck = require("../../middlewares/logincheck.middleware");
const selfTaskChecker = require("./selfTaskChecker");
const hasPermission = require("../../middlewares/rbac.middleware");

// Create task → only user
router.post("/", logincheck, taskCtrl.createTask);

// Get all tasks → only admin
router.get("/", logincheck, hasPermission(["admin"]), taskCtrl.getAllTasks);

// Get my tasks → user
router.get("/mytasks", logincheck, hasPermission(["user"]), taskCtrl.getMyTasks);

// Get single task → owner or admin
router.get("/:id", logincheck,selfTaskChecker, taskCtrl.getTaskById);

// Update task → owner only
router.put("/:id", logincheck, selfTaskChecker, taskCtrl.updateTask);

// Delete task → owner only
router.delete("/:id", logincheck, selfTaskChecker, taskCtrl.deleteTask);

module.exports = router;
