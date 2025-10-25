import { CategoryOption } from '../models/category-option';
import { Bucket } from './bucket.types';

export type CategoryOptions = Record<Bucket, CategoryOption[]>;
