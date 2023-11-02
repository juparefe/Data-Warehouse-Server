import { Request, Response, NextFunction, Router } from "express";
import { Delete, Insert, Select, Update } from '../database/actions';
import { RequestHeadersDto } from "../models/RequestHeadersDto";
import { Contact } from "../models/contact.interface";
import { Constants } from "../shared/constants";

export default class CompaniesService {
    router = Router();

    public static async addContact(req: Request, res: Response, next: NextFunction) {
        try {
            const requestData = this.getRequestData(req);
            const contact = requestData.body;
            contact.channels = JSON.stringify(contact.channels);
            const result = await Insert(`
                INSERT INTO contact 
                    (name, img, email, country, region, company, position, channels, interestRate) 
                VALUES 
                    (:name, :img, :email, 
                    (SELECT id FROM country WHERE name_common = :country LIMIT 1), 
                    (SELECT id FROM continent WHERE name = :region LIMIT 1), 
                    (SELECT id FROM company WHERE name = :company LIMIT 1), 
                    :position, :channels, :interestRate);`, 
                contact);
            const response = {
                message: "Se creó el nuevo contacto correctamente",
                result
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    public static async addContacts(req: Request, res: Response, next: NextFunction) {
        try {
            const requestData = this.getRequestData(req);
            const contacs: Contact[] = requestData.body;
            const promises = contacs.map(async (contact) => {
                const singleResult = await Insert(`
                    INSERT INTO contact 
                        (name, img, email, country, region, company, position, channels, interestRate) 
                        VALUES 
                        (:name, '${Constants.base64Dummy}', :email, 
                        (SELECT id FROM country WHERE name_common = :country LIMIT 1), 
                        (SELECT id FROM continent WHERE name = :region LIMIT 1), 
                        (SELECT id FROM company WHERE name = :company LIMIT 1), 
                        :position, :channels, :interestRate);`, 
                    contact
                );
                return singleResult;
            });
    
            const result = await Promise.all(promises);
            const response = {
                message: "Se crearon los nuevos contactos correctamente",
                result
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    public static async deleteContact(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            if (req.roleAdmin) {
                const result = await Delete(`DELETE FROM contact WHERE id = :id`,{id});
                const response = {
                    message: `Se elimino correctamente el contacto con el Id: ${id}`,
                    result
                };
                res.status(200).json(response);
            } else {
                res.json({
                    error: 'El usuario no tiene privilegios suficientes para eliminar contactos',
                    codeError: 0o1
                }); 
            }
        } catch (error) {
            next(error);
        }
    }

    public static async deleteContacts(req: Request, res: Response, next: NextFunction) {
        try {
            const requestData = this.getRequestData(req);
            const contactIds: Contact[] = requestData.body;
            if (req.roleAdmin) {
                const result = await Delete(`DELETE FROM contact WHERE id IN (:contactIds)`, {contactIds});
                const response = {
                    message: `Se eliminaron correctamente los contactos con Id: ${contactIds}`,
                    result
                };
                res.status(200).json(response);
            } else {
                res.json({
                    error: 'El usuario no tiene privilegios suficientes para eliminar contactos',
                    codeError: 0o1
                }); 
            }
        } catch (error) {
            next(error);
        }
    }

    public static async deleteContactsByCompany(req: Request, companyIds: any[]) {
        if (req.roleAdmin) {
            await Delete(`DELETE FROM contact WHERE company IN (:companyIds)`, {companyIds});
        }
    }

    public static async getContacts(req: Request, res: Response, next: NextFunction) {
        try {
            let result;
            result = await Select(`
                SELECT c.id, c.name, c.img, c.email, cy.name_common as country, cn.name as region, com.name as company, c.position, c.channels, c.interestRate 
                FROM contact as c
                INNER JOIN company as com on c.company=com.id
                INNER JOIN continent as cn on c.region=cn.id
                INNER JOIN country as cy on c.country=cy.id;`, 
                {});
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async getContactById(req: Request, res: Response, next: NextFunction) {
        try {
            let result;
            if (req.roleAdmin) {
                result = await Select('SELECT * FROM contact WHERE id = :id', { id: req.params.id });
                res.json(result); 
            } else {
                res.json({
                    error: 'El usuario no tiene privilegios suficientes para buscar contactos',
                    codeError: 0o1
        }); 
    }
        } catch (error) {
            next(error);
        }
    }

    public static async getContactsWithFilters(req: Request, res: Response, next: NextFunction) {
        try {
            let result;
            const body = req.body
            const whereConditions = body.map((filter: any) => {
                switch (filter.name) {
                    case 'country':
                        return `cy.name_common like ?`;
                    case 'region':
                        return `cn.name like ?`;
                    case 'company':
                        return `com.name like ?`;
                    case 'channels':
                        return `JSON_CONTAINS(c.channels, '["${filter.filter.join('","')}"]')`;
                    default:
                        return `c.${filter.name} like ?`;
                }
            });
            const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';
            const filterValues = body.map((filter: any) => {
                return `%${filter.filter}%`;
            });
            const filteredScript = `
                SELECT c.id, c.name, c.img, c.email, cy.name_common as country, cn.name as region, com.name as company, c.position, c.channels, c.interestRate 
                FROM contact as c
                INNER JOIN company as com on c.company=com.id
                INNER JOIN continent as cn on c.region=cn.id
                INNER JOIN country as cy on c.country=cy.id${whereClause};`
            result = await Select(filteredScript, filterValues);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async updateContact(req: Request, res: Response, next: NextFunction) {
        try {
            const requestData = this.getRequestData(req);
            const contact = requestData.body;
            contact.channels = JSON.stringify(contact.channels);
            contact.id = parseInt(req.params.id);
            delete contact.user;
            if (req.roleAdmin) {
                const result = await Update(`UPDATE contact 
                    SET name = :name, img = :img, email = :email, 
                    country = (SELECT id FROM country WHERE name_common = :country), region = (SELECT id FROM continent WHERE name = :region), 
                    company = (SELECT id FROM company WHERE name = :company), position = :position, channels = :channels, interestRate = :interestRate WHERE id = :id;`,
                    {
                        name: contact.name,
                        img: contact.img,
                        email: contact.email,
                        region: contact.region,
                        country: contact.country,
                        company: contact.company,
                        position: contact.position,
                        channels: contact.channels,
                        interestRate: contact.interestRate,
                        id: contact.id
                    });
                    const response = {
                        message: `Se actualizo correctamente el contacto con Id: ${contact.id}`,
                        result
                    };
                    res.status(200).json(response);
            }else{
                res.json({
                    error: 'El usuario no tiene privilegios suficientes para actualizar contactos',
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
}