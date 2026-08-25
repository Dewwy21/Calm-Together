// Every string in this file is transcribed verbatim from "ACT ADHD
// Parenting Scenarios and Responses" (the prototype design document for an
// ACT-based AI parenting coach). Nothing here is invented — the document
// itself states it currently includes ten parenting categories and one
// fully developed ACT coaching example; future development is meant to add
// 10-15 interactive scenarios per category. ACT_SCENARIOS is exactly that
// one example. To add a scenario later: give it a new id, point
// categoryId at one of ACT_CATEGORIES, and add its beats in the same
// ActBeat shapes used below — nothing else in the app needs to change.
import {
  PencilIcon,
  WaveIcon,
  StarIcon,
  GlobeIcon,
  BookIcon,
  HandsIcon,
  PeopleIcon,
  CloudIcon,
  HomeIcon,
  TeacupIcon,
} from '../../components/icons';
import { ActCategory, ActScenario } from './types';

export const ACT_CATEGORIES: ActCategory[] = [
  {
    id: 'getting-started',
    order: 1,
    title: 'Getting Started & Following Through',
    tagline: "My child just won't get started.",
    typicalScenarios: [
      "Homework won't start",
      'Says "I\'ll do it later"',
      'Wanders around instead of beginning',
      'Starts but gets distracted immediately',
      "Can't begin studying for a test",
      "Doesn't turn in completed homework",
      'Executive functioning difficulties',
      'Poor time management',
      'Takes hours to finish simple work',
      'Gives up after the first obstacle',
    ],
    commonParentThoughts: ["They're just lazy.", "We've been through this a hundred times.", "They're ruining their future."],
    icon: PencilIcon,
  },
  {
    id: 'big-emotions',
    order: 2,
    title: 'Big Emotions & Meltdowns',
    tagline: 'Everything becomes an emotional explosion.',
    typicalScenarios: [
      'Screaming',
      'Crying over small mistakes',
      'Anger outbursts',
      'Hitting or threatening',
      'Emotional dysregulation',
      'Low frustration tolerance',
      'Perfectionism',
      "Can't tolerate losing",
      'Self-criticism',
      'Self-hitting',
      'Emotional shutdown',
    ],
    commonParentThoughts: ['Why is everything a battle?', 'I have to stop this.', "I'm losing control."],
    icon: WaveIcon,
  },
  {
    id: 'motivation-confidence',
    order: 3,
    title: 'Motivation, Confidence & Avoidance',
    tagline: 'My child has no motivation.',
    typicalScenarios: [
      "Doesn't want to try",
      'Avoids challenging work',
      'Gives up easily',
      'Fear of failure',
      'Depression',
      'Low confidence',
      'No internal motivation',
      "Won't participate",
      "Doesn't believe in themselves",
      'Withdraws when stressed',
    ],
    commonParentThoughts: ['They have so much potential.', "Why don't they care?", 'Nothing motivates them.'],
    icon: StarIcon,
  },
  {
    id: 'screen-time',
    order: 4,
    title: 'Screen Time & Technology',
    tagline: 'Technology has become a daily battle.',
    typicalScenarios: [
      "Won't stop gaming",
      'Constant YouTube',
      'TikTok/social media',
      'Gaming until bedtime',
      'Refuses offline activities',
      'Hyperfocus on electronics',
      'Screen addiction concerns',
      'Computer before homework',
      'Endless "Five more minutes."',
    ],
    commonParentThoughts: ['The games have taken over.', 'Nothing else interests them.'],
    icon: GlobeIcon,
  },
  {
    id: 'school-executive-function',
    order: 5,
    title: 'School & Executive Function',
    tagline: 'School has become overwhelming.',
    typicalScenarios: [
      'Forgets assignments',
      "Doesn't turn in homework",
      'Poor grades',
      'Messy handwriting',
      'Careless mistakes',
      'Slow work completion',
      "Can't concentrate",
      'Teachers misunderstand ADHD',
      'Test anxiety',
      'Academic pressure',
      'GPA dropping',
    ],
    commonParentThoughts: ["They're so smart.", "Why can't they show what they know?"],
    icon: BookIcon,
  },
  {
    id: 'parent-child-relationship',
    order: 6,
    title: 'Parent-Child Relationship',
    tagline: "We're arguing all the time.",
    typicalScenarios: [
      'Constant reminders',
      'Power struggles',
      'Defiance',
      'Refuses requests',
      'Talking back',
      'Parent yelling',
      'Child yelling',
      'Emotional distance',
      'Family tension',
      'Relationship feels damaged',
    ],
    commonParentThoughts: ["I'm becoming the parent I never wanted to be.", 'Everything turns into a fight.'],
    icon: HandsIcon,
  },
  {
    id: 'social-family-relationships',
    order: 7,
    title: 'Social & Family Relationships',
    tagline: 'Relationships are becoming difficult.',
    typicalScenarios: [
      "Doesn't like social interaction",
      "Misreads other people's intentions",
      'Interrupts constantly',
      'Poor boundaries',
      'Sibling conflict',
      'Thinks everyone is laughing at them',
      'Feels misunderstood',
      'Withdraws to bedroom',
      'Family communication breaks down',
    ],
    commonParentThoughts: ["People don't understand my child.", "I'm worried they'll never have friends."],
    icon: PeopleIcon,
  },
  {
    id: 'anxiety-emotional-wellbeing',
    order: 8,
    title: 'Anxiety & Emotional Well-being',
    tagline: 'My child seems constantly worried.',
    typicalScenarios: [
      'General anxiety',
      "\"I'm worried but don't know why.\"",
      'Fear of school',
      'Fear of mistakes',
      'Fear of failure',
      'Avoidance',
      'Depression',
      'Low self-esteem',
      'Poor sense of safety',
      'Persistent sadness',
    ],
    commonParentThoughts: [],
    icon: CloudIcon,
  },
  {
    id: 'daily-routines-independence',
    order: 9,
    title: 'Daily Routines & Independence',
    tagline: 'Everyday routines feel impossible.',
    typicalScenarios: [
      'Bedtime battles',
      'Sleep problems',
      'Morning routine chaos',
      'Forgets everything',
      'Loses belongings',
      'Always rushing',
      'Clumsy accidents',
      "Can't stay organized",
      'Household responsibilities',
      'Hygiene struggles',
    ],
    commonParentThoughts: ['Every day feels like chaos.'],
    icon: HomeIcon,
  },
  {
    id: 'caring-for-yourself',
    order: 10,
    title: 'Caring for Yourself as a Parent',
    typicalScenarios: [
      'I feel exhausted.',
      'I feel guilty.',
      "I'm anxious about my child's future.",
      'I yelled again.',
      "I don't know what else to do.",
      'I feel overwhelmed.',
      'My marriage is affected.',
      'Work-life balance is impossible.',
      'I feel lonely.',
      "I feel like I'm failing.",
    ],
    commonParentThoughts: [
      "I'm running out of patience.",
      "Nobody understands how hard it is. I'm carrying this alone.",
      "I'm exhausted.",
    ],
    icon: TeacupIcon,
  },
];

