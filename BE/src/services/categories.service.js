const knex = require("../database/knex");
const Paginator = require("./paginator");

function categoryRepository() {
  return knex("categories");
}

function readCategory(payload) {
  return {
    CategoryName: payload.CategoryName,
    Description: payload.Description,
    CreatedBy: payload.CreatedBy,
    UpdatedAt: new Date(),
    UpdatedBy: payload.UpdatedBy,
    IsDeleted: payload.IsDeleted,
  };
}

async function createCategory(payload) {
  const { CategoryName } = payload;

  const existingCategory = await categoryRepository()
    .where("CategoryName", CategoryName)
    .select("*")
    .first();

  if (existingCategory) {
    if (existingCategory.IsDeleted) {
      const category = readCategory(payload);
      await categoryRepository()
        .where("CategoryID", existingCategory.CategoryID)
        .update({ ...category, IsDeleted: false });
      return { CategoryID: existingCategory.CategoryID, ...category };
    }

    return { message: "Category already exists and is active." };
  }

  const category = readCategory(payload);
  const [CategoryID] = await categoryRepository().insert(category);
  return { CategoryID, ...category };
}

async function getManyCategories(query) {
  const { search, page = 1, limit = 5 } = query;
  const paginator = new Paginator(page, limit);

  let results = await categoryRepository()
    .where("IsDeleted", false)
    .where((builder) => {
      if (search) {
        builder.where("CategoryName", "like", `%${search}%`);
      }
    })
    .select(
      knex.raw("count(CategoryID) OVER() AS recordCount"),
      "CategoryID",
      "CategoryName",
      "Description",
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
    categories: results,
    metadata: paginator.getMetadata(totalRecords),
  };
}

async function getCategoryById(CategoryID) {
  return categoryRepository()
    .where("CategoryID", CategoryID)
    .andWhere("IsDeleted", false)
    .select(
      "CategoryID",
      "CategoryName",
      "Description",
      "CreatedAt",
      "CreatedBy",
      "UpdatedAt",
      "UpdatedBy"
    )
    .first();
}

async function updateCategory(CategoryID, payload) {
  const updatedCategory = await categoryRepository()
    .where("CategoryID", CategoryID)
    .andWhere("IsDeleted", false)
    .select("*")
    .first();

  if (!updatedCategory) {
    return null;
  }

  const update = readCategory(payload);
  await categoryRepository().where("CategoryID", CategoryID).update(update);

  return { ...updatedCategory, ...update };
}

async function deleteCategory(CategoryID, UserID) {
  const deletedCategory = await categoryRepository()
    .where("CategoryID", CategoryID)
    .first();

  if (!deletedCategory) {
    return null;
  }

  await categoryRepository()
    .where("CategoryID", CategoryID)
    .update({ IsDeleted: true, UpdatedAt: UserID });

  return deletedCategory;
}

async function deleteCategoriesByIds(categoryIds, UserID) {
  await categoryRepository()
    .whereIn("CategoryID", categoryIds)
    .update({ IsDeleted: true, UpdatedAt: UserID });
}

module.exports = {
  getManyCategories,
  deleteCategoriesByIds,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
