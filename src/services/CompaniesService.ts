import { Request, Response, NextFunction, Router } from "express";
import { Delete, Insert, Select, Update } from '../database/actions';
import { RequestHeadersDto } from "../models/RequestHeadersDto";
import { Company } from "../models/company.interface";
import { Constants } from "../shared/constants";
import ContactsService from "./ContactsService";

export default class CompaniesService {
    router = Router();

    public static async addCompany(req: Request, res: Response, next: NextFunction) {
        try {
            const requestData = this.getRequestData(req);
            const company = requestData.body;
            const result = await Insert(`
                INSERT INTO company 
                    (name, img, acronym, country, region, idNumber, size, address, phone, site, sector) 
                VALUES 
                    (:name, :img, :acronym, 
                    (SELECT id FROM country WHERE name_common = :country), 
                    (SELECT id FROM continent WHERE name = :region), 
                    :idNumber, :size, :address, :phone, :site, :sector);`, 
                company);
            const response = {
                message: "Se creó la nueva compañía correctamente",
                result
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    public static async addCompanies(req: Request, res: Response, next: NextFunction) {
        try {
            const requestData = this.getRequestData(req);
            const companies: Company[] = requestData.body;
            const promises = companies.map(async (company) => {
                const singleResult = await Insert(`
                    INSERT INTO company 
                    (name, img, acronym, country, region, idNumber, size, address, phone, site, sector) 
                    VALUES 
                    (:name, '${Constants.base64Dummy}', :acronym, 
                    (SELECT id FROM country WHERE name_common = :country), 
                    (SELECT id FROM continent WHERE name = :region), 
                    :idNumber, :size, :address, :phone, :site, :sector);`,
                    company
                );
                return singleResult;
            });
    
            const result = await Promise.all(promises);
            const response = {
                message: "Se crearon las nuevas compañías correctamente",
                result
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    public static async deleteCompany(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            if (req.roleAdmin) {
                ContactsService.deleteContactsByCompany(req, [id]);
                const result = await Delete(`DELETE FROM company WHERE id = :id`, {id});
                const response = {
                    message: `Se elimino correctamente la compañia con el Id: ${id}`,
                    result
                };
                res.status(200).json(response);
            } else {
                res.json({
                    error: 'El usuario no tiene privilegios suficientes para eliminar compañias',
                    codeError: 0o1
                }); 
            }
        } catch (error) {
            next(error);
        }
    }

    public static async deleteCompanies(req: Request, res: Response, next: NextFunction) {
        try {
            const requestData = this.getRequestData(req);
            const companyIds: Company[] = requestData.body;
            if (req.roleAdmin) {
                ContactsService.deleteContactsByCompany(req, companyIds);
                const result = await Delete(`DELETE FROM company WHERE id IN (:companyIds)`, {companyIds});
                const response = {
                    message: `Se eliminaron correctamente las compañias con Id: ${companyIds}`,
                    result
                };
                res.status(200).json(response);
            } else {
                res.json({
                    error: 'El usuario no tiene privilegios suficientes para eliminar compañias',
                    codeError: 0o1
                }); 
            }
        } catch (error) {
            next(error);
        }
    }

    public static async getCompanies(req: Request, res: Response, next: NextFunction) {
        try {
            let result;
            result = await Select(`
                SELECT c.id, c.name, c.img, c.acronym, cy.name_common as country, cn.name as region, c.idNumber, c.size, c.address, c.phone, c.site, c.sector 
                FROM company as c
                INNER JOIN continent as cn on c.region=cn.id
                INNER JOIN country as cy on c.country=cy.id;`, 
                {});
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async getCompanyById(req: Request, res: Response, next: NextFunction) {
        try {
            let result;
            if (req.roleAdmin) {
                result = await Select('SELECT * FROM company WHERE id = :id', { id: req.params.id });
                res.json(result); 
            } else {
                res.json({
                    error: 'El usuario no tiene privilegios suficientes para buscar otros usuarios',
                    codeError: 0o1
        }); 
    }
        } catch (error) {
            next(error);
        }
    }

    public static async getCompaniesWithFilters(req: Request, res: Response, next: NextFunction) {
        try {
            let result;
            const body = req.body
            const whereConditions = body.map((filter: any) => {
                if (filter.name === 'country') {
                  return `cy.name_common like ?`;
                } else if (filter.name === 'region') {
                  return `cn.name like ?`;
                } else {
                  return `c.${filter.name} like ?`;
                }
              });
            const whereClause = whereConditions.length > 0 ? ` WHERE ${whereConditions.join(' AND ')}` : '';
            const filterValues = body.map((filter: any) => `%${filter.filter}%`);
            const filteredScript = `
                SELECT c.name, c.img, c.acronym, cy.name_common as country, cn.name as region, c.idNumber, c.size, c.address, c.phone, c.site, c.sector 
                FROM company as c
                INNER JOIN continent as cn on c.region=cn.id
                INNER JOIN country as cy on c.country=cy.id${whereClause};`
            result = await Select(filteredScript, filterValues);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async updateCompany(req: Request, res: Response, next: NextFunction) {
        try {
            const requestData = this.getRequestData(req);
            const company = requestData.body;
            delete company.user;
            if (req.roleAdmin) {
                const result = await Update(`UPDATE company 
                    SET name = :name, img = :img, acronym = :acronym, idNumber = :idNumber, size = :size, 
                    region = (SELECT id FROM continent WHERE name = :region), country = (SELECT id FROM country WHERE name_common = :country), 
                    address = :address, phone = :phone, site = :site, sector = :sector WHERE id = :id;`,
                    {
                        name: company.name,
                        img: company.img,
                        acronym: company.acronym,
                        idNumber: company.idNumber,
                        size: company.size,
                        region: company.region,
                        country: company.country,
                        address: company.address,
                        phone: company.phone,
                        site: company.site,
                        sector: company.sector,
                        id: company.id
                    });
                    const response = {
                        message: `Se actualizo correctamente la compañia con Id: ${company.id}`,
                        result
                    };
                    res.status(200).json(response);
            }else{
                res.json({
                    error: 'El usuario no tiene privilegios suficientes para actualizar compañias',
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