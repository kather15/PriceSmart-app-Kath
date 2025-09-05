import CustomersModel from "../models/customers.js";
import EmployeesModel from "../models/employee.js";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

const loginController = {};

const maxAttempts = 3;
const lockTime = 15 * 60 * 1000; 

loginController.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let userFound;
    let userType;

    // 1. Validación Admin
    if (
      email === config.emailAdmin.email &&
      password === config.emailAdmin.password
    ) {
      userType = "admin"; // en minúscula pára ver si ingresaba la cuenta correcta
      userFound = { _id: "Admin" };
    } else {
      // 2. Empleado
      userFound = await EmployeesModel.findOne({ email });
      userType = "employee";

      // 3. Cliente
      if (!userFound) {
        userFound = await CustomersModel.findOne({ email });
        userType = "customer";
      }
    }

    // No se encontró usuario
    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }

    
    if (userType !== "admin") {
      if (userFound.lockTime && userFound.lockTime > Date.now()) {
        const minutosRestantes = Math.ceil(
          (userFound.lockTime - Date.now()) / 60000
        );
        return res.status(403).json({
          message: `Cuenta bloqueada. Intenta de nuevo en ${minutosRestantes} minutos`,
        });
      }

      // Validar contraseña
      const isMatch = await bcryptjs.compare(password, userFound.password);
      if (!isMatch) {
        userFound.loginAttempts = (userFound.loginAttempts || 0) + 1;

        if (userFound.loginAttempts >= maxAttempts) {
          userFound.lockTime = Date.now() + lockTime;
          await userFound.save();
          return res.status(403).json({ message: "Usuario bloqueado" });
        }

        await userFound.save();
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }

      // Reset de intentos fallidos
      userFound.loginAttempts = 0;
      userFound.lockTime = null;
      await userFound.save();
    }

    // 
    const token = jsonwebtoken.sign(
      { id: userFound._id, userType }, // userType ya está en minúsculas
      config.JWT.secret,
      { expiresIn: config.JWT.expiresIn }
    );

    // Guardar en cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    res.json({ message: "Login successful", userType });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default loginController;
