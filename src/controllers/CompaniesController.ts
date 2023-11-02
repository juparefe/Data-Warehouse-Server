import { Request, Response, NextFunction, Router } from "express";
import CompaniesService from "../services/CompaniesService";
import { authToken, authRole } from "../security/auth";

const companiesController = Router();

companiesController.get("/V1/data/companies", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await CompaniesService.getCompanies(req, res, next);
  }  
);

companiesController.post("/V1/data/companies", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await CompaniesService.getCompaniesWithFilters(req, res, next);
  }  
);

companiesController.get("/V1/data/company/:id", authToken, authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await CompaniesService.getCompanyById(req, res, next);
  }  
);

companiesController.post("/V1/data/company", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await CompaniesService.addCompany(req, res, next);
  }  
);

companiesController.post("/V1/data/company-list", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await CompaniesService.addCompanies(req, res, next);
  }  
);

companiesController.put("/V1/data/company/:id", authToken, authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await CompaniesService.updateCompany(req, res, next);
  }  
);

companiesController.delete("/V1/data/company/:id", authToken, authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await CompaniesService.deleteCompany(req, res, next);
  }  
);

companiesController.delete("/V1/data/company-list", authToken, authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await CompaniesService.deleteCompanies(req, res, next);
  }  
);

export default companiesController;