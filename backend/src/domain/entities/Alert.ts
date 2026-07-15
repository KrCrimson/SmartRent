export type AlertType = 'payment_reminder' | 'maintenance_update' | 'system';

export interface Alert {
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: AlertType;
  isRead: boolean;
  relatedId?: string; // e.g. Payment ID or Maintenance ID
  createdAt?: Date;
  updatedAt?: Date;
}
