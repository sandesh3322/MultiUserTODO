const UserModel = require("./user.model");

class UserService {
  async createUser(data) {
    try {
      const user = new UserModel(data);
      const savedUser = await user.save();
      return savedUser;
    } catch (error) {
      // Handle Mongo unique index errors
      if (error.code === 11000) {
        const fields = Object.keys(error.keyPattern || {});
        const detail = {};
        fields.forEach((field) => {
          detail[field] = `${field} must be unique`;
        });
        throw { status: 400, message: "Validation failed: Unique field violation", detail };
      }

      // Handle Mongoose validation errors
      if (error.name === "ValidationError") {
        const detail = {};
        Object.keys(error.errors || {}).forEach((key) => {
          detail[key] = error.errors[key].message;
        });
        throw { status: 400, message: "Validation failed", detail };
      }

      // Unknown error
      throw error;
    }
  }

  getSingleUserByFilter(filter) {
    return UserModel.findOne(filter);
  }

  getUserById(id) {
    return UserModel.findById(id);
  }

  getAllUsers() {
    return UserModel.find();
  }
}

module.exports = new UserService();
