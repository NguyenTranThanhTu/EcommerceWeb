const knex = require("../database/knex");
const Paginator = require("./paginator");

function roleRepository() {
  return knex("roles");
}

function readRole(payload) {
  return {
    RoleName: payload.RoleName,
    CreatedBy: payload.CreatedBy,
  };
}

async function createRole(payload) {
  const { RoleName } = payload;
  
  const existingRole = await roleRepository()
    .where("RoleName", RoleName)
    .select("*")
    .first();

  if (existingRole) {
    if (existingRole.IsDeleted) {
      const role = readRole(payload);
      await roleRepository()
        .where("RoleID", existingRole.RoleID)
        .update({ ...role, IsDeleted: false });
      return { id: existingRole.RoleID, ...role };
    }
    
    return { message: "Role already exists and is active." };
  }

  const role = readRole(payload);
  const [id] = await roleRepository().insert(role);
  return { id, ...role };
}

async function getManyRoles(query) {
  const { RoleName, page = 1, limit = 5 } = query;
  const paginator = new Paginator(page, limit);
  let results = await roleRepository()
    .where((builder) => {
      if (RoleName) {
        builder.where("RoleName", "like", `%${RoleName}%`);
      }
    })
    .select(
      knex.raw("count(RoleID) OVER() AS recordCount"),
      "RoleID",
      "RoleName",
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
    roles: results,
    metadata: paginator.getMetadata(totalRecords),
  };
}

async function getRoleById(id) {
  return roleRepository()
    .where("RoleID", id)
    .select("*")
    .first();
}

async function updateRole(id, payload) {
  const updatedRole = await roleRepository()
    .where("RoleID", id)
    .select("*")
    .first();
    
  if (!updatedRole) {
    return null;
  }
  
  const update = readRole(payload);
  await roleRepository().where("RoleID", id).update(update);
  
  return { ...updatedRole, ...update };
}

async function deleteRole(id) {
  const role = await roleRepository()
    .where("RoleID", id)
    .select("*")
    .first();

  if (!role) {
    return null;
  }

  await roleRepository().where("RoleID", id).delete();

  return role;
}

async function deleteRolesByIds(roleIds) {
  await roleRepository().whereIn("RoleID", roleIds).delete();
}

module.exports = {
  getManyRoles,
  deleteRolesByIds,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