// The one fully-developed ACT coaching example from the document —
// "Getting Started and Following Through," the homework scenario. Coach
// narration is reproduced exactly as written and does not reword itself
// based on which option is chosen, since the source document only scripts
// this single path (the "suppose parent chooses..." branch) — the
// caregiver's actual choice is still recorded and is what the optional
// "tell us more" AI follow-up personalizes around (see actCheckInEngine.ts).
export const ACT_SCENARIOS: ActScenario[] = [
  {
    id: 'getting-started-homework',
    categoryId: 'getting-started',
    title: 'The Homework That Won\'t Start',
    situationText:
      "It has been almost 2 hours since your child came home from school.\nThey've gotten snacks twice, walked around the house, looked at their phone, and sharpened three pencils.\nHomework still hasn't started.",
    beats: [
      {
        id: 'acceptance-checkin',
        step: 'acceptance',
        kind: 'question',
        prompt: "That sounds really hard.\nBefore we think about your child, let's check in with you.\nWhat's happening inside you right now?",
        options: ["I'm frustrated.", "I'm worried they'll fall behind.", 'I\'m angry because this happens every day.', "I'm exhausted."],
      },
      {
        id: 'acceptance-notice',
        step: 'acceptance',
        kind: 'narrative',
        text: "That makes complete sense.\nWhen something important keeps happening over and over, frustration naturally shows up.\nLet's not try to make it disappear.\nInstead, just notice it.\nTake a slow breath.",
      },
      {
        id: 'acceptance-body',
        step: 'acceptance',
        kind: 'question',
        prompt: 'Where do you feel the frustration most?',
        options: ['Tight shoulders?', 'Tight jaw?', 'Fast heartbeat?', 'Heavy chest?'],
      },
      {
        id: 'acceptance-let-it-be',
        step: 'acceptance',
        kind: 'narrative',
        text: 'See if you can simply say to yourself,\n"I\'m noticing frustration is here."\nYou don\'t have to like it.\nYou don\'t have to fix it.\nJust let it be here for a moment.',
      },
      {
        id: 'defusion-intro',
        step: 'cognitiveDefusion',
        kind: 'narrative',
        text: "Now let's notice what your mind is saying.",
      },
      {
        id: 'defusion-thought',
        step: 'cognitiveDefusion',
        kind: 'question',
        prompt: 'Which thought sounds most familiar?',
        options: ['"My child is lazy."', '"They don\'t care."', '"Nothing is ever going to change."', '"I\'m failing as a parent."'],
      },
      {
        id: 'defusion-noticing',
        step: 'cognitiveDefusion',
        kind: 'narrative',
        text:
          'Thank you for noticing that thought.\nInstead of asking whether it\'s true, let\'s simply notice it differently.\nTry saying quietly:\n"I\'m noticing my mind is telling me my child is lazy."\nTake a moment.\nDoes that feel any different from saying,\n"My child is lazy."\nYour mind is trying to explain a difficult situation.\nThat\'s what minds do.\nYou don\'t have to argue with it.\nYou also don\'t have to let it make parenting decisions for you.',
      },
      {
        id: 'present-moment-intro',
        step: 'presentMomentAwareness',
        kind: 'narrative',
        text:
          "Let's pause for a moment and come back to what is happening right now, rather than what your mind is predicting or judging.\nTake one slow breath.\nNow ask yourself:\n\"What can I directly observe in this moment?\"",
      },
      {
        id: 'present-moment-lists',
        step: 'presentMomentAwareness',
        kind: 'reflectionList',
        lists: [
          {
            heading: 'What I can directly observe',
            items: [
              'Homework has not started after two hours.',
              'My child has gotten snacks twice.',
              'My child has walked around the house.',
              'My child has looked at their phone.',
            ],
          },
          {
            heading: 'What my mind is adding',
            items: ['"My child is lazy."', '"They don\'t care."', '"This will never change."'],
          },
        ],
      },
      {
        id: 'present-moment-reflection',
        step: 'presentMomentAwareness',
        kind: 'narrative',
        text:
          'Notice the difference.\nThe first list contains observations. Things you could capture with a video camera.\nThe second list contains your mind\'s interpretations and predictions.\nNeither list is "wrong."\nYour mind is doing what minds naturally do: trying to make sense of a difficult situation.\nFor just this moment, see if you can gently set those stories aside and stay with what you actually know.\nRight now, you know your child is not yet engaged with homework.\nYou don\'t yet know why.\nWhen we stay connected to what we can directly observe, we create more space to respond with curiosity rather than react from assumptions.\nTake one more slow breath.\nNow, let\'s explore the perspective from which you\'re noticing all of this.',
      },
      {
        id: 'self-as-context-intro',
        step: 'selfAsContext',
        kind: 'narrative',
        text:
          'Let\'s pause for a moment.\nRight now, you\'ve noticed several things:\n• You\'re noticing frustration.\n• You\'re noticing the thought, "My child is lazy."\n• You\'re noticing that homework hasn\'t started.\nNow I\'d like you to notice something else.\nWho is noticing all of these experiences?\nThere is a part of you that can observe your frustration.\nThere is a part of you that can notice your thoughts.\nThere is a part of you that can watch this difficult moment unfold.\nThat observing part of you hasn\'t disappeared.\nIt\'s still here.\nIt isn\'t your frustration.\nIt isn\'t your thoughts.\nIt isn\'t this homework battle.\nIt\'s the part of you that can pause, notice, and choose your next step.',
      },
      {
        id: 'self-as-context-reflection',
        step: 'selfAsContext',
        kind: 'question',
        prompt: 'Reflection\nAs you notice your frustration and thoughts, which statement feels most true right now?',
        options: [
          'I am a frustrated parent.',
          "I'm having the experience of frustration right now.",
          "I'm a failure because I can't get my child to start homework.",
          "I don't know how to separate myself from these feelings.",
        ],
      },
      {
        id: 'self-as-context-awareness',
        step: 'selfAsContext',
        kind: 'narrative',
        text:
          'Take one slow breath.\nNotice your frustration.\nNotice your thoughts.\nNotice your body.\nAnd notice that you are the one aware of all of them.\nThat awareness gives you the freedom to choose your next step, not because your frustration is gone, but because you are bigger than this moment.\nFrom that place, let\'s think about the kind of parent you want to be right now.',
      },
      {
        id: 'values-intro',
        step: 'values',
        kind: 'narrative',
        text:
          "You've made space for your frustration.\nYou've noticed the thoughts your mind is offering.\nAnd you've remembered that you are more than those thoughts and feelings.\nNow let's turn toward what matters most.\nWhen parenting becomes difficult, what kind of parent do you want to choose to be in this moment?\nSometimes it helps to imagine looking back from the future.\nImagine your child is an adult, looking back on moments like this. They probably won't remember tonight's homework assignment, but they may remember how they felt when they struggled and how you responded.\nWhat kind of parent do you hope they remember?",
      },
      {
        id: 'values-choice',
        step: 'values',
        kind: 'question',
        prompt: 'Choose the response that feels closest to the parent you want to be right now.',
        options: ['Calm and patient', 'Supportive and encouraging', 'Firm but kind', 'Curious instead of critical', 'Accepting and compassionate'],
      },
      {
        id: 'values-affirm',
        step: 'values',
        kind: 'narrative',
        text:
          'That\'s a meaningful choice.\nNotice that your frustration may still be here.\nYour mind may still be saying,\n"This is never going to change."\nYou don\'t have to wait for those thoughts or feelings to disappear before acting on what matters.\nEvery difficult parenting moment is an opportunity to practice becoming the parent you want to be.\nLet\'s take one small step in that direction.',
      },
      {
        id: 'committed-action-intro',
        step: 'committedAction',
        kind: 'narrative',
        text:
          'You\'ve identified the kind of parent you want to be "supportive and encouraging."\nNow let\'s turn that value into one small action.\nYou don\'t have to solve tonight\'s homework battle all at once.\nInstead, ask yourself:\n"What\'s one small step I can take in the next two minutes that reflects the parent I want to be?"',
      },
      {
        id: 'committed-action-choice',
        step: 'committedAction',
        kind: 'question',
        prompt: 'Choose one.',
        options: [
          'Sit beside your child without talking.',
          "Ask what's making it hard to get started.",
          'Help them choose just one problem.',
          'Set a timer for two minutes and work together until it goes off.',
          'Help them organize the first step before stepping back.',
        ],
      },
      {
        id: 'committed-action-affirm',
        step: 'committedAction',
        kind: 'narrative',
        text:
          "That's a thoughtful choice.\nNotice that your frustration may still be here.\nYou don't have to wait until you feel calm before taking a helpful action.\nYou can carry your frustration with you while choosing to respond in a way that reflects your values.\nEach small, intentional action is a chance to practice becoming the parent you want to be.",
      },
      {
        id: 'looking-back-intro',
        step: 'lookingBack',
        kind: 'narrative',
        text: "Before we finish, take a moment to reflect on today's experience.\nWhat is one thing you'd like to remember the next time a difficult parenting moment happens?",
      },
      {
        id: 'looking-back-choice',
        step: 'lookingBack',
        kind: 'question',
        prompt: 'Choose the statement that speaks to you most.',
        options: [
          'Pause before reacting.',
          'Notice what my mind is telling me.',
          "My feelings don't have to make my decisions.",
          'Come back to what matters most.',
          'Small steps make meaningful progress.',
          'My child is learning.',
          'I am learning too.',
        ],
      },
      {
        id: 'looking-back-encouragement',
        step: 'lookingBack',
        kind: 'narrative',
        text:
          "Take one slow breath.\nParenting a child with ADHD is challenging, and there will be difficult moments again.\nWhat matters isn't responding perfectly every time.\nWhat matters is your willingness to pause, reconnect with your values, and take one small step in the direction of the parent you want to be.\nEvery value-guided choice, no matter how small, is meaningful.\nWe'll be here to practice with you, one moment at a time.",
      },
    ],
  },
];

export function getCategoryById(id: string): ActCategory | undefined {
  return ACT_CATEGORIES.find((c) => c.id === id);
}

export function getScenariosForCategory(categoryId: string): ActScenario[] {
  return ACT_SCENARIOS.filter((s) => s.categoryId === categoryId);
}

export function getScenarioById(id: string | undefined): ActScenario | undefined {
  if (!id) return undefined;
  return ACT_SCENARIOS.find((s) => s.id === id);
}
