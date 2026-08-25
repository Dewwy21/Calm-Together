import { MegaphoneIcon, ThoughtIcon, ChartIcon, PersonIcon, ChatIcon, StarIcon, CheckIcon, BubbleIcon, PeopleIcon } from '../../../components/icons';
import { buildLesson } from '../lessonHelpers';
import { Lesson } from '../types';

export const LISTENING_LESSONS: Lesson[] = [
  buildLesson({
    id: 'listen-why-not',
    courseId: 'listening',
    title: 'Why "I Told You Three Times" Doesn\'t Work',
    summary: "It's rarely defiance — it's how the instruction did or didn't land.",
    estimatedMinutes: 5,
    icon: MegaphoneIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Why "I Told You Three Times" Doesn\'t Work',
        hook: "It's rarely defiance — it's usually about how the instruction reached, or didn't reach, their attention in the first place.",
        icon: MegaphoneIcon,
      },
      {
        kind: 'concept',
        heading: "Attention has to be caught, not just spoken to",
        body: "Calling out an instruction from another room competes with whatever already has your child's attention — a screen, a toy, their own thoughts. If it was never received, repeating it louder doesn't fix that.",
        icon: ThoughtIcon,
      },
      {
        kind: 'concept',
        heading: "It's a two-step problem",
        body: "Listening actually requires two separate skills: noticing the instruction, and holding onto it long enough to act on it. ADHD can affect both — not because your child doesn't care.",
        icon: ThoughtIcon,
      },
      {
        kind: 'stat',
        heading: 'Attention has to be captured first',
        statText: '3x',
        detail: 'Roughly how much more often an instruction is followed when the caregiver gets attention — eye contact, proximity — before speaking, versus calling out from across the room.',
        icon: ChartIcon,
      },
      {
        kind: 'quiz',
        question: 'You call out "put your shoes on" from the kitchen while your child is watching TV. They don\'t move. What\'s most likely happening?',
        options: ['Pure defiance', 'The instruction may never have actually landed', "They're testing you on purpose", 'Nothing can be done about it'],
        correctIndex: 1,
        explanation:
          "Without getting attention first, an instruction competes with whatever your child is already focused on — and often simply doesn't register.",
      },
      {
        kind: 'reflection',
        prompt: "Think of a recent \"they're not listening\" moment — did you have their attention before you spoke?",
      },
      {
        kind: 'exercise',
        title: 'Try attention-first today',
        instructions: 'Before your next instruction, walk over, get close, and make sure you have your child\'s attention before you say it.',
      },
    ],
  }),

  buildLesson({
    id: 'listen-eye-level',
    courseId: 'listening',
    title: 'Getting Down to Their Level',
    summary: 'A small physical shift changes how an instruction lands.',
    estimatedMinutes: 4,
    icon: PersonIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Getting Down to Their Level',
        hook: 'A small physical shift — literally getting lower — changes how an instruction lands.',
        icon: PersonIcon,
      },
      {
        kind: 'concept',
        heading: 'Why height matters',
        body: 'Speaking down at a child from standing height can register as looming or confrontational, especially mid-distraction. Getting to their eye level shifts the whole tone before you say a word.',
        icon: PersonIcon,
      },
      {
        kind: 'example',
        heading: 'In practice',
        scenario:
          'Instead of calling from the doorway, one parent started crouching next to her son, touching his shoulder gently, and waiting a beat before speaking. Compliance improved almost immediately — not because the words changed, but because the delivery did.',
        takeaway: 'The same instruction lands differently depending on how it\'s delivered.',
      },
      {
        kind: 'timeline',
        heading: 'The eye-level approach',
        steps: ['Walk over instead of calling out', 'Get down to their physical level', 'Make brief eye contact if they can tolerate it', 'Say one clear instruction, calmly'],
      },
      {
        kind: 'quiz',
        question: "What's the main reason getting to eye level helps?",
        options: [
          'It is a rule that must be followed',
          'It shifts the tone from looming to connecting, and confirms attention',
          'It has no real effect',
          'It only matters for toddlers',
        ],
        correctIndex: 1,
        explanation: 'Eye level changes the felt tone of an instruction and helps confirm you actually have your child\'s attention before speaking.',
      },
      {
        kind: 'reflection',
        prompt: 'How often do you currently give instructions from across a room versus up close?',
      },
      {
        kind: 'exercise',
        title: 'Practice it once today',
        instructions:
          'The next time you need to give an instruction, walk over and get to your child\'s level before saying it — just once, and notice what\'s different.',
      },
    ],
  }),

  buildLesson({
    id: 'listen-one-instruction',
    courseId: 'listening',
    title: 'One Instruction at a Time',
    summary: 'Three-step instructions ask a lot of a still-developing memory.',
    estimatedMinutes: 4,
    icon: ThoughtIcon,
    cards: [
      {
        kind: 'intro',
        title: 'One Instruction at a Time',
        hook: 'Three-step instructions ask a lot of a working memory that\'s still under construction.',
        icon: ThoughtIcon,
      },
      {
        kind: 'concept',
        heading: 'Working memory has a limited hold',
        body: '"Put your shoes on, grab your backpack, and get in the car" asks your child to hold three items in mind at once. If the first one wobbles, the rest often falls too.',
        icon: ThoughtIcon,
      },
      {
        kind: 'comparison',
        heading: 'Multi-step vs. one-step',
        leftLabel: 'Multi-step',
        leftItems: ['"Brush your teeth, get dressed, and come down"', 'Relies on holding three items in memory', 'Often only step one gets done'],
        rightLabel: 'One-step',
        rightItems: ['"Brush your teeth" — then check in', 'Confirms each step before the next', 'Higher completion rate overall'],
      },
      {
        kind: 'quiz',
        question: 'Your child was given three instructions and only did the first one. What\'s the most useful response?',
        options: [
          'Assume they are ignoring you on purpose',
          'Give the next single step now, calmly',
          'Repeat all three louder',
          'Give up on multi-step tasks entirely',
        ],
        correctIndex: 1,
        explanation:
          'Delivering the next step individually works with working-memory limits instead of testing them — and usually gets the whole sequence done.',
      },
      {
        kind: 'reflection',
        prompt: 'Do you tend to give instructions one at a time, or bundle several together?',
      },
      {
        kind: 'exercise',
        title: 'Break your next instruction into one step',
        instructions: 'Next time you\'d normally give two or three steps at once, give just the first, and add the next only once it\'s done.',
      },
    ],
  }),

  buildLesson({
    id: 'listen-when-then',
    courseId: 'listening',
    title: 'When-Then Instead of Threats',
    summary: 'Same boundary, completely different emotional tone.',
    estimatedMinutes: 4,
    icon: ChatIcon,
    cards: [
      {
        kind: 'intro',
        title: 'When-Then Instead of Threats',
        hook: 'Swapping an if-then threat for a when-then statement changes the entire emotional tone of a request.',
        icon: ChatIcon,
      },
      {
        kind: 'concept',
        heading: 'Threats invite a fight',
        body: '"If you don\'t clean up, no screen time" frames the moment as a power struggle with a punishment attached. "When your toys are put away, you can have screen time" frames the exact same boundary as a simple sequence.',
        icon: ChatIcon,
      },
      {
        kind: 'comparison',
        heading: 'Same boundary, different framing',
        leftLabel: 'If-then (threat)',
        leftItems: ['"If you don\'t stop, you\'re grounded"', 'Sounds like a punishment', 'Invites pushback'],
        rightLabel: 'When-then (sequence)',
        rightItems: ['"When shoes are on, we can go"', 'Sounds like a simple fact', 'Less to argue with'],
      },
      {
        kind: 'quiz',
        question: 'Which is a when-then statement?',
        options: [
          '"If you don\'t listen, no dessert"',
          '"When your plate is clear, you can have dessert"',
          '"You\'d better listen or else"',
          '"Stop it right now"',
        ],
        correctIndex: 1,
        explanation: 'When-then statements describe a natural sequence rather than a threatened punishment, which tends to lower resistance.',
      },
      {
        kind: 'scenario',
        heading: 'Try reframing it',
        situation: 'Your child won\'t get off the tablet to come to dinner, and dinner is getting cold. What do you say?',
        options: [
          {
            text: '"If you don\'t turn that off right now, no tablet tomorrow."',
            feedback:
              'A real boundary, but framed as a threat — it tends to invite exactly the pushback you\'re trying to avoid, on top of the transition itself being hard.',
          },
          {
            text: '"When the tablet is off, dinner\'s ready for you."',
            feedback:
              'Same boundary, stated as a simple sequence instead of a punishment. Nothing to argue with, and it doesn\'t add a second battle on top of the transition.',
          },
          {
            text: '"You always do this, why can\'t you just listen?"',
            feedback:
              'Understandable in a frustrated moment, but it\'s about the pattern, not this instruction — it gives your child nothing concrete to actually do next.',
          },
        ],
      },
      {
        kind: 'reflection',
        prompt: "What's one if-then threat you catch yourself using that could become a when-then instead?",
      },
      {
        kind: 'exercise',
        title: 'Try one when-then swap',
        instructions: 'Pick one common instruction today and rephrase it as "when X, then Y" instead of a threat.',
      },
    ],
  }),

  buildLesson({
    id: 'listen-specific-praise',
    courseId: 'listening',
    title: 'The Power of Specific Praise',
    summary: 'Naming good listening out loud makes it more likely to repeat.',
    estimatedMinutes: 4,
    icon: StarIcon,
    cards: [
      {
        kind: 'intro',
        title: 'The Power of Specific Praise',
        hook: 'Noticing good listening out loud, specifically, makes it far more likely to happen again.',
        icon: StarIcon,
      },
      {
        kind: 'concept',
        heading: "Vague praise doesn't teach",
        body: '"Good job" doesn\'t tell your child what worked. "You put your shoes on right when I asked — that was fast listening" names the exact behavior worth repeating.',
        icon: StarIcon,
      },
      {
        kind: 'example',
        heading: 'In practice',
        scenario:
          '"I noticed you came the first time I called you — that really helped us get out the door on time." Specific, immediate, tied directly to the listening behavior itself.',
        takeaway: 'Specificity is what turns praise into actual teaching.',
      },
      {
        kind: 'decisionTree',
        heading: 'When to praise listening',
        branches: [
          { condition: 'Child follows an instruction the first time', action: 'Name it immediately and specifically' },
          { condition: 'Child needed a reminder but still complied', action: 'Still acknowledge the compliance, even if it took a nudge' },
          { condition: 'Child is mid-task and on track', action: 'A quiet nod or thumbs up works too — not everything needs words' },
        ],
      },
      {
        kind: 'quiz',
        question: 'Which is the most useful kind of praise for listening?',
        options: ['"Good job"', '"You\'re such a good listener"', '"You came right when I called — thank you"', 'No praise, just move on'],
        correctIndex: 2,
        explanation:
          'Specific, immediate praise tied to the exact behavior teaches your child exactly what worked, more than a general compliment does.',
      },
      {
        kind: 'reflection',
        prompt: "When's the last time you specifically named a moment your child listened well?",
      },
      {
        kind: 'exercise',
        title: 'Catch it three times today',
        instructions: 'Look for three moments today where your child listens, even in a small way, and name it specifically and immediately.',
      },
    ],
  }),

  buildLesson({
    id: 'listen-follow-through',
    courseId: 'listening',
    title: 'Follow-Through: Meaning What You Say',
    summary: 'An instruction only works if it\'s followed through on — consistently.',
    estimatedMinutes: 5,
    icon: CheckIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Follow-Through: Meaning What You Say',
        hook: "An instruction only works if it's followed through on — consistently, not perfectly.",
        icon: CheckIcon,
      },
      {
        kind: 'concept',
        heading: 'Inconsistency teaches testing',
        body: "If a boundary sometimes holds and sometimes doesn't, your child learns, correctly, that testing it is worth trying. It's not manipulation — it's an accurate read of the pattern.",
        icon: CheckIcon,
      },
      {
        kind: 'comparison',
        heading: 'Hollow vs. real follow-through',
        leftLabel: 'Hollow',
        leftItems: ['Said with no plan to enforce', 'Empty threats stacked up', "Enforced only when you're not tired"],
        rightLabel: 'Real',
        rightItems: ["Said only if you'll actually follow it", 'Fewer boundaries, held consistently', 'Enforced the same way every time'],
      },
      {
        kind: 'quiz',
        question: 'What matters more for follow-through — the number of rules, or the consistency of a few?',
        options: [
          'More rules is always better',
          'Consistency on fewer rules beats inconsistency on many',
          'Neither matters much',
          'Only the tone matters, not the follow-through',
        ],
        correctIndex: 1,
        explanation:
          "It's better to hold three consistent boundaries than to announce ten and only enforce two — consistency is what actually builds trust in the boundary.",
      },
      {
        kind: 'reflection',
        prompt: 'Is there a boundary you hold sometimes and let slide other times, depending on how tired you are?',
      },
      {
        kind: 'exercise',
        title: 'Pick one boundary to hold this week',
        instructions: 'Choose one instruction or boundary and commit to following through on it exactly the same way, every time, for one week.',
      },
    ],
  }),

  buildLesson({
    id: 'listen-reduce-nagging',
    courseId: 'listening',
    title: 'Reducing Nagging and Repeating',
    summary: 'Repeating an instruction can accidentally train a delay.',
    estimatedMinutes: 4,
    icon: MegaphoneIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Reducing Nagging and Repeating',
        hook: 'Repeating an instruction five times often trains a child to wait for repetition four, not to listen the first time.',
        icon: MegaphoneIcon,
      },
      {
        kind: 'concept',
        heading: 'Repetition can accidentally teach delay',
        body: "If your child learns instructions only really count around the third or fourth time, they'll reasonably tune out the first two. The pattern gets trained by what actually happens, not by what's said.",
        icon: MegaphoneIcon,
      },
      {
        kind: 'timeline',
        heading: 'Breaking the repeat cycle',
        steps: [
          'Get attention first, say it once, clearly',
          'Wait a few seconds, resist repeating immediately',
          'If nothing happens, walk over and check in',
          'Follow through calmly rather than repeating louder',
        ],
      },
      {
        kind: 'quiz',
        question: 'What\'s the risk of repeating the same instruction five times before following through?',
        options: [
          'No risk at all',
          'It can teach your child that early repetitions don\'t really count',
          'It always works eventually so it is fine',
          'It makes the instruction clearer',
        ],
        correctIndex: 1,
        explanation: 'If follow-through only happens after several repeats, that becomes the pattern your child learns to expect and wait for.',
      },
      {
        kind: 'reflection',
        prompt: 'How many times do you typically repeat an instruction before doing anything else?',
      },
      {
        kind: 'exercise',
        title: 'Say it once today',
        instructions: 'Pick one instruction, say it clearly one time, then follow through calmly instead of repeating it.',
      },
    ],
  }),

  buildLesson({
    id: 'listen-games',
    courseId: 'listening',
    title: 'Listening Games That Build the Skill',
    summary: 'Low-stakes play builds the same muscle as real instructions.',
    estimatedMinutes: 4,
    icon: BubbleIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Listening Games That Build the Skill',
        hook: 'Practicing the skill of listening during low-stakes play makes it easier to access during real moments.',
        icon: BubbleIcon,
      },
      {
        kind: 'concept',
        heading: 'Practice outside the pressure moment',
        body: "It's much harder to build a new skill in the middle of a conflict. Short, playful listening games build the same muscle without the stakes of an actual instruction moment.",
        icon: BubbleIcon,
      },
      {
        kind: 'comparison',
        heading: 'A few options',
        leftLabel: 'Simple games',
        leftItems: ['Simon Says', 'Freeze dance on a verbal cue', 'Copy-my-clap patterns'],
        rightLabel: 'What they build',
        rightItems: ['Following a single spoken cue', 'Reacting quickly to an instruction', 'Holding a short sequence in mind'],
      },
      {
        kind: 'quiz',
        question: 'Why do listening games actually help with real-life instructions?',
        options: [
          'They do not — it is just fun',
          'They build the same attention-and-follow skills in a low-pressure setting',
          'Only academic drills build listening skills',
          'They replace the need for real instructions',
        ],
        correctIndex: 1,
        explanation:
          'Games practice the same underlying skills — attention, sequencing, quick response — without the emotional stakes of a real conflict moment.',
      },
      {
        kind: 'reflection',
        prompt: "What's a game your child already enjoys that could double as listening practice?",
      },
      {
        kind: 'exercise',
        title: 'Play one listening game today',
        instructions: 'Spend five minutes playing Simon Says or a similar game together — no lesson talk, just practice.',
      },
    ],
  }),

  buildLesson({
    id: 'listen-consistency',
    courseId: 'listening',
    title: 'Consistency Across Everyone',
    summary: 'The same instruction lands differently from different caregivers.',
    estimatedMinutes: 5,
    icon: PeopleIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Consistency Across Everyone',
        hook: 'The same instruction, delivered differently by different caregivers, teaches a very different lesson than a united approach does.',
        icon: PeopleIcon,
      },
      {
        kind: 'concept',
        heading: 'Kids notice the gaps',
        body: "If one caregiver holds a boundary and another doesn't, most kids quickly learn which adult to test. That's not manipulation — it's an accurate read of a genuinely inconsistent system.",
        icon: PeopleIcon,
      },
      {
        kind: 'comparison',
        heading: 'Before vs. after this course',
        leftLabel: 'Before',
        leftItems: ['Instructions repeated, ignored, escalated', 'One-size-fits-all delivery', 'Different rules with different people'],
        rightLabel: 'Now',
        rightItems: ['Attention-first, one clear ask', 'Delivery matched to the moment', 'A shared, agreed approach'],
      },
      {
        kind: 'stat',
        heading: 'A quick shared-language check',
        statText: '5 min',
        detail: 'How long a quick weekly check-in between caregivers — comparing what\'s working, what phrases you\'re both using — typically takes, and how much smoother consistency gets as a result.',
        icon: ChartIcon,
      },
      {
        kind: 'quiz',
        question: 'What helps most when two caregivers want kids to listen consistently?',
        options: [
          'Each parent enforces things their own way',
          'A brief, regular check-in to align on phrases and follow-through',
          'Only one parent should give instructions',
          'It does not matter as long as rules exist somewhere',
        ],
        correctIndex: 1,
        explanation: 'A shared, agreed approach — even briefly discussed — closes the gaps kids naturally learn to test.',
      },
      {
        kind: 'reflection',
        prompt: "Where do you and any other caregivers in your child's life handle instructions differently?",
      },
      {
        kind: 'exercise',
        title: 'Have a 5-minute alignment chat',
        instructions: 'Talk with another caregiver today about one instruction-and-follow-through approach from this course you both want to use the same way.',
        relatedActivity: { label: 'Talk it through with Help Bot', href: '/(tabs)/help-bot' },
      },
    ],
  }),
];
