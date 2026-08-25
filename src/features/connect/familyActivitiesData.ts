import { FamilyActivity } from './types';

// Built to strengthen the relationship, not to correct behavior. Little or
// no prep, and each one names specifically why it helps.
export const FAMILY_ACTIVITIES: FamilyActivity[] = [
  {
    id: 'gratitude-walk',
    title: 'Gratitude Walk',
    description: 'Take a short walk together and each share things you are grateful for along the way.',
    estimatedMinutes: 15,
    materials: ['None needed', 'Comfortable shoes'],
    instructions: [
      'Head outside together, anywhere you can walk safely.',
      'Take turns naming one thing you are grateful for every few minutes.',
      'Encourage specific, small things, not just big ones.',
      'No rush. Let the walk set the pace, not the conversation.',
    ],
    whyItHelps: 'Naming gratitude out loud together builds a shared habit of noticing the good, not just the hard parts of the day.',
  },
  {
    id: 'blanket-fort',
    title: 'Building a Blanket Fort',
    description: 'Build a cozy fort together out of blankets, pillows, and whatever you have on hand.',
    estimatedMinutes: 20,
    materials: ['Blankets or sheets', 'Pillows', 'Chairs or furniture to drape over'],
    instructions: [
      'Clear a small space in a room together.',
      'Drape blankets over chairs, a table, or a couch to form walls.',
      'Add pillows and something soft to sit on inside.',
      'Once it is built, spend a few minutes inside it together, just talking or reading.',
    ],
    whyItHelps: "Building something together, with no \"right\" way to do it, creates an easy, low-pressure space for closeness.",
  },
  {
    id: 'cooperative-cooking',
    title: 'Cooperative Cooking',
    description: 'Make a simple snack or meal together, with each person handling a real part of it.',
    estimatedMinutes: 20,
    materials: ['Ingredients for a simple recipe', 'A recipe or idea in mind'],
    instructions: [
      'Pick something simple, like sandwiches, a fruit salad, or a no-bake snack.',
      'Give each person a real job, not just watching.',
      'Let it be a little messy or imperfect. That is part of it.',
      'Sit down together and actually eat what you made.',
    ],
    whyItHelps: 'Working toward one shared result, side by side, builds teamwork without it ever feeling like a lesson.',
  },
  {
    id: 'family-storytelling',
    title: 'Family Storytelling',
    description: 'Take turns building one silly story together, one sentence at a time.',
    estimatedMinutes: 10,
    materials: ['None needed'],
    instructions: [
      'Start with "Once upon a time..." and say one sentence.',
      'The next person adds the next sentence, and so on.',
      'Let it get as silly or unexpected as it wants to go.',
      'Keep going until it reaches a natural, goofy ending.',
    ],
    whyItHelps: 'Nobody knows where the story is headed, which makes it a rare moment where everyone is equally in charge.',
  },
  {
    id: 'draw-imaginary-worlds',
    title: "Drawing Each Other's Imaginary Worlds",
    description: 'Describe an imaginary world to each other, then each draw what you pictured.',
    estimatedMinutes: 20,
    materials: ['Paper', 'Crayons, markers, or pencils'],
    instructions: [
      'One person describes a made-up world out loud: what is there, what colors, who lives there.',
      'The other person draws it while listening, without asking too many questions.',
      'Switch roles and do it again with a new world.',
      'Compare drawings at the end and talk about what surprised you.',
    ],
    whyItHelps: 'Seeing how someone else pictured your words is a playful way to notice how differently you each see things.',
  },
  {
    id: 'family-traditions',
    title: 'Creating Family Traditions',
    description: 'Talk about and invent one small tradition that could belong just to your family.',
    estimatedMinutes: 15,
    materials: ['None needed'],
    instructions: [
      'Ask: what family tradition should exist but does not yet?',
      'Brainstorm a few small, doable ideas together.',
      'Pick one and decide when you would do it, like every Friday or once a month.',
      'Give it a name, even a silly one. Names make traditions stick.',
    ],
    whyItHelps: 'Traditions you build together, instead of ones just handed to you, become something everyone actually feels ownership over.',
  },
  {
    id: 'scavenger-hunt',
    title: 'Scavenger Hunt',
    description: 'Search your home or yard together for a short list of everyday items.',
    estimatedMinutes: 15,
    materials: ['A short list of items (or make one up together)'],
    instructions: [
      'Make a quick list of 5 to 10 items to find, silly or ordinary.',
      'Search together, or split up and race to find them first.',
      'Bring found items back to one spot to check them off.',
      'Celebrate finishing, no matter how long it took.',
    ],
    whyItHelps: 'A shared goal with a bit of playful urgency gets everyone moving and laughing together, without much setup.',
  },
  {
    id: 'compliment-circle',
    title: 'Compliment Circle',
    description: 'Sit together and take turns giving each family member one genuine compliment.',
    estimatedMinutes: 10,
    materials: ['None needed'],
    instructions: [
      'Sit in a circle or facing each other.',
      'Take turns saying one specific, genuine compliment to each person.',
      'Encourage specifics, like "you are patient when I ask a lot of questions," not just "you are nice."',
      'Let the person receiving it just say thank you, without brushing it off.',
    ],
    whyItHelps: 'Hearing something genuinely appreciated about yourself, out loud, from people you love, is rare, and it sticks.',
  },
  {
    id: 'lego-challenge',
    title: 'Collaborative LEGO Challenge',
    description: 'Build one thing together using LEGO or any building blocks you have, with a shared goal.',
    estimatedMinutes: 20,
    materials: ['LEGO or building blocks'],
    instructions: [
      'Agree on one thing to build together, like a tower, a vehicle, or a made-up creature.',
      'Decide together who builds which part, or build it all together piece by piece.',
      'Give it a name once it is done.',
      'Take a picture of it before it gets taken apart.',
    ],
    whyItHelps: 'Working on one shared creation instead of separate ones turns playtime into genuine teamwork.',
  },
  {
    id: 'family-reflection-game',
    title: 'Family Reflection Game',
    description: 'Take turns answering a few simple questions about how the week actually went.',
    estimatedMinutes: 15,
    materials: ['None needed'],
    instructions: [
      'Sit together at the end of a day or week.',
      'Take turns answering: What was a high point? What was a hard point? What are you looking forward to?',
      'Let every answer be accepted without fixing or judging it.',
      'End by each naming one thing you appreciated about someone else this week.',
    ],
    whyItHelps: "Regularly reflecting together, even briefly, keeps everyone's ups and downs visible instead of going unnoticed.",
  },
];

export function getFamilyActivityById(id: string) {
  return FAMILY_ACTIVITIES.find((a) => a.id === id);
}
