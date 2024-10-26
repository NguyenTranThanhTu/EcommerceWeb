const express = require("express");
const cors = require("cors");
const categoriesRouter = require("./routes/categories.router");
const usersRouter = require("./routes/users.router");
const rolesRouter = require("./routes/roles.router");
const productsRouter = require("./routes/products.router");
const productImagesRouter = require("./routes/product-images.router");
const ordersRouter = require("./routes/orders.router");
const orderItemsRouter = require("./routes/order-items.router");
const cartsRouter = require("./routes/carts.router");
const authRouter = require("./routes/auth.router");
const {
  resourceNotFound,
  handleError,
} = require("./controllers/errors.controller");
const { specs, swaggerUi } = require("./docs/swagger");
const { methodNotAllowed } = require("./controllers/errors.controller");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/public", express.static("public"));

categoriesRouter.setup(app);
usersRouter.setup(app);
rolesRouter.setup(app);
productsRouter.setup(app);
productImagesRouter.setup(app);
ordersRouter.setup(app);
orderItemsRouter.setup(app);
cartsRouter.setup(app);
authRouter.setup(app);
app.all("*", methodNotAllowed);

// Handle 404 response
app.use(resourceNotFound);

// Define error-handling middleware last
app.use(handleError);

const users = {};

module.exports = app;
