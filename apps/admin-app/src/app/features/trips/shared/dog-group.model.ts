import { Dog } from '@models/lib/dog.model';

export interface DogGroup {
  key: string;
  label: string;
  dogs: (Dog & { _idx: number })[];
  icon?: string;
  hasWarning?: boolean;
  warningTooltip?: string;
}
