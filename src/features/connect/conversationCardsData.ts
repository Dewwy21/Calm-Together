export type ConversationCategory =
  | 'Curiosity'
  | 'Imagination'
  | 'Emotions'
  | 'Family Memories'
  | 'Values'
  | 'Humor'
  | 'Future Dreams'
  | 'Perspective Taking';

export interface ConversationQuestion {
  id: string;
  category: ConversationCategory;
  text: string;
  /** why a caregiver created this card — only ever set on custom cards */
  note?: string;
}

export interface ConversationDeck {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
}

// Built for storytelling and reflection, not one-word answers or classroom
// icebreakers. Each session pulls 5 of these at random (see pickSession).
export const CONVERSATION_QUESTIONS: ConversationQuestion[] = [
  // Curiosity
  { id: 'cur-1', category: 'Curiosity', text: 'If you could ask any animal one question and get a real answer, what would you ask?' },
  { id: 'cur-2', category: 'Curiosity', text: "What's something you've always wondered about but never asked anyone?" },
  { id: 'cur-3', category: 'Curiosity', text: 'If you could instantly become an expert at one random skill, what would you pick and why?' },
  { id: 'cur-4', category: 'Curiosity', text: 'What is the strangest question you have ever wondered about right before falling asleep?' },
  { id: 'cur-5', category: 'Curiosity', text: 'If you could shrink down and explore anywhere in this house, where would you go first?' },
  { id: 'cur-6', category: 'Curiosity', text: "What's one thing you'd love to take apart just to see how it works?" },
  { id: 'cur-7', category: 'Curiosity', text: 'If you could talk to any object in our house and it would answer honestly, what would you ask it?' },
  { id: 'cur-8', category: 'Curiosity', text: "What's a question about space you wish a scientist could answer for you?" },
  { id: 'cur-9', category: 'Curiosity', text: "If you found a locked door in our house that's never been there before, what do you hope is behind it?" },
  { id: 'cur-10', category: 'Curiosity', text: "What's the most interesting fact you know that most people don't?" },
  { id: 'cur-11', category: 'Curiosity', text: 'If you could ask a tree what it has seen over the years, what would you want to know?' },
  { id: 'cur-12', category: 'Curiosity', text: "What's something everyone else seems to understand that still confuses you?" },
  { id: 'cur-13', category: 'Curiosity', text: 'If you could follow one bug around for a whole day, which one would you pick and why?' },
  { id: 'cur-14', category: 'Curiosity', text: "What's a question you've never asked me because you weren't sure how to bring it up?" },

  // Imagination
  { id: 'imag-1', category: 'Imagination', text: 'If you could invent a new holiday, what would it celebrate and how would we celebrate it?' },
  { id: 'imag-2', category: 'Imagination', text: "What would our family's superhero team name be, and what powers would each of us have?" },
  { id: 'imag-3', category: 'Imagination', text: 'If our house could fly to one place in the world for a week, where should it land?' },
  { id: 'imag-4', category: 'Imagination', text: 'What would you build if you had unlimited building blocks and unlimited time?' },
  { id: 'imag-5', category: 'Imagination', text: 'If animals could talk for one day, which animal would be the funniest to listen to?' },
  { id: 'imag-6', category: 'Imagination', text: "What's a made-up creature you wish was real, and what would it be like?" },
  { id: 'imag-7', category: 'Imagination', text: 'If you designed a theme park, what would the very first ride be?' },
  { id: 'imag-8', category: 'Imagination', text: "If gravity took a day off, what's the first thing you'd want to try?" },
  { id: 'imag-9', category: 'Imagination', text: 'What would a museum of your life look like — what would be in the first exhibit?' },
  { id: 'imag-10', category: 'Imagination', text: 'If you could combine two animals into one, which two would you pick and what would you call it?' },
  { id: 'imag-11', category: 'Imagination', text: 'What would a day look like if you were in charge of the whole family for 24 hours?' },
  { id: 'imag-12', category: 'Imagination', text: 'If our town had a giant slide instead of a main street, where would it start and end?' },
  { id: 'imag-13', category: 'Imagination', text: "What's a color that doesn't exist yet — what would you name it and what would it look like?" },
  { id: 'imag-14', category: 'Imagination', text: 'If you could shrink any object to keep in your pocket forever, what would you pick?' },

  // Emotions
  { id: 'emo-1', category: 'Emotions', text: "What's a feeling that's hard to explain in words, and what does it feel like in your body?" },
  { id: 'emo-2', category: 'Emotions', text: "What's something that always makes you feel calm, even on a bad day?" },
  { id: 'emo-3', category: 'Emotions', text: 'What superpower would you never want, even if it seemed cool at first, and why?' },
  { id: 'emo-4', category: 'Emotions', text: 'When was the last time you laughed so hard it hurt? What happened?' },
  { id: 'emo-5', category: 'Emotions', text: "What's something that used to scare you but doesn't anymore?" },
  { id: 'emo-6', category: 'Emotions', text: 'What helps you feel better when you are upset, even just a little?' },
  { id: 'emo-7', category: 'Emotions', text: 'Is there a feeling you wish grown-ups understood better about kids?' },
  { id: 'emo-8', category: 'Emotions', text: "What's a small thing that instantly makes your day better?" },
  { id: 'emo-9', category: 'Emotions', text: 'When do you feel the most like yourself?' },
  { id: 'emo-10', category: 'Emotions', text: "What's a feeling you had this week that you haven't told anyone about?" },
  { id: 'emo-11', category: 'Emotions', text: "What does it feel like right before you're about to cry — how do you know it's coming?" },
  { id: 'emo-12', category: 'Emotions', text: 'Is there a sound, smell, or song that always changes your mood?' },
  { id: 'emo-13', category: 'Emotions', text: "What's something that makes you feel proud, even if it seems small to other people?" },
  { id: 'emo-14', category: 'Emotions', text: "When you're really excited about something, how does your body let you know?" },

  // Family Memories
  { id: 'mem-1', category: 'Family Memories', text: 'What is your favorite memory of the two of us together?' },
  { id: 'mem-2', category: 'Family Memories', text: "What family tradition should exist but doesn't yet?" },
  { id: 'mem-3', category: 'Family Memories', text: 'What is a moment from your life you wish you could relive exactly as it happened?' },
  { id: 'mem-4', category: 'Family Memories', text: 'What is the funniest thing that has ever happened on a family trip?' },
  { id: 'mem-5', category: 'Family Memories', text: "What's a story about our family you've heard so many times you could tell it yourself?" },
  { id: 'mem-6', category: 'Family Memories', text: "What's something small I do that you'll probably still remember when you're grown up?" },
  { id: 'mem-7', category: 'Family Memories', text: 'If you could freeze one ordinary day from this year and keep it forever, which one would it be?' },
  { id: 'mem-8', category: 'Family Memories', text: "What's the best thing that's happened to our family this year so far?" },
  { id: 'mem-9', category: 'Family Memories', text: 'If you could redo one family day exactly the same, which one would it be?' },
  { id: 'mem-10', category: 'Family Memories', text: 'What is something I used to do when you were little that you still remember?' },
  { id: 'mem-11', category: 'Family Memories', text: 'What is a family memory that always makes you laugh when you think about it?' },
  { id: 'mem-12', category: 'Family Memories', text: 'Which grandparent, relative, or family friend do you wish you knew more stories about?' },
  { id: 'mem-13', category: 'Family Memories', text: "What's the most \"us\" thing our family does that other families might think is weird?" },
  { id: 'mem-14', category: 'Family Memories', text: 'If you had to describe our family in one memory to a stranger, which one would you choose?' },

  // Values
  { id: 'val-1', category: 'Values', text: 'What does being a good friend actually look like to you?' },
  { id: 'val-2', category: 'Values', text: "What's something you believe most people misunderstand about you?" },
  { id: 'val-3', category: 'Values', text: 'If you could teach the whole world one lesson, what would it be?' },
  { id: 'val-4', category: 'Values', text: 'What matters more to you, being right or being kind? Why?' },
  { id: 'val-5', category: 'Values', text: 'What is a rule you think should exist in every house, everywhere?' },
  { id: 'val-6', category: 'Values', text: 'Who is someone you look up to, and what is it about them that you admire?' },
  { id: 'val-7', category: 'Values', text: 'What does "fair" mean to you, in your own words?' },
  { id: 'val-8', category: 'Values', text: "What's something you'd never do, even if everyone else was doing it?" },
  { id: 'val-9', category: 'Values', text: 'If you saw someone being left out, what would you want to do about it?' },
  { id: 'val-10', category: 'Values', text: "What's a promise you take really seriously, even the small ones?" },
  { id: 'val-11', category: 'Values', text: 'What is more important to you — being liked or being honest? Why?' },
  { id: 'val-12', category: 'Values', text: "What's something small you can do that makes a big difference to someone else?" },
  { id: 'val-13', category: 'Values', text: 'If you made the rules for the whole world for one day, what is the first rule you would make?' },
  { id: 'val-14', category: 'Values', text: 'What do you think makes someone trustworthy?' },

  // Humor
  { id: 'hum-1', category: 'Humor', text: 'What is the silliest thing you believed when you were younger?' },
  { id: 'hum-2', category: 'Humor', text: 'If you had to replace your name with a food, what food would fit you best?' },
  { id: 'hum-3', category: 'Humor', text: 'What is the funniest sound you can make right now?' },
  { id: 'hum-4', category: 'Humor', text: 'If our pet, real or pretend, could talk, what would it complain about most?' },
  { id: 'hum-5', category: 'Humor', text: "What's a joke or bit that never stops being funny to you?" },
  { id: 'hum-6', category: 'Humor', text: 'If you were a cartoon character for a day, who would you be and why?' },
  { id: 'hum-7', category: 'Humor', text: 'What is the weirdest combination of foods you actually enjoy?' },
  { id: 'hum-8', category: 'Humor', text: 'If you had to give everyone in our family a silly nickname today, what would they be?' },
  { id: 'hum-9', category: 'Humor', text: "What's the funniest thing that's happened at school or with friends recently?" },
  { id: 'hum-10', category: 'Humor', text: 'If animals wore clothes, which animal would have the worst fashion sense?' },
  { id: 'hum-11', category: 'Humor', text: "What's a word that sounds funny no matter how many times you say it?" },
  { id: 'hum-12', category: 'Humor', text: 'If you could prank one person in this family, nicely, what would you do?' },
  { id: 'hum-13', category: 'Humor', text: "What's the most ridiculous thing you've ever seen happen in real life?" },
  { id: 'hum-14', category: 'Humor', text: 'If our family had a theme song that was actually a joke, what would it sound like?' },

  // Future Dreams
  { id: 'fut-1', category: 'Future Dreams', text: 'If you could try any job for just one day, what would you pick?' },
  { id: 'fut-2', category: 'Future Dreams', text: "What's something you want to be really good at by the time you're grown up?" },
  { id: 'fut-3', category: 'Future Dreams', text: 'If you could live anywhere in the world someday, where would it be?' },
  { id: 'fut-4', category: 'Future Dreams', text: "What's a big dream you have that you've never told anyone?" },
  { id: 'fut-5', category: 'Future Dreams', text: 'If you could have any adventure someday, what would it be?' },
  { id: 'fut-6', category: 'Future Dreams', text: 'What do you think your life will look like when you are my age?' },
  { id: 'fut-7', category: 'Future Dreams', text: "What's something you hope never changes, no matter how big you get?" },
  { id: 'fut-8', category: 'Future Dreams', text: "What's a skill you want to learn that has nothing to do with school?" },
  { id: 'fut-9', category: 'Future Dreams', text: 'If you could time-travel to visit your future self, what is the first thing you would ask?' },
  { id: 'fut-10', category: 'Future Dreams', text: "What's a place you've never been that you dream about visiting?" },
  { id: 'fut-11', category: 'Future Dreams', text: 'Do you think you will live somewhere like here when you are older, or somewhere totally different?' },
  { id: 'fut-12', category: 'Future Dreams', text: "What's something you hope is different about the world by the time you're grown up?" },
  { id: 'fut-13', category: 'Future Dreams', text: 'If you could guarantee one thing about your future, what would you choose?' },
  { id: 'fut-14', category: 'Future Dreams', text: "What's a version of \"grown-up you\" that you're most excited to become?" },

  // Perspective Taking
  { id: 'per-1', category: 'Perspective Taking', text: 'What do you think is the hardest part of being a grown-up?' },
  { id: 'per-2', category: 'Perspective Taking', text: 'What do you think I was like when I was your age?' },
  { id: 'per-3', category: 'Perspective Taking', text: 'If you could switch places with me for a day, what would you do differently?' },
  { id: 'per-4', category: 'Perspective Taking', text: "What's something you think I don't fully understand about your world?" },
  { id: 'per-5', category: 'Perspective Taking', text: 'How do you think our pet, or a friend, sees our family?' },
  { id: 'per-6', category: 'Perspective Taking', text: 'What do you think it feels like to be the new kid somewhere?' },
  { id: 'per-7', category: 'Perspective Taking', text: 'If you could know exactly what I was thinking for one minute, would you want to? Why?' },
  { id: 'per-8', category: 'Perspective Taking', text: 'What do you think is the hardest part of being a kid right now, in this exact moment in time?' },
  { id: 'per-9', category: 'Perspective Taking', text: 'If a friend was having the worst day ever, what do you think they would need most from you?' },
  { id: 'per-10', category: 'Perspective Taking', text: 'What do you think our pet, or a stuffed animal, would say about our family if it could talk?' },
  { id: 'per-11', category: 'Perspective Taking', text: "What's something you think looks easy from the outside but is actually really hard?" },
  { id: 'per-12', category: 'Perspective Taking', text: 'If you were me for a day, what is one thing you think you would worry about?' },
  { id: 'per-13', category: 'Perspective Taking', text: "What do you think it's like to be someone in your class who's really different from you?" },
  { id: 'per-14', category: 'Perspective Taking', text: "What's something about you that you think people misunderstand at first?" },
];

