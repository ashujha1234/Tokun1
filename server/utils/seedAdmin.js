const bcrypt = require("bcryptjs");
const AdminUser = require("../models/AdminUser");

async function seedDefaultAdmin() {
  const email = "sagar@gmail.com";
  const password = "Sagar1234@"; // EXACT as you asked

  const exists = await AdminUser.findOne({ email: email.toLowerCase() });

  if (exists) {
    console.log("✅ Default admin already exists:", exists.email);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const admin = await AdminUser.create({
    email: email.toLowerCase(),
    passwordHash,
    role: "ADMIN",
  });

  console.log("✅ Seeded default admin:", { email: admin.email, id: admin._id.toString() });
}

module.exports = { seedDefaultAdmin };
