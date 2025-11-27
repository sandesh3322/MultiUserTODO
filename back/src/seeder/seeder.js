const bcrypt = require('bcryptjs');
require("../config/db.config");
const UserModel = require('../modules/user/user.model');

const adminUsers = [
    {
        name: "sandesh admin",
        email: "sandezpoudel@gmail.com",
        password: bcrypt.hashSync("admin123", 10),
        role: "admin",
        status: "ACTIVE",
    },
    {
        name: "adddminn",
        email: "sandezpoudel+123@gmail.com",
        password: bcrypt.hashSync("admin123", 10),
        role: "admin",
        status: "ACTIVE"
    }
];

const seedUser = async () => {
    try {
        for (const user of adminUsers) {
            const userData = await UserModel.findOne({ email: user.email });
            if (!userData) {
                const userObj = new UserModel(user);
                await userObj.save();
                console.log(`Seeded user: ${user.email}`);
            } else {
                console.log(`User already exists: ${user.email}`);
            }
        }
        console.log("Seeding completed!");
        process.exit(0);
    } catch (exception) {
        console.error("Seeding error:", exception);
        process.exit(1);
    }
};

seedUser();
