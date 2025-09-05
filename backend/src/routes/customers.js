import express from "express";
import customersController from "../controllers/customersController.js";

const router = express.Router();

router
  .route("/")
  .get(customersController.getcustomers)
  .post(customersController.createcustomers);

router
  .route("/:id")
  .put(customersController.updatecustomers)
  .delete(customersController.deletecustomers);

export default router;
