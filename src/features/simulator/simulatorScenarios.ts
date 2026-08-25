import { SimulatorScenario } from './types';

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  {
    id: 'endingScreenTime',
    title: 'Ending Screen Time',
    description: 'Practice the transition off a tablet or game without it turning into a blowup.',
    scenarioSetup: "You've been playing a game or watching a show, and your caregiver just told you it's time to stop.",
    defaultIntensity: 6,
  },
  {
    id: 'bedtimeResistance',
    title: 'Bedtime Resistance',
    description: 'Practice getting through stalling and refusal at bedtime.',
    scenarioSetup: "It's bedtime and your caregiver just told you it's time to get ready for bed, but you don't want to stop what you're doing.",
    defaultIntensity: 5,
  },
  {
    id: 'homeworkRefusal',
    title: 'Homework Refusal',
    description: 'Practice a calmer standoff over starting homework.',
    scenarioSetup: 'Your caregiver just asked you to sit down and start your homework, and you really do not want to.',
    defaultIntensity: 7,
  },
  {
    id: 'siblingConflict',
    title: 'Sibling Conflict',
    description: 'Practice stepping into an argument between siblings.',
    scenarioSetup: 'You just had a fight with your sibling over something small — a toy, whose turn it is, who touched who first — and your caregiver just stepped in.',
    defaultIntensity: 6,
  },
];

export function getScenarioById(id: string | undefined): SimulatorScenario | undefined {
  return SIMULATOR_SCENARIOS.find((s) => s.id === id);
}
