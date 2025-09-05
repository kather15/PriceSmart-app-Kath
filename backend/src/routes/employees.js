import express from "express";
import employeeController from "../controllers/employeeControllers.js";

const router = express.Router();

router
  .route("/")
  .get(employeeController.getemployee)
  .post(employeeController.createemployee);

router
  .route("/:id")
  .put(employeeController.updateemployee)
  .delete(employeeController.deleteemployee);

export default router;
