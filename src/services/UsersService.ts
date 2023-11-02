import { Request, Response, NextFunction, Router } from "express";
import { Delete, Insert, Select, Update } from '../database/actions';
import { RequestHeadersDto } from "../models/RequestHeadersDto";
import * as auth from '../security/auth';

export default class UserService {
    router = Router();

    public static async addUser(req: Request, res: Response, next: NextFunction) {
        try {
            const requestData = this.getRequestData(req);
            const user = requestData.body;
            const userStatus: any[] = await this.findUser(req, 'save');
            let response;
            if(userStatus && Array.isArray(userStatus) && userStatus.length > 0 && userStatus[0].count == 1) {
                response = {
                    message: "El nombre de usuario ya esta registrado"
                };                                
            } else {
                user.idRole = 2;
                user.username = user.username.toLowerCase();
                const result = await Insert(`
                    INSERT INTO user
                        (name, lastName, email, phone, country, region, address, userName, password, newsletter, terms, idRole) 
                    VALUES
                        (:name, :lastName, :email, :phone,
                        (SELECT id FROM country WHERE name_common = :country),
                        (SELECT id FROM continent WHERE name = :region),
                        :address, :username, :password, :newsletter, :terms, :idRole);`,
                    user);
                response = {
                    message: "Se creó el nuevo usuario correctamente",
                    result
                };
            }
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    public static async deleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            if (req.roleAdmin) {
                const result = await Delete(`DELETE FROM user WHERE id = :id`,{id});
                const response = {
                    message: `Se elimino correctamente el usuario con el Id: ${id}`,
                    result
                };
                res.status(200).json(response);
            } else {
                res.json({
                    error: 'El usuario no tiene privilegios suficientes para eliminar usuarios',
                    codeError: 0o1
                }); 
            }
        } catch (error) {
            next(error);
        }
    }

    public static async getUsers(req: Request, res: Response, next: NextFunction) {
        const userName = req.headers.username;
        try {
            let result: any;
            if (req.roleAdmin) {
                result = await Select(`
                    SELECT u.id, u.name, u.lastName, u.email, u.phone, cy.name_common as country, cn.name as region, u.address, u.userName, newsletter, terms, r.role
                    FROM user as u
                    INNER JOIN continent as cn on u.region=cn.id
                    INNER JOIN country as cy on u.country=cy.id
                    INNER JOIN roles as r on u.idRole=r.idRole`, {});
            } else {
                result = await Select(`
                    SELECT u.id, u.name, u.lastName, u.email, u.phone, cy.name_common as country, cn.name as region, u.address, u.userName, newsletter, terms, r.role
                    FROM user as u
                    INNER JOIN continent as cn on u.region=cn.id
                    INNER JOIN country as cy on u.country=cy.id
                    INNER JOIN roles as r on u.idRole=r.idRole
                    WHERE userName = :userName;`, { userName });
            }
            const userWithMatchingUsername = result.find((user: { userName: string | string[] | undefined; }) => user.userName === userName);
            if (userWithMatchingUsername) {
                result = result.filter((user: { userName: string | string[] | undefined; }) => user.userName !== userName);
            }
            if (userWithMatchingUsername) {
                result.unshift(userWithMatchingUsername);
            }
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async getUserById(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await Select('SELECT * FROM user WHERE id = :id', { id: req.params.id });
            res.json(result); 
        } catch (error) {
            next(error);
        }
    }

    public static async login(req: Request, res: Response, next: NextFunction) {   
        try {
            const result: any[] = await this.findUser(req, 'login');
            if(result && Array.isArray(result) && result.length > 0) {
                if(result[0].count == 1) {
                    let token = auth.generateToken({userName: req.body.username});
                    res.status(200).json({authToken: token});
                }else {
                    res.status(204).json('Usuario no encontrado');
                }
            } else {
                res.status(404).json('Usuario no encontrado');
            }   
        } catch (error) {
            next(error);
        }
    }

    public static async updateUser(req: Request, res: Response, next: NextFunction) {
        try {
            const requestData = this.getRequestData(req);
            const user = requestData.body;
            delete user.user;
            const result = await Update(`UPDATE user 
                SET address = :address, country = (SELECT id FROM country WHERE name_common = :country), email = :email, lastName = :lastName, 
                name = :name, newsletter = :newsletter, phone = :phone, region = (SELECT id FROM continent WHERE name = :region) WHERE id = :id;`,
                {
                        address: user.address,
                        country: user.country,
                        email: user.email,
                        id: user.id,
                        lastName: user.lastName,
                        name: user.name,
                        newsletter: user.newsletter,
                        phone: user.phone,
                        region: user.region
                });
                const response = {
                        message: `Se actualizo correctamente el usuario con Id: ${user.id}`,
                        result
                };
                res.status(200).json(response);
            
        } catch (error) {
            next(error);
        }
    }

    public static async updateUserRoles(req: Request, res: Response, next: NextFunction) {
        try {
            const role = req.body.role;
            const users = req.body.users;
            if (req.roleAdmin) {
                const result = await Update(`UPDATE user 
                    SET idRole = (SELECT idRole FROM roles WHERE role = :role) WHERE id in (:users)`, 
                    {role, users}
                );
            const message = users.length > 1 ?
                `Se actualizaron correctamente los usuarios con Id: ${users}` :
                `Se actualizo correctamente el usuario con Id: ${users[0]}`;
            const response = { message, result };
            res.status(200).json(response);
            }else{
                res.json({
                    error: 'El usuario no tiene privilegios suficientes para modificar el rol de usuarios',
                    codeError: 0o1
                }); 
            }
        } catch (error) {
            next(error);
        }
    }

    private static getRequestData(req: Request) {
        const requestHeaders = new RequestHeadersDto(req);
        return {
            body: req.body,
            method: req.method,
            path: req.path,
            requestHeaders
        }
    }

    public static async findUser(req: Request, action: string): Promise<any[]> {
        const user = {
            email: req.body.email || '',
            password: req.body.password,
            username: req.body.username
        };
        let script;
        switch (action) {
            case 'login':
                script = `SELECT COUNT(*) as count FROM user WHERE userName = :username AND password = :password`;
                break;
            case 'email':
                script = `SELECT userName, password, email FROM user WHERE userName = :username OR email = :email LIMIT 1`;
                break;
            default:
                script = `SELECT COUNT(*) as count FROM user WHERE userName = :username`;
                break;
        }
        return await Select(script, user);
    }
}