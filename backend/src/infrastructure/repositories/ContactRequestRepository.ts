import { ContactRequest, CreateContactRequestDto, UpdateContactRequestDto } from '../../domain/entities/ContactRequest';
import { ContactRequestModel } from '../database/schemas/ContactRequestSchema';

export class ContactRequestRepository {
  private toEntity(doc: any): ContactRequest {
    return {
      id: doc._id.toString(),
      departmentId: doc.departmentId,
      departmentName: doc.departmentName,
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      message: doc.message,
      interestedInVisit: doc.interestedInVisit,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(data: CreateContactRequestDto): Promise<ContactRequest> {
    const doc = new ContactRequestModel(data);
    await doc.save();
    return this.toEntity(doc);
  }

  async findAll(): Promise<ContactRequest[]> {
    const docs = await ContactRequestModel.find().sort({ createdAt: -1 });
    return docs.map(doc => this.toEntity(doc));
  }

  async findById(id: string): Promise<ContactRequest | null> {
    const doc = await ContactRequestModel.findById(id);
    return doc ? this.toEntity(doc) : null;
  }

  async update(id: string, updates: UpdateContactRequestDto): Promise<ContactRequest | null> {
    const doc = await ContactRequestModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    return doc ? this.toEntity(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await ContactRequestModel.findByIdAndDelete(id);
    return result !== null;
  }
}
