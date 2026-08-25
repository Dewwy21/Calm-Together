import { Exercise } from './types';

const IMAGES = {
  clouds: require('../../../assets/calm/clouds.jpg'),
  bridge: require('../../../assets/calm/bridge.jpg'),
  tree: require('../../../assets/calm/tree.jpg'),
  lotus: require('../../../assets/calm/lotus.jpg'),
  waterfall: require('../../../assets/calm/waterfall.jpg'),
};

export const EXERCISES: Exercise[] = [
  {
    id: 'box-breathing',
    title: 'Box Breathing',
    description: 'A steady four-part breathing pattern to help you feel more settled.',
    estimatedMinutes: 2,
    image: IMAGES.clouds,
    steps: [
      { type: 'instruction', instruction: 'Find a comfortable position and let your shoulders drop.' },
      { type: 'timer', durationSeconds: 4, instruction: 'Breathe in slowly through your nose.' },
      { type: 'timer', durationSeconds: 4, instruction: 'Hold gently.' },
      { type: 'timer', durationSeconds: 4, instruction: 'Breathe out slowly through your mouth.' },
      { type: 'timer', durationSeconds: 4, instruction: 'Hold gently before the next breath.' },
      { type: 'timer', durationSeconds: 4, instruction: 'Breathe in slowly through your nose.' },
      { type: 'timer', durationSeconds: 4, instruction: 'Hold gently.' },
      { type: 'timer', durationSeconds: 4, instruction: 'Breathe out slowly through your mouth.' },
      { type: 'timer', durationSeconds: 4, instruction: 'Hold gently before the next breath.' },
      { type: 'instruction', instruction: 'Notice how your body feels now compared to when you started.' },
    ],
  },
  {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Grounding',
    description: 'Use your five senses to gently bring your attention back to the present moment.',
    estimatedMinutes: 3,
    image: IMAGES.tree,
    steps: [
      { type: 'instruction', instruction: "Take a slow breath. When you're ready, we'll notice what's around you." },
      { type: 'timer', durationSeconds: 15, instruction: 'Look around and silently name 5 things you can see.' },
      { type: 'timer', durationSeconds: 15, instruction: 'Notice 4 things you can touch or feel right now.' },
      { type: 'timer', durationSeconds: 15, instruction: 'Notice 3 things you can hear.' },
      { type: 'timer', durationSeconds: 10, instruction: 'Notice 2 things you can smell.' },
      { type: 'timer', durationSeconds: 10, instruction: 'Notice 1 thing you can taste, or simply notice your breath.' },
      { type: 'instruction', instruction: "You're here, right now. That's enough." },
    ],
  },
  {
    id: 'progressive-muscle-relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Tense and release each muscle group to work physical tension out of your body.',
    estimatedMinutes: 4,
    image: IMAGES.waterfall,
    steps: [
      { type: 'instruction', instruction: 'Sit or lie down somewhere comfortable if you can.' },
      { type: 'timer', durationSeconds: 8, instruction: 'Curl your toes and tense your feet, then let go.' },
      { type: 'timer', durationSeconds: 8, instruction: 'Tighten your legs, then let go.' },
      { type: 'timer', durationSeconds: 8, instruction: 'Clench your stomach, then let go.' },
      { type: 'timer', durationSeconds: 8, instruction: 'Make fists and tense your arms, then let go.' },
      { type: 'timer', durationSeconds: 8, instruction: 'Raise your shoulders to your ears, then let go.' },
      { type: 'timer', durationSeconds: 8, instruction: 'Scrunch your face gently, then let go.' },
      { type: 'instruction', instruction: 'Let your whole body feel heavy and loose for a moment.' },
    ],
  },
  {
    id: 'sensory-anchoring',
    title: 'Sensory Anchoring',
    description: 'Hold onto something physical to pull your focus out of your head and into your hands.',
    estimatedMinutes: 2,
    image: IMAGES.bridge,
    steps: [
      { type: 'instruction', instruction: 'Find something nearby you can hold: a mug, a piece of fabric, your own hands.' },
      { type: 'timer', durationSeconds: 20, instruction: 'Notice its temperature. Is it warm, cool, or neutral?' },
      { type: 'timer', durationSeconds: 20, instruction: 'Notice its texture. Is it smooth, rough, or soft?' },
      { type: 'timer', durationSeconds: 20, instruction: 'Notice its weight in your hand.' },
      { type: 'instruction', instruction: "That object is real, and so is this moment. You're okay." },
    ],
  },
  {
    id: 'body-scan-meditation',
    title: 'Body Scan Meditation',
    description: "Slowly move your attention through your body to notice where you're holding tension.",
    estimatedMinutes: 5,
    image: IMAGES.lotus,
    steps: [
      { type: 'instruction', instruction: 'Get comfortable and close your eyes if that feels okay.' },
      { type: 'timer', durationSeconds: 30, instruction: 'Bring your attention to your feet and legs. Just notice, no need to change anything.' },
      { type: 'timer', durationSeconds: 30, instruction: 'Move your attention to your stomach and chest.' },
      { type: 'timer', durationSeconds: 30, instruction: 'Notice your hands and arms.' },
      { type: 'timer', durationSeconds: 30, instruction: 'Bring your attention to your shoulders and neck.' },
      { type: 'timer', durationSeconds: 30, instruction: 'Notice your face and head.' },
      { type: 'instruction', instruction: 'Take one more breath and gently open your eyes.' },
    ],
  },
  {
    id: 'self-compassion-break',
    title: 'Self-Compassion Break',
    description: "A short practice to offer yourself the same kindness you'd offer a friend.",
    estimatedMinutes: 2,
    image: IMAGES.clouds,
    steps: [
      { type: 'instruction', instruction: 'Place a hand on your chest if that feels comfortable, and take a breath.' },
      { type: 'instruction', instruction: 'Silently say: "This is a hard moment."' },
      { type: 'instruction', instruction: 'Silently say: "Moments like this are part of caregiving. I am not alone in this."' },
      { type: 'instruction', instruction: 'Silently say: "May I be kind to myself right now."' },
      { type: 'instruction', instruction: 'Take one more breath before you go on with your day.' },
    ],
  },
];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}
