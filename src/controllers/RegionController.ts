import { Request, Response, NextFunction, Router } from "express";
import RegionService from "../services/RegionService";

const regionController = Router();

regionController.get("/V1/data/regions",
  async (req: Request, res: Response, next: NextFunction) => {
    await RegionService.getRegions(req, res, next);
  }  
);

regionController.get("/V1/data/countries",
  async (req: Request, res: Response, next: NextFunction) => {
    await RegionService.getCountries(req, res, next);
  }  
);

regionController.get("/V1/data/countries/:region",
  async (req: Request, res: Response, next: NextFunction) => {
    await RegionService.getCountriesByRegion(req, res, next);
  }  
);

export default regionController;
