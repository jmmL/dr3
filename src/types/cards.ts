export interface PersonalityCard {
  id: number;
  name: string;
  description: string;
}

export type DiplomacyCardType =
  | 'bribe'
  | 'crass_bribe'
  | 'threat'
  | 'marriage'
  | 'call_to_arms'
  | 'deactivation'
  | 'special';

export interface DiplomacyCard {
  id: string;
  name: string;
  type: DiplomacyCardType;
  modifier: number;
  description: string;
}

export interface DiplomacyDeckState {
  drawPile: string[];
  discardPile: string[];
  playerHands: Record<string, string[]>;
}
