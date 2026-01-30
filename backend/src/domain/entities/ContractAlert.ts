export interface ContractAlert {
  _id?: string;
  userId: string;
  departmentId: string;
  type: 'contract_expiring' | 'contract_expired' | 'renewal_reminder';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  daysUntilExpiry: number;
  contractEndDate: Date;
  isRead: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AlertType = ContractAlert['type'];
export type AlertSeverity = ContractAlert['severity'];