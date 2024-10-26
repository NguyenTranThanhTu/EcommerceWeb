const productImagesService = require("../services/product-images.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

async function createProductImage(req, res, next) {
  try {
    const image = await productImagesService.createProductImage({
      ...req.body,
    });

    return res
      .status(201)
      .set({
        Location: `${req.baseUrl}/${image.id}`,
      })
      .json(JSend.success({ image }));
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while creating the image")
    );
  }
}

async function getProductImagesByFilter(req, res, next) {
  let result = {
    productImages: [],
    metadata: {
      totalRecords: 0,
      firstPage: 1,
      lastPage: 1,
      page: 1,
      limit: 5,
    },
  };

  try {
    result = await productImagesService.getManyProductImages(req.query);
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while retrieving productImages")
    );
  }
  return res.json(
    JSend.success({
      productImages: result.productImages,
      metadata: result.metadata,
    })
  );
}

async function getProductImagesByProductId(req, res, next) {
  const { id } = req.params;
  try {
    const result = await productImagesService.getProductImagesByProductId(id);
    return res.json(JSend.success({ result }));
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while retrieving productImages")
    );
  }
  return res.json(
    JSend.success({
      productImages: result.productImages,
    })
  );
}

async function updateProductImage(req, res, next) {
  if (Object.keys(req.body).length === 0 && !req.file) {
    return next(new ApiError(400, "Data to update can not be empty"));
  }

  const { id } = req.params;

  try {
    const updated = await productImagesService.updateProductImage(id, {
      ...req.body,
    });
    if (!updated) {
      return next(new ApiError(404, "ProductImage not found"));
    }
    return res.json(
      JSend.success({
        image: updated,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error updating image with id=${id}`));
  }
}

async function deleteProductImage(req, res, next) {
  const { id } = req.params;

  try {
    const deleted = await productImagesService.deleteProductImage(id);
    if (!deleted) {
      return next(new ApiError(404, "ProductImage not found"));
    }
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Could not delete image with id=${id}`));
  }
}

async function deleteMultiProductImages(req, res, next) {
  const { profileIds } = req.body;

  if (!Array.isArray(profileIds) || profileIds.length === 0) {
    return next(new ApiError(400, "Invalid image IDs"));
  }

  try {
    await deleteProductImagesByIds(profileIds);
    return res.json(JSend.success());
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(500, "An error occurred while removing productImages")
    );
  }
}

module.exports = {
  getProductImagesByProductId,
  getProductImagesByFilter,
  deleteMultiProductImages,
  createProductImage,
  updateProductImage,
  deleteProductImage,
};
