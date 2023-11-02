import { Request, Response, NextFunction, Router } from "express";
import ContactsService from "../services/ContactsService";
import { authToken, authRole } from "../security/auth";

const contactsController = Router();

contactsController.get("/V1/data/contacts", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await ContactsService.getContacts(req, res, next);
  }  
);

contactsController.post("/V1/data/contacts", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await ContactsService.getContactsWithFilters(req, res, next);
  }  
);

contactsController.get("/V1/data/contact/:id", authToken, authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await ContactsService.getContactById(req, res, next);
  }  
);

contactsController.post("/V1/data/contact", authToken, authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await ContactsService.addContact(req, res, next);
  }  
);

contactsController.post("/V1/data/contact-list", authToken,
  async (req: Request, res: Response, next: NextFunction) => {
    await ContactsService.addContacts(req, res, next);
  }  
);

contactsController.put("/V1/data/contact/:id", authToken, authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await ContactsService.updateContact(req, res, next);
  }  
);

contactsController.delete("/V1/data/contact/:id", authToken, authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await ContactsService.deleteContact(req, res, next);
  }  
);

contactsController.delete("/V1/data/contact-list", authToken, authRole,
  async (req: Request, res: Response, next: NextFunction) => {
    await ContactsService.deleteContacts(req, res, next);
  }  
);

export default contactsController;