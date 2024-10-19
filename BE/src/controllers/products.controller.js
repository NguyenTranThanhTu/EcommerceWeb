const productsService = require("../services/products.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

async function createProduct(req, res, next) {
  if (!req.body?.ProductName || typeof req.body.ProductName !== "string") {
    return next(new ApiError(400, "Name should be a non-empty string"));
  }
  if (!req.body?.CategoryID) {
    return next(new ApiError(400, "Category should be a non-empty string"));
  }
  if (!req.body?.product_status_id) {
    return next(new ApiError(400, "Product status should be a non-empty string"));
  }
  if (!req.body?.title) {
    return next(new ApiError(400, "Title should be a non-empty string"));
  }

  try {
    const product = await productsService.createProduct({
      ...req.body,
      UserID: req.user.UserID,
      CreatedBy: req.user.UserID,
      files: req.files ? req.files : null,
    });

    if (product.message) {
      return res.status(409).json(JSend.error({ message: product.message })); // Product đã tồn tại
    }

    return res
      .status(201)
      .set({
        Location: `${req.baseUrl}/${product.id}`,
      })
      .json(JSend.success({ product }));
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while creating the product")
    );
  }
}

async function getProductsByFilter(req, res, next) {
  let result = {
    products: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 5,
    },
  };

  try {
    result = await productsService.getManyProducts(req.query);
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while retrieving products")
    );
  }
  return res.json(
    JSend.success({
      products: result.products,
      metadata: result.metadata,
    })
  );
}

async function getProduct(req, res, next) {
  const { id } = req.params;

  try {
    const product = await productsService.getProductById(id);
    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }
    return res.json(JSend.success({ product }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error retrieving product with id=${id}`));
  }
}

async function updateProduct(req, res, next) {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  const { id } = req.params;

  try {
    const updated = await productsService.updateProduct(id, {
      ...req.body,
      UpdatedBy: req.user.UserID,
      files: req.files ? req.files : null,
    });
    if (!updated) {
      return next(new ApiError(404, "Product not found"));
    }
    return res.json(
      JSend.success({
        product: updated,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error updating product with id=${id}`));
  }
}

async function deleteProduct(req, res, next) {
  const { id } = req.params;

  try {
    const deleted = await productsService.deleteProduct(id, req.user.UserID);
    if (!deleted) {
      return next(new ApiError(404, "Product not found"));
    }
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Could not delete product with id=${id}`));
  }
}

async function deleteMultiProducts(req, res, next) {
  const { productIds } = req.body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return next(new ApiError(400, "Invalid product IDs"));
  }

  try {
    await deleteProductsByIds(productIds, req.user.UserID);
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while removing products")
    );
  }
}

module.exports = {
  getProductsByFilter,
  deleteMultiProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
