const router = require("express").Router();
// const authRouter = require("../modules/auth/auth.router")
const userRouter = require("../modules/user/user.router")
// const taskRouter = require("../modules/task/task.router")

// router.use("/")
// router.use("/auth",authRouter)
router.use("/user", userRouter)
// router.use("/task", taskRouter)


module.exports = router;