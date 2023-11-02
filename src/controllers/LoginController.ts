import { Request, Response, NextFunction, Router } from "express";
import UsersService from "../services/UsersService";
import EmailService from "../services/EmailService";

const loginController = Router();

loginController.post('/V1/auth/login',
  async (req: Request, res: Response, next: NextFunction)=> {
    await UsersService.login(req, res, next);   
  }
);

loginController.post('/V1/auth/forgotten-password-nodemailer',
  async (req: Request, res: Response, next: NextFunction)=> {
    await EmailService.getPasswordNodemailer(req, res, next);   
  }
);

loginController.post('/V1/auth/forgotten-password-resend',
  async (req: Request, res: Response, next: NextFunction)=> {
    await EmailService.getPasswordResend(req, res, next);   
  }
);

export default loginController;