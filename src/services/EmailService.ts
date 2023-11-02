import { Request, Response, NextFunction, Router } from "express";
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import UserService from "./UsersService";
import { Constants } from "../shared/constants";

export default class EmailService {
    router = Router();

    public static async getPasswordNodemailer(req: Request, res: Response, next: NextFunction) {
        try {
            let result;
            result = await UserService.findUser(req, 'email');
            let response;
            if(result && Array.isArray(result) && result.length > 0) {
                this.sendEmailNodemailer(
                    result[0].email,
                    "Esta es tu contraseña de usuario",
                    `Gracias por utilizar nuestros servicios\nTu nombre de usuario es: ${result[0].userName} y tu contraseña es: ${result[0].password}`
                )
                response = {
                    message: "Se envio el correo con su contraseña correctamente",
                    result
                };
            } else {
                response = {
                    message: "No se encontro un usuario registrado con los datos ingresados",
                    result
                };
            }
            res.json(response);
        } catch (error) {
            next(error);
        }
    }

    public static async getPasswordResend(req: Request, res: Response, next: NextFunction) {
      try {
          let result;
          result = await UserService.findUser(req, 'email');
          let response;
          if(result && Array.isArray(result) && result.length > 0) {
              this.sendEmailResend(
                  result[0].email,
                  "Esta es tu contraseña de usuario",
                  `Gracias por utilizar nuestros servicios.\nTu nombre de usuario es: ${result[0].userName} y tu contraseña es: ${result[0].password}`
              )
              response = {
                  message: "Se envio el correo con su contraseña correctamente",
                  result
              };
          } else {
              response = {
                  message: "No se encontro un usuario registrado con los datos ingresados",
                  result
              };
          }
          res.json(response);
      } catch (error) {
          next(error);
      }
  }

  public static sendEmailNodemailer(remitent: string, subject: string, message: string) {
    // Configura el transporte SMTP para enviar el correo
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "15227a575dbc8c",
          pass: "92b94ac96b0fb1"
        }
      });
    const mailOptions = {
      from: 'tucorreo@gmail.com',
      to: remitent,
      subject,
      text: message
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar el correo:', error);
      } else {
        console.log('Correo enviado con éxito:', info.response);
      }
    });
  }

  public static sendEmailResend(remitent: string, subject: string, message: string) {
    const resend = new Resend(Constants.apikeyResend);
    (async function () {
      try {
        const data = await resend.emails.send({
          from: 'DataWarehouse <onboarding@resend.dev>',
          to: [remitent],
          subject,
          html: `<strong>${message}<strong>`,
        });
      } catch (error) {
        console.error(error);
      }
    })();
  }
}