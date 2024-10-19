const knex = require("../database/knex");
const Paginator = require("./paginator");
const bcrypt = require("bcryptjs");

function userRepository() {
  return knex("users");
}

function userRoleRepository() {
  return knex("userroles");
}

function readUser(payload) {
  return {
    Email: payload.Email,
    FullName: payload.FullName,
    AvatarUrl: payload.AvatarUrl,
    PhoneNumber: payload.PhoneNumber,
    Address: payload.Address,
    CreatedBy: payload.CreatedBy,
    UpdatedAt: new Date(),
    UpdatedBy: payload.UpdatedBy,
    IsDeleted: payload.IsDeleted,
  };
}

async function createUser(payload) {
  const { Email, Password, RoleIds, CreatedBy } = payload;

  // Kiểm tra xem người dùng đã tồn tại chưa
  const existingUser = await userRepository()
    .where("Email", Email)
    .select("*")
    .first();

  const roleArray =
    typeof RoleIds === "string" ? RoleIds.split(",").map(Number) : RoleIds;

  if (existingUser) {
    if (existingUser.IsDeleted) {
      const user = readUser(payload);

      // Khôi phục người dùng đã bị xóa
      await userRepository()
        .where("UserID", existingUser.UserID)
        .update({ ...user, IsDeleted: false });

      // Xóa và thêm lại các role trong bảng userroles
      await userRoleRepository()
        .where("UserID", existingUser.UserID)
        .delete();

      if (Array.isArray(roleArray) && roleArray.length !== 0) {
        await insertUserRoles(existingUser.UserID, roleArray, CreatedBy);
      }

      return { id: existingUser.UserID, ...user };
    }

    return { message: "User already exists and is active." };
  }

  // Mã hóa mật khẩu trước khi lưu
  const hashedPassword = await bcrypt.hash(Password, 10);
  const user = readUser(payload);
  user.PasswordHash = hashedPassword;

  const [id] = await userRepository().insert(user);

  if (Array.isArray(roleArray) && roleArray.length !== 0) {
    await insertUserRoles(id, roleArray, CreatedBy);
  }

  return { id, ...user };
}

// Hàm chèn role cho người dùng
async function insertUserRoles(UserID, RoleIds, CreatedBy) {
  const userRoles = RoleIds.map((RoleID) => ({
    UserID,
    RoleID,
    CreatedBy,
  }));

  await userRoleRepository().insert(userRoles);
}

async function getManyUsers(query) {
  const { Email, page = 1, limit = 5 } = query;
  const paginator = new Paginator(page, limit);
  let results = await userRepository()
    .where("IsDeleted", false)
    .where((builder) => {
      if (Email) {
        builder.where("Email", "like", `%${Email}%`);
      }
    })
    .select(
      knex.raw("count(UserID) OVER() AS recordCount"),
      "UserID",
      "Email",
      "FullName",
      "AvatarUrl",
      "PhoneNumber",
      "Address",
      "CreatedAt",
      "CreatedBy",
      "UpdatedAt",
      "UpdatedBy"
    )
    .limit(paginator.limit)
    .offset(paginator.offset);

  let totalRecords = 0;
  results = results.map((result) => {
    totalRecords = result.recordCount;
    delete result.recordCount;
    return result;
  });

  return {
    users: results,
    metadata: paginator.getMetadata(totalRecords),
  };
}

async function getUserById(id) {
  // Lấy thông tin người dùng
  const user = await userRepository()
    .where("UserID", id)
    .andWhere("IsDeleted", false)
    .select("*")
    .first();

  if (!user) {
    return null; // Trả về null nếu không tìm thấy user
  }

  // Lấy danh sách RoleIds từ bảng userroles
  const roles = await userRepository() // hoặc knex nếu không dùng repository
    .table("userroles") // Truy cập bảng userroles
    .where("UserID", id)
    .select("RoleID");

  // Biến đổi danh sách vai trò thành mảng RoleIds
  const RoleIds = roles.map((role) => role.RoleID);

  // Trả về thông tin người dùng kèm theo RoleIds
  return { ...user, RoleIds };
}

async function updateUser(id, payload) {
  const { Email, Password, RoleIds, UpdatedBy, avatar } = payload;

  // Kiểm tra xem người dùng đang cập nhật có tồn tại hay không
  const existingUser = await userRepository()
    .where("UserID", id)
    .andWhere("IsDeleted", false)
    .select("*")
    .first();

  if (!existingUser) {
    return { message: "User does not exist." };
  }

  // Kiểm tra xem Email mới có trùng với Email của người dùng khác hay không
  if (Email && Email !== existingUser.Email) {
    const EmailExists = await userRepository()
      .where("Email", Email)
      .andWhere("UserID", "<>", id)
      .andWhere("IsDeleted", false)
      .select("*")
      .first();

    if (EmailExists) {
      return { message: "Email already in use by another user." };
    }
  }

  // Cập nhật thông tin người dùng
  const update = readUser(payload);
  if (Password) {
    // Mã hóa mật khẩu trước khi lưu
    const hashedPassword = await bcrypt.hash(Password, 10);
    update.PasswordHash = hashedPassword;
  }

  if (avatar) {
    update.AvatarUrl = avatar;
  }

  // Cập nhật thông tin người dùng trong bảng users
  await userRepository().where("UserID", id).update(update);

  // Xóa và thêm lại các role trong bảng userroles
  await userRoleRepository().where("UserID", existingUser.UserID).delete();
  const roleArray =
    typeof RoleIds === "string" ? RoleIds.split(",").map(Number) : RoleIds;

  if (Array.isArray(roleArray) && roleArray.length !== 0) {
    await insertUserRoles(id, roleArray, UpdatedBy);
  }

  return { ...existingUser, ...update };
}

async function deleteUser(id, UserID) {
  const deletedUser = await userRepository().where("UserID", id).first();

  if (!deletedUser) {
    return null;
  }

  await userRepository()
    .where("UserID", id)
    .update({ IsDeleted: true, UpdatedAt: UserID });

  return deletedUser;
}

async function deleteUsersByIds(userIds, UserID) {
  await userRepository()
    .whereIn("UserID", userIds)
    .update({ IsDeleted: true, UpdatedAt: UserID });
}

module.exports = {
  getManyUsers,
  deleteUsersByIds,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
