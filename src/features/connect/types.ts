export type ConnectCategory = 'conversation' | 'listen' | 'family' | 'recharge';

interface ConnectActivityBase {
  id: string;
  title: string;
  /** one sentence, shown on the card */
  description: string;
  estimatedMinutes: number;
}

export interface FamilyActivity extends ConnectActivityBase {
  materials: string[];
  instructions: string[];
  /** one sentence explaining why this strengthens family relationships */
  whyItHelps: string;
}

export interface RechargeActivity extends ConnectActivityBase {
  /** a short how-to / encouragement line shown on the detail screen */
  tip: string;
}
