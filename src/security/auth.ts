import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Select } from '../database/actions';
import { RequestHeadersDto } from '../models/RequestHeadersDto';

const firma = 'Firma_para_proyecto';

declare global {
    namespace Express {
        interface Request {
            user?: any;
            roleAdmin?: any;
            userId?: any
        }
    }
}

export const generateToken = (data: any) => {
    return jwt.sign(data, firma);
}

export const authToken = (req: Request, res: Response, next: NextFunction) => {
    try {
       const requestHeaders = new RequestHeadersDto(req)
       const token =requestHeaders['access-token'] || "";
       const tokenVerificado = jwt.verify(token, firma);
       if(tokenVerificado) {
        req.body.user = tokenVerificado;
        return next();
       }
    } catch (error) {
        res.json({
            error: 'El token de autenticacion no es correcto',
            codeError: 0o1
        })
    }
};

export const authUser = (req: Request, res: Response, next: NextFunction) => {
    try {
       const user = req.body;
       const email = validateEmail(user.email);
       const phone = validateNumber(user.telefono);
       if(!phone) {
           throw "El telefono ingresado no es valido" 
        }
       else if(!email) {throw "El email ingresado no es valido"} 
       return next();
    } catch (error) {
        res.json({
            error: 'El dato que esta intentando ingresar no valido',
            codeError: 0o2
        })
    }
};

export const authRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
       const username = req.body.user ? req.body.user.userName : req.headers.username;
       const result: any = await Select(`SELECT * FROM users WHERE Username = :username`, { username });
       const roleAdmin = result[0].idRole === 1 ? true:false;
       req.roleAdmin = roleAdmin;
       req.userId = result[0].id;
       return next();
    } catch (error) {
        res.json({
            error: error,
            codeError: 0o3
        })
    }
};

function validateEmail(email: string) {
    return (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i.test(email)) ? true : false;
}

function validateNumber(number: string) {
    return (/^(\(\+?\d{2,3}\)[\*|\s|\-|\.]?(([\d][\*|\s|\-|\.]?){6})(([\d][\s|\-|\.]?){2})?|(\+?[\d][\s|\-|\.]?){8}(([\d][\s|\-|\.]?){2}(([\d][\s|\-|\.]?){2})?)?)$/i.test(number)) ? true : false;
}
