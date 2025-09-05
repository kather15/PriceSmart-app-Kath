import express from "express";
import productsController from "../controllers/productsController.js";

const router = express.Router();

router
  .route("/")
  .get(productsController.getProducts)
  .post(productsController.createProducts);

router
  .route("/:id")
  .get(productsController.getSingleProduct)
  .put(productsController.updateProducts)
  .delete(productsController.deleteProducts);

export default router;
