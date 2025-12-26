const TaskModel = require("./../modules/task/task.model");

const selfTaskChecker = async (req, res, next) => {
  try {
    const user = req.authuser;

    // Admin bypass (optional)
    if (user.role === "admin") {
      return next();
    }

    // Get the task
    const task = await TaskModel.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if task belongs to logged-in user
    if (task.userId.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You can only modify your own task." });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = selfTaskChecker;
