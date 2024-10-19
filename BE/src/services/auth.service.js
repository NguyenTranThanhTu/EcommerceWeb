const knex = require("../database/knex");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function roleRepository() {
  return knex("roles");
}

function userRoleRepository() {
  return knex("userroles");
}

function userRepository() {
  return knex("users");
}

function readUser(payload) {
  return {
    Email: payload.Email,
    Password: payload.Password,
    PhoneNumber: payload.PhoneNumber,
    FullName: payload.FullName,
    AvatarUrl: payload.AvatarUrl,
    Address: payload.Address,
    CreatedAt: payload.CreatedAt,
    CreatedBy: payload.CreatedBy,
    UpdatedAt: payload.UpdatedAt,
    UpdatedBy: payload.UpdatedBy,
    IsDeleted: payload.IsDeleted,
  };
}

async function registerUser(payload) {
  const { Email, Password, PhoneNumber, FullName, AvatarUrl } = payload;
  // Kiểm tra xem Email đã tồn tại hay chưa
  const existingUser = await userRepository()
    .where("Email", Email)
    .select("*")
    .first();
  if (existingUser) {
    return { message: "Email is already taken" };
  }

  // Mã hóa mật khẩu trước khi lưu
  const hashedPassword = await bcrypt.hash(Password, 10);
  const newUser = {
    Email,
    PasswordHash: hashedPassword,
    PhoneNumber: PhoneNumber,
    FullName: FullName,
    AvatarUrl: AvatarUrl,
  };

  const [UserID] = await userRepository().insert(newUser);
  const userRole = await roleRepository()
    .where("RoleName", "User")
    .select("RoleID")
    .first();

  if (userRole) {
    // Gán vai trò mặc định 'User' cho người dùng mới
    await userRoleRepository().insert({
      UserID: UserID,
      RoleID: userRole.RoleID,
    });
  }
  return { user: { UserID, Email } };
}

async function loginUser({ Email, Password }) {
  const user = await userRepository().where("Email", Email).select("*").first();
  if (!user) {
    return { message: "Invalid Email or Password" };
  }

  // Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(Password, user.PasswordHash);
  if (!isPasswordValid) {
    return { message: "Invalid Email or Password" };
  }

  const roles = await userRoleRepository()
    .where("UserID", user.UserID)
    .join("roles", "userroles.RoleID", "roles.RoleID")
    .select("roles.RoleName");

  // Tạo token JWT
  const token = generateAccessToken(user, roles);

  // Tạo refresh token
  const refreshToken = jwt.sign(
    { UserID: user.UserID, Email: user.Email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  return {
    token,
    refreshToken,
    user: { UserID: user.UserID, Email: user.Email },
  };
}

async function refreshToken(refreshToken) {
  // Kiểm tra xem refreshToken có hợp lệ hay không
  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  const existingUser = await userRepository()
    .where("UserID", decoded.UserID)
    .select("*")
    .first();

  if (existingUser) {
    if (existingUser.IsDeleted) {
      // Nếu user đã bị xóa, trả về thông báo lỗi
      return { message: "User is inactive or deleted." };
    }

    // Tạo access token mới
    const user = readUser(existingUser);
    const accessToken = jwt.sign(
      { UserID: user.UserID, Email: user.Email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Trả về access token mới cùng với thông tin user
    return { token: accessToken, refreshToken, user };
  }

  return { message: "Invalid refresh token." };
}

function generateAccessToken(user, roles) {
  return jwt.sign(
    {
      UserID: user.UserID,
      Email: user.Email,
      roles: roles.map((role) => role.RoleName),
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

async function getInfo(UserID) {
  return userRepository()
    .where("UserID", UserID)
    .andWhere("IsDeleted", false)
    .select(
      "UserID",
      "Email",
      "FullName",
      "AvatarUrl",
      "PhoneNumber",
      "Address",
    )
    .first();
}

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  generateAccessToken,
  getInfo,
};
