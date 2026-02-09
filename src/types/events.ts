export type EventType =
  | 'no_event'
  | 'untimely_death'
  | 'storms'
  | 'mutiny'
  | 'bad_omens'
  | 'replacements'
  | 'desertion'
  | 'help_from_afar'
  | 'plague'
  | 'famine'
  | 'rebellion'
  | 'civil_war'
  | 'assassination'
  | 'treachery'
  | 'mercenaries'
  | 'reinforcements'
  | 'allied_intervention'
  | 'weather';

export interface RandomEvent {
  type: EventType;
  dieRoll: number;
  description: string;
  affectedFactionId?: string;
  affectedHex?: { col: number; row: number };
}

export interface EventResult {
  event: RandomEvent;
  unitsDestroyed: string[];
  unitsCreated: string[];
  factionsAffected: string[];
}
