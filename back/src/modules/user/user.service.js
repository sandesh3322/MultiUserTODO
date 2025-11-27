const UserModel = require("./user.model");

class UserService {
  createUser(data) {
    const user = new UserModel(data);
    return user.save();
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