export const CONVERSATION_CATEGORIES: ConversationCategory[] = [
  'Curiosity',
  'Imagination',
  'Emotions',
  'Family Memories',
  'Values',
  'Humor',
  'Future Dreams',
  'Perspective Taking',
];

// Starter decks, hand-curated from the built-in question library by theme.
// Caregiver-created decks (see conversationCardsStorage.ts) sit alongside
// these; built-in decks aren't editable or deletable.
export const BUILT_IN_DECKS: ConversationDeck[] = [
  {
    id: 'vacation-questions',
    name: 'Vacation Questions',
    description: 'For road trips, plane rides, and anywhere away from the usual routine.',
    questionIds: ['mem-4', 'imag-3', 'fut-3', 'fut-5', 'imag-1', 'cur-1', 'cur-8', 'imag-8', 'fut-9', 'mem-8'],
  },
  {
    id: 'bedtime-conversations',
    name: 'Bedtime Conversations',
    description: 'Slower, quieter questions for winding down at the end of the day.',
    questionIds: ['emo-2', 'emo-6', 'val-6', 'fut-7', 'mem-1', 'per-7', 'emo-8', 'emo-11', 'per-9', 'val-9'],
  },
  {
    id: 'family-traditions',
    name: 'Family Traditions',
    description: 'For talking about the moments and rituals that make your family yours.',
    questionIds: ['mem-2', 'mem-5', 'mem-6', 'mem-7', 'val-5', 'mem-3', 'mem-8', 'mem-11', 'mem-12', 'mem-13'],
  },
  {
    id: 'questions-for-difficult-days',
    name: 'Questions for Difficult Days',
    description: 'Gentle, understanding questions for when things have felt hard.',
    questionIds: ['emo-7', 'emo-5', 'per-1', 'per-4', 'val-4', 'emo-3', 'emo-9', 'emo-10', 'per-8', 'per-11'],
  },
  {
    id: 'just-for-laughs',
    name: 'Just for Laughs',
    description: 'Pure silliness — for when the mood calls for laughing, not depth.',
    questionIds: ['hum-1', 'hum-2', 'hum-3', 'hum-4', 'hum-5', 'hum-8', 'hum-9', 'hum-10', 'imag-2', 'imag-10'],
  },
];

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
