const categoriesService = require("../services/categories.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");
const { Messages } = require("../const");

async function createCategory(req, res, next) {
  if (!req.body?.CategoryName || typeof req.body.CategoryName !== "string") {
    return next(new ApiError(400, "Name should be a non-empty string"));
  }

  try {
    const category = await categoriesService.createCategory({
      ...req.body,
      CreatedBy: req.user.UserID,
    });

    if (category.message) {
      return res.status(409).json(JSend.error({ message: category.message })); // Category đã tồn tại
    }

    return res
      .status(201)
      .set({
        Location: `${req.baseUrl}/${category.id}`,
      })
      .json(JSend.success({ category }));
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while creating the category")
    );
  }
}

async function getCategoriesByFilter(req, res, next) {
  let result = {
    categories: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 5,
    },
  };

  try {
    result = await categoriesService.getManyCategories(req.query);
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while retrieving categories")
    );
  }
  return res.json(
    JSend.success({
      categories: result.categories,
      metadata: result.metadata,
    })
  );
}

async function getCategory(req, res, next) {
  const { id } = req.params;

  try {
    const category = await categoriesService.getCategoryById(id);
    if (!category) {
      return next(new ApiError(404, "Category not found"));
    }
    return res.json(JSend.success({ category }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error retrieving category with id=${id}`));
  }
}

async function updateCategory(req, res, next) {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  const { id } = req.params;

  try {
    const updated = await categoriesService.updateCategory(id, {
      ...req.body,
      UpdatedBy: req.user.UserID,
    });
    if (!updated) {
      return next(new ApiError(404, "Category not found"));
    }
    return res.json(
      JSend.success(
        {
          category: updated,
        },
        Messages.UPDATED
      )
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error updating category with id=${id}`));
  }
}

async function deleteCategory(req, res, next) {
  const { id } = req.params;

  try {
    const deleted = await categoriesService.deleteCategory(
      id,
      req.user.UserID
    );
    if (!deleted) {
      return next(new ApiError(404, "Category not found"));
    }
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Could not delete category with id=${id}`));
  }
}

async function deleteMultiCategories(req, res, next) {
  const { categoryIds } = req.body;

  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    return next(new ApiError(400, "Invalid category IDs"));
  }

  try {
    await categoriesService.deleteCategoriesByIds(
      categoryIds,
      req.user.UserID
    );
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while removing categories")
    );
  }
}

module.exports = {
  getCategoriesByFilter,
  deleteMultiCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
