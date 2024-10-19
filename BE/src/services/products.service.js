const knex = require("../database/knex");
const Paginator = require("./paginator");

function productImageRepository() {
  return knex("productImages");
}

function productRepository() {
  return knex("products");
}

function readProduct(payload) {
  return {
    UserID: payload.UserID,
    ProductName: payload.ProductName,
    CategoryID: payload.CategoryID,
    Description: payload.Description,
    Price: payload.Price,
    StockQuantity: payload.StockQuantity,
    CreatedBy: payload.CreatedBy,
    UpdatedAt: new Date(),
    UpdatedBy: payload.UpdatedBy,
    IsDeleted: payload.IsDeleted,
  };
}

async function createProduct(payload) {
  const { ProductName, files, CreatedBy } = payload;

  const existingProduct = await productRepository()
    .where("ProductName", ProductName)
    .select("*")
    .first();

  if (existingProduct) {
    if (existingProduct.IsDeleted) {
      const product = readProduct(payload);
      await productRepository()
        .where("ProductID", existingProduct.ProductID)
        .update({ ...product, IsDeleted: false });

      await productImageRepository()
        .where("ProductID", existingProduct.ProductID)
        .delete();

      if (Array.isArray(files) && files.length !== 0) {
        const fileNames = files.map((file) => file.filename);
        await insertImages(existingProduct.ProductID, fileNames, CreatedBy);
      }
      return { id: existingProduct.ProductID, ...product };
    }
  }

  const product = readProduct(payload);
  const [id] = await productRepository().insert(product);
  if (Array.isArray(files) && files.length !== 0) {
    const fileNames = files.map((file) => file.filename);
    await insertImages(id, fileNames, CreatedBy);
  }
  return { id, ...product };
}

// Hàm chèn image cho sản phẩm
async function insertImages(ProductID, fileNames, CreatedBy) {
  const userRoles = fileNames.map((fileName) => ({
    ProductID,
    ImageUrl: `/public/uploads/products/${fileName}`,
    CreatedBy,
  }));

  await productImageRepository().insert(userRoles);
}

async function getManyProducts(query) {
  const { ProductName, page = 1, limit = 5, sort } = query;
  const paginator = new Paginator(page, limit);

  const queryBuilder = productRepository()
    .from("products as p")
    .where("p.IsDeleted", false)
    .where((builder) => {
      if (ProductName) {
        builder.where("p.ProductName", "like", `%${ProductName}%`);
      }
    })
    .select(
      knex.raw("count(ProductID) OVER() AS recordCount"),
      "p.ProductID",
      "c.CategoryName",
      "p.ProductName",
      "p.Description",
      "p.Price",
      "p.StockQuantity",
      "u.FullName as created_name",
      "p.CreatedAt",
      "p.UpdatedAt"
    )
    .leftJoin("categories as c", "p.CategoryID", "c.CategoryID")
    .leftJoin("users as u", "p.UserID", "u.UserID")
    .limit(paginator.limit)
    .offset(paginator.offset);

  if (sort) {
    const [sortField, sortOrder] = sort.split(".");
    queryBuilder.orderBy(`p.${sortField}`, sortOrder);
  }

  let results = await queryBuilder;
  let totalRecords = 0;
  results = results.map((result) => {
    totalRecords = result.recordCount;
    delete result.recordCount;
    return result;
  });

  return {
    products: results,
    metadata: paginator.getMetadata(totalRecords),
  };
}

async function getProductById(id) {
  return productRepository()
    .from("products as p")
    .where("p.ProductID", id)
    .andWhere("p.IsDeleted", false)
    .select(
      knex.raw("count(ProductID) OVER() AS recordCount"),
      "p.ProductID",
      "p.CategoryID",
      "c.CategoryName",
      "p.ProductName",
      "p.Description",
      "p.Price",
      "p.StockQuantity",
      "u.FullName as created_name",
      "p.CreatedAt",
      "p.UpdatedAt"
    )
    .leftJoin("categories as c", "p.CategoryID", "c.CategoryID")
    .leftJoin("users as u", "p.UserID", "u.UserID")
    .first();
}

async function updateProduct(id, payload) {
  const { files, UpdatedBy } = payload;
  const updatedProduct = await productRepository()
    .where("ProductID", id)
    .andWhere("IsDeleted", false)
    .select("*")
    .first();

  if (!updatedProduct) {
    return null;
  }

  const update = readProduct(payload);
  await productRepository().where("ProductID", id).update(update);

  if (Array.isArray(files) && files.length !== 0) {
    const fileNames = files.map((file) => file.filename);
    await insertImages(id, fileNames, UpdatedBy);
  }
  return { ...updatedProduct, ...update };
}

async function deleteProduct(id, UserID) {
  const deletedProduct = await productRepository()
    .where("ProductID", id)
    .first();

  if (!deletedProduct) {
    return null;
  }

  await productRepository()
    .where("ProductID", id)
    .update({ IsDeleted: true, UpdatedAt: UserID });

  return deletedProduct;
}

async function deleteProductsByIds(productIds, UserID) {
  await productRepository()
    .whereIn("ProductID", productIds)
    .update({ IsDeleted: true, UpdatedAt: UserID });
}

module.exports = {
  getManyProducts,
  deleteProductsByIds,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
