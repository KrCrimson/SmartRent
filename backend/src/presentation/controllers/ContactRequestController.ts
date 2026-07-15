import { Request, Response } from 'express';
import { ContactRequestRepository } from '../../infrastructure/repositories/ContactRequestRepository';
import { NotFoundError } from '../../shared/errors/NotFoundError';

export class ContactRequestController {
  private repository: ContactRequestRepository;

  constructor() {
    this.repository = new ContactRequestRepository();
  }

  createContactRequest = async (req: Request, res: Response): Promise<void> => {
    try {
      const contactRequest = await this.repository.create(req.body);
      res.status(201).json({
        success: true,
        data: contactRequest,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  };

  getContactRequests = async (_req: Request, res: Response): Promise<void> => {
    try {
      const requests = await this.repository.findAll();
      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  };

  updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updated = await this.repository.update(id, { status });
      if (!updated) {
        throw new NotFoundError(`Solicitud de contacto no encontrada`);
      }

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(400).json({ success: false, message: (error as Error).message });
      }
    }
  };
}
