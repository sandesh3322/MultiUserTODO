const router = require("express").Router();
const taskCtrl = require("./task.controller");
const logincheck = require("../../middlewares/logincheck");
const selfTaskChecker = require("../../middlewares/selftaskchecker");
const hasPermission = require("../../middlewares/rbac.middleware");
const { TaskCreateDTO } = require("./task.request");
const {bodyValidator} = require("../../middlewares/validator.middleware")

// Create task → only user
router.post("/", logincheck, bodyValidator(TaskCreateDTO), taskCtrl.createTask);

// Get all tasks → only admin
router.get("/", logincheck, hasPermission(["admin"]), taskCtrl.getAllTasks);

// Get my tasks → user
router.get("/mytasks", logincheck, taskCtrl.getMyTasks);
router.get("/admin/:id", logincheck, taskCtrl.admintaskview);

// Get single task → owner or admin
router.get("/:id", logincheck,selfTaskChecker, taskCtrl.getTaskById);

// Update task → owner only
router.put("/:id", logincheck, selfTaskChecker, bodyValidator(TaskCreateDTO), taskCtrl.updateTask);

// Delete task → owner only
router.delete("/:id", logincheck, selfTaskChecker, taskCtrl.deleteTask);

module.exports = router;
