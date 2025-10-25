import { FinancialStatus } from './financial-status';

export type MinimalUser = {
  uuid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};
