const mongoose = require('mongoose');
const { Schema } = mongoose;

const TaskSchema = new Schema({
    title: {
        type: String,
        required: [true, "Task title is required"],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ["PENDING", "IN_PROGRESS", "COMPLETED"],
        default: "PENDING"
    },
    dueDate: {
        type: Date
    },
    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
        default: "MEDIUM"
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to the user who owns the task
        required: true
    }
}, {
    timestamps: true // Automatically creates createdAt and updatedAt
});

module.exports = mongoose.model("Task", TaskSchema);
