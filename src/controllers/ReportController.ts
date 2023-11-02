import { Request, Response, NextFunction, Router } from "express";
import ReportService from "../services/ReportService";
import { authToken } from "../security/auth";

const reportController = Router();

reportController.get("/V1/reports/companies/country", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await ReportService.getCompaniesByCountry(req, res, next);
  }
);

reportController.get("/V1/reports/companies/region", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await ReportService.getCompaniesByRegion(req, res, next);
  }
);

reportController.get("/V1/reports/companies/sector", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await ReportService.getCompaniesBySector(req, res, next);
  }
);

reportController.get("/V1/reports/contacts/company", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await ReportService.getContactsByCompany(req, res, next);
  }
);

reportController.get("/V1/reports/users/country", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await ReportService.getUsersByCountry(req, res, next);
  }
);

reportController.get("/V1/reports/users/region", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await ReportService.getUsersByRegion(req, res, next);
  }
);

reportController.get("/V1/reports/users/subscribed", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await ReportService.getUsersSubscribed(req, res, next);
  }
);

export default reportController;
