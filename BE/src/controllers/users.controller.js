const usersService = require("../services/users.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

async function createUser(req, res, next) {
  if (!req.body?.Email || typeof req.body.Email !== "string") {
    return next(new ApiError(400, "Name should be a non-empty string"));
  }
  if (!req.body?.PhoneNumber || typeof req.body.PhoneNumber !== "string") {
    return next(new ApiError(400, "Phone should be a non-empty string"));
  }
  if (!req.body?.RoleIds) {
    return next(new ApiError(400, "Roles should be a non-empty string"));
  }

  try {
    const user = await usersService.createUser({
      ...req.body,
      CreatedBy: req.user.UserID,
      AvatarUrl: req.file ? `/public/uploads/avatars/${req.file.filename}` : null,
    });

    if (user.message) {
      return res.status(409).json(JSend.error({ message: user.message })); // User đã tồn tại
    }

    return res
      .status(201)
      .set({
        Location: `${req.baseUrl}/${user.id}`,
      })
      .json(JSend.success({ user }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "An error occurred while creating the user"));
  }
}

async function getUsersByFilter(req, res, next) {
  let result = {
    users: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 5,
    },
  };

  try {
    result = await usersService.getManyUsers(req.query);
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "An error occurred while retrieving users"));
  }
  return res.json(
    JSend.success({
      users: result.users,
      metadata: result.metadata,
    })
  );
}

async function getUser(req, res, next) {
  const { id } = req.params;

  try {
    const user = await usersService.getUserById(id);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }
    return res.json(JSend.success({ user }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error retrieving user with id=${id}`));
  }
}

async function updateUser(req, res, next) {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  const { id } = req.params;

  try {
    const updated = await usersService.updateUser(id, {
      ...req.body,
      UpdatedBy: req.user.UserID,
      avatar: req.file ? `/public/uploads/avatars/${req.file.filename}` : null,
    });
    if (!updated) {
      return next(new ApiError(404, "User not found"));
    }
    return res.json(
      JSend.success({
        user: updated,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error updating user with id=${id}`));
  }
}

async function deleteUser(req, res, next) {
  const { id } = req.params;

  try {
    const deleted = await usersService.deleteUser(id, req.user.UserID);
    if (!deleted) {
      return next(new ApiError(404, "User not found"));
    }
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Could not delete user with id=${id}`));
  }
}

async function deleteMultiUsers(req, res, next) {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return next(new ApiError(400, "Invalid user IDs"));
  }

  try {
    await deleteUsersByIds(userIds, req.user.UserID);
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "An error occurred while removing users"));
  }
}

module.exports = {
  getUsersByFilter,
  deleteMultiUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
