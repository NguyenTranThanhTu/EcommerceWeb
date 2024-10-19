const rolesService = require("../services/roles.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

async function createRole(req, res, next) {
  if (!req.body?.RoleName || typeof req.body.RoleName !== "string") {
    return next(new ApiError(400, "Name should be a non-empty string"));
  }

  try {
    const role = await rolesService.createRole({
      ...req.body,
      CreatedBy: req.user.UserID
    });

    if (role.message) {
      return res.status(409).json(JSend.error({ message: role.message })); // Role đã tồn tại
    }

    return res
      .status(201)
      .set({
        Location: `${req.baseUrl}/${role.id}`,
      })
      .json(JSend.success({ role }));
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while creating the role")
    );
  }
}

async function getRolesByFilter(req, res, next) {
  let result = {
    roles: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 5,
    },
  };

  try {
    result = await rolesService.getManyRoles(req.query);
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while retrieving roles")
    );
  }
  return res.json(
    JSend.success({
      roles: result.roles,
      metadata: result.metadata,
    })
  );
}

async function getRole(req, res, next) {
  const { id } = req.params;

  try {
    const role = await rolesService.getRoleById(id);
    if (!role) {
      return next(new ApiError(404, "Role not found"));
    }
    return res.json(JSend.success({ role }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error retrieving role with id=${id}`));
  }
}

async function updateRole(req, res, next) {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  const { id } = req.params;

  try {
    const updated = await rolesService.updateRole(id, {
      ...req.body,
      UpdatedBy: req.user.UserID
    });
    if (!updated) {
      return next(new ApiError(404, "Role not found"));
    }
    return res.json(
      JSend.success({
        role: updated,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error updating role with id=${id}`));
  }
}

async function deleteRole(req, res, next) {
  const { id } = req.params;

  try {
    const deleted = await rolesService.deleteRole(id, req.user.UserID);
    if (!deleted) {
      return next(new ApiError(404, "Role not found"));
    }
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Could not delete role with id=${id}`));
  }
}

async function deleteMultiRoles(req, res, next) {
  const { roleIds } = req.body;

  if (!Array.isArray(roleIds) || roleIds.length === 0) {
    return next(new ApiError(400, "Invalid role IDs"));
  }

  try {
    await deleteRolesByIds(roleIds, req.user.UserID);
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while removing roles")
    );
  }
}

module.exports = {
  getRolesByFilter,
  deleteMultiRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
};
