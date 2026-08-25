export type ScenarioId = 'endingScreenTime' | 'bedtimeResistance' | 'homeworkRefusal' | 'siblingConflict';

export interface SimulatorScenario {
  id: ScenarioId;
  title: string;
  description: string;
  /** Given to the model as the opening situation the child is reacting to. */
  scenarioSetup: string;
  defaultIntensity: number;
}

export interface SimulatorMessage {
  id: string;
  role: 'child' | 'caregiver';
  text: string;
  createdAtISO: string;
}

export interface SimulatorCoaching {
  whatWorked: string[];
  tryNextTime: string[];
  framework: string | null;
  includeDisclaimer: boolean;
}
