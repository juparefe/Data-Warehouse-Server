import { Request, Response, NextFunction, Router } from "express";
import { Select } from '../database/actions';

export default class ReportService {
    router = Router();

    public static async getCompaniesByCountry(req: Request, res: Response, next: NextFunction) {
        try {
            let result = await Select(`
                SELECT cy.name_common as label, COUNT(*) AS data
                FROM company as c
                INNER JOIN country as cy on c.country=cy.id
                GROUP BY label
                ORDER BY data DESC;`, {});
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async getCompaniesByRegion(req: Request, res: Response, next: NextFunction) {
        try {
            let result = await Select(`
                SELECT cn.name as label, COUNT(*) AS data
                FROM company as c
                INNER JOIN continent as cn on c.region=cn.id
                GROUP BY label
                ORDER BY data DESC;`, {});
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async getCompaniesBySector(req: Request, res: Response, next: NextFunction) {
        try {
            let result = await Select(`
                SELECT c.sector as label, COUNT(*) AS data
                FROM company as c
                GROUP BY label
                ORDER BY data DESC;`, {});
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async getContactsByCompany(req: Request, res: Response, next: NextFunction) {
        try {
            let result = await Select(`
                SELECT cm.name as label, COUNT(*) AS data
                FROM contact as c
                INNER JOIN company as cm on c.company=cm.id
                GROUP BY label
                ORDER BY data DESC;`, {});
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async getUsersByCountry(req: Request, res: Response, next: NextFunction) {
        try {
            let result = await Select(`
                SELECT cy.name_common as label, COUNT(*) AS data
                FROM user as u
                INNER JOIN country as cy on u.country=cy.id
                GROUP BY label
                ORDER BY data DESC;`, {});
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async getUsersByRegion(req: Request, res: Response, next: NextFunction) {
        try {
            let result = await Select(`
                SELECT c.name as label, COUNT(*) AS data
                FROM user as u
                INNER JOIN continent as c on u.region=c.id
                GROUP BY label
                ORDER BY data DESC;`, {});
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async getUsersSubscribed(req: Request, res: Response, next: NextFunction) {
        try {
            let result = await Select(`
                SELECT CASE WHEN u.newsletter = true THEN 'Sí' ELSE 'No' END AS label, COUNT(*) AS data
                FROM user as u
                GROUP BY label
                ORDER BY data DESC;`, {});
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}