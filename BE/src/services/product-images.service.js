const knex = require("../database/knex");
const Paginator = require("./paginator");
const fs = require('fs');
const path = require('path');

function productImageRepository() {
  return knex("productImages");
}

function readProductImage(payload) {
  return {
    ProductID: payload.ProductID,
    ImageUrl: payload.ImageUrl,
  };
}

// Hàm để xóa file ảnh từ đường dẫn trên server
function deleteImageFromServer(imageUrl) {
  const filePath = path.join(__dirname, "../public/uploads/products", imageUrl); // Đảm bảo đường dẫn đúng với nơi lưu ảnh
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting image file: ${filePath}`, err);
    } else {
      console.log(`Image file deleted: ${filePath}`);
    }
  });
}

async function createProductImage(payload) {
  const productImage = readProductImage(payload);
  const [id] = await productImageRepository().insert(productImage);
  return { id, ...productImage };
}

async function getManyProductImages(query) {
  const { productImage_name, page = 1, limit = 5 } = query;
  const paginator = new Paginator(page, limit);
  let results = await productImageRepository()
    .where("IsDeleted", false)
    .where((builder) => {
      if (productImage_name) {
        builder.where("productImage_name", "like", `%${productImage_name}%`);
      }
    })
    .select(
      knex.raw("count(ImageID) OVER() AS recordCount"),
      "ProductID",
      "ImageUrl",
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
    productImages: results,
    metadata: paginator.getMetadata(totalRecords),
  };
}

async function getProductImagesByProductId(id) {
  return productImageRepository()
    .where("ProductID", id)
    .andWhere("IsDeleted", false)
    .select("*");
}

async function updateProductImage(id, payload) {
  const updatedProductImage = await productImageRepository()
    .where("ImageID", id)
    .andWhere("IsDeleted", false)
    .select("*")
    .first();
    
  if (!updatedProductImage) {
    return null;
  }
  
  const update = readProductImage(payload);
  await productImageRepository().where("ImageID", id).update(update);
  
  return { ...updatedProductImage, ...update };
}

async function deleteProductImage(id, UserID) {
  const deletedProductImage = await productImageRepository()
    .where("ImageID", id)
    .first();
    
  if (!deletedProductImage) {
    return null;
  }

  deleteImageFromServer(deletedProductImage.ImageUrl);
  
  await productImageRepository().where("ImageID", id).update({ IsDeleted: true, UpdatedAt: UserID });
  
  return deletedProductImage;
}

async function deleteProductImagesByIds(productImageIds, UserID) {
  const productImages = await productImageRepository().whereIn('ImageID', productImageIds).select("ImageUrl");

  productImages.forEach((image) => {
    deleteImageFromServer(image.ImageUrl);
  });

  await productImageRepository().whereIn('ImageID', productImageIds).update({ IsDeleted: true, UpdatedAt: UserID });
}

module.exports = {
  getManyProductImages,
  deleteProductImagesByIds,
  getProductImagesByProductId,
  createProductImage,
  updateProductImage,
  deleteProductImage,
};
