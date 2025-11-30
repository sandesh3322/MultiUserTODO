const TaskModel = require("./task.model");

class TaskController {
  // Create task → only user
  createTask = async (req, res, next) => {
    try {
      const { title, description, status } = req.body;

      const task = new TaskModel({
        title,
        description,
        status: status || "pending",
        userId: req.authuser._id, // link task to logged-in user
      });

      await task.save();

      res.status(201).json({
        result: task,
        message: "Task created successfully",
        meta: null,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get all tasks → admin
  getAllTasks = async (req, res, next) => {
  try {
    // Fetch all tasks, populate user info (name, email)
    const tasks = await TaskModel.find()
      .populate("userId", "name email")  // populate user details
      .sort({ createdAt: -1 });         // optional: latest first

    res.json({
      result: tasks,
      message: "All tasks retrieved successfully",
      meta: {
        total: tasks.length
      },
    });
  } catch (error) {
    next(error);
  }
};


  // Get tasks of logged-in user
  getMyTasks = async (req, res, next) => {
    try {
      const tasks = await TaskModel.find({ userId: req.authuser._id });

      res.json({
        result: tasks,
        message: "Your tasks retrieved successfully",
        meta: null,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get single task → owner or admin
  getTaskById = async (req, res, next) => {
    try {
      const task = await TaskModel.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (
        req.authuser.role !== "admin" &&
        task.userId.toString() !== req.authuser._id.toString()
      ) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      res.json({
        result: task,
        message: "Task retrieved successfully",
        meta: null,
      });
    } catch (error) {
      next(error);
    }
  };

  // Update task → only owner
  updateTask = async (req, res, next) => {
    try {
      const task = await TaskModel.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (task.userId.toString() !== req.authuser._id.toString()) {
        return res.status(403).json({ message: "Unauthorized: only owner can update" });
      }

      Object.assign(task, req.body);
      await task.save();

      res.json({
        result: task,
        message: "Task updated successfully",
        meta: null,
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete task → only owner
  deleteTask = async (req, res, next) => {
    try {
      const task = await TaskModel.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (task.userId.toString() !== req.authuser._id.toString()) {
        return res.status(403).json({ message: "Unauthorized: only owner can delete" });
      }

      await task.deleteOne();

      res.json({
        result: null,
        message: "Task deleted successfully",
        meta: null,
      });
    } catch (error) {
      next(error);
    }
  };
  admintaskview = async(req, res, next)=>{
    try{
      const id = req.params.id
      const tasks = await TaskModel.find({ userId: id });
       res.json({
        result: tasks,
        message: "User tasks for admin retrieved successfully",
        meta: null,
      });


    }catch(exception){

    }
  }
}

module.exports = new TaskController();
