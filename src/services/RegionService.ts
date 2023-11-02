import { Request, Response, NextFunction, Router } from "express";
import { Select } from '../database/actions';

export default class RegionService {
    router = Router();

    public static async getRegions(req: Request, res: Response, next: NextFunction) {
        try {
            let result;
            result = await Select('SELECT name FROM continent', {});
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async getCountries(req: Request, res: Response, next: NextFunction) {
        try {
            let result;
            result = await Select('SELECT name_common FROM country', {});
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    public static async getCountriesByRegion(req: Request, res: Response, next: NextFunction) {
        try {
            let result;
            result = await Select(`
                SELECT c.name_common 
                FROM country as c
                INNER JOIN continent as cn on c.continent_id=cn.id
                WHERE cn.name = :region`, { region: req.params.region });
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}