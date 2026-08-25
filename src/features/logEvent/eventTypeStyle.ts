import { Theme } from '../../theme';
import { EventType } from './types';

export function eventTypeTint(theme: Theme, type: EventType): string {
  switch (type) {
    case 'meltdown':
      return theme.color.accentTint;
    case 'parentReaction':
      return theme.color.primaryTint;
    case 'positiveMoment':
      return theme.color.secondaryTint;
  }
}
