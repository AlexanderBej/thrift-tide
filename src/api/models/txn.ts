import { Bucket } from '../types/bucket.types';

export interface Txn {
  id?: string;
  date: string; // 'YYYY-MM-DD'
  amount: number;
  type: Bucket;
  category: string;
  note?: string;
}
