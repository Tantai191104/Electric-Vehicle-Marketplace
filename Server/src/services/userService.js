import User from "../models/User.js";

export async function createUserService(data) {
  const user = new User(data);
  return user.save();
}

export async function listUsersService() {
  return User.find();
}

export async function getUserByIdService(id) {
  return User.findById(id);
}

export async function updateUserService(id, data) {
  return User.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function deleteUserService(id) {
  return User.findByIdAndDelete(id);
}

export async function findUserByEmailService(email) {
  return User.findOne({ email }).select("+password");
} 