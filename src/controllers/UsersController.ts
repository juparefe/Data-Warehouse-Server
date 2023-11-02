import { Request, Response, NextFunction, Router } from "express";
import UsersService from "../services/UsersService";
import { authToken, authRole } from "../security/auth";

const userController = Router();

userController.get("/V1/data/users", authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await UsersService.getUsers(req, res, next);
  }
);

userController.get("/V1/data/user/:id", authToken, authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await UsersService.getUserById(req, res, next);
  }  
);

userController.post("/V1/data/user",
  async (req: Request, res: Response, next: NextFunction) => {
    await UsersService.addUser(req, res, next);
  }  
);

userController.put("/V1/data/user/:id", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await UsersService.updateUser(req, res, next);
  }  
);

userController.patch("/V1/data/user/role", authToken, authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await UsersService.updateUserRoles(req, res, next);
  }  
);

userController.delete("/V1/data/user/:id", authToken, authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await UsersService.deleteUser(req, res, next);
  }  
);

export default userController;
