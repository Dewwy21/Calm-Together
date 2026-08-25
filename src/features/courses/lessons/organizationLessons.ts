import { BackpackIcon, ThoughtIcon, MegaphoneIcon, ChartIcon, HomeIcon, BellIcon, BookIcon, MoonIcon, StarIcon } from '../../../components/icons';
import { buildLesson } from '../lessonHelpers';
import { Lesson } from '../types';

export const ORGANIZATION_LESSONS: Lesson[] = [
  buildLesson({
    id: 'org-why-hard',
    courseId: 'organization',
    title: 'Why This Feels So Hard',
    summary: "Organization is a brain skill, not a personality trait.",
    estimatedMinutes: 5,
    icon: BackpackIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Why This Feels So Hard',
        hook: "Organization isn't a personality trait — it's a set of brain skills, and for ADHD kids, several of them are still under construction.",
        icon: BackpackIcon,
      },
      {
        kind: 'concept',
        heading: 'Meet executive function',
        body: "Working memory, planning, and time estimation are the brain skills organization actually runs on. In ADHD, these often lag several years behind same-age peers — not from laziness, from timing.",
        icon: ThoughtIcon,
      },
      {
        kind: 'concept',
        heading: "Why nagging doesn't fix it",
        body: "Reminding your child to \"just remember\" leans on exactly the skill that's underdeveloped. External supports do the job a still-forming memory can't yet.",
        icon: MegaphoneIcon,
      },
      {
        kind: 'stat',
        heading: 'A real developmental gap',
        statText: '~30%',
        detail: "A widely cited rule of thumb: executive function in ADHD often runs roughly 30% behind chronological age. An 11-year-old's organizing skills may look more like an 8-year-old's.",
        icon: ChartIcon,
      },
      {
        kind: 'quiz',
        question: "Your 11-year-old still needs a visible checklist to get out the door. What does this most likely mean?",
        options: [
          'They are being lazy',
          "Their organizing skills are developing at their own pace, like any other skill",
          "You haven't punished inconsistency enough",
          'Nothing can help until they are older',
        ],
        correctIndex: 1,
        explanation: "Executive function develops on its own timeline. A visible support isn't a crutch — it's scaffolding for a skill still under construction.",
      },
      {
        kind: 'reflection',
        prompt: "Where have you been expecting a level of organization your child's age suggests, but their skills don't fully support yet?",
      },
      {
        kind: 'exercise',
        title: 'Swap one reminder for one visual',
        instructions:
          'Pick a task you currently remind your child about verbally, and replace it with something they can see — a sticky note, a checklist, an object placed somewhere obvious.',
      },
    ],
  }),

  buildLesson({
    id: 'org-visual-schedules',
    courseId: 'organization',
    title: 'Visual Schedules That Actually Work',
    summary: 'A schedule your child can see beats one they have to remember.',
    estimatedMinutes: 4,
    icon: ChartIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Visual Schedules That Actually Work',
        hook: 'A schedule your child can see beats one they\'re expected to remember, every time.',
        icon: ChartIcon,
      },
      {
        kind: 'concept',
        heading: 'Externalize the plan',
        body: "A picture or word-based schedule posted somewhere visible does the remembering so your child doesn't have to hold the whole day in their head at once.",
        icon: ChartIcon,
      },
      {
        kind: 'comparison',
        heading: 'What works vs. what doesn\'t',
        leftLabel: 'Struggles',
        leftItems: ['Verbal-only instructions', 'One giant list, all at once', 'Hidden in a drawer or app'],
        rightLabel: 'Works better',
        rightItems: ['Pictures or short words, posted visibly', 'Broken into small chunks', 'At eye level, in the room it\'s used'],
      },
      {
        kind: 'example',
        heading: 'A simple version',
        scenario:
          'A morning schedule taped to the bathroom mirror: wake up, bathroom, get dressed, breakfast, teeth, shoes, bag. Five to seven words each, one per line, a small icon next to each.',
        takeaway: "It doesn't need to be fancy to work — it needs to be visible and specific.",
      },
      {
        kind: 'quiz',
        question: 'Where should a visual schedule usually go?',
        options: [
          'In a notebook kept in a backpack',
          'Somewhere visible in the room it\'s actually used',
          'Only on a phone app',
          'Read aloud once each morning instead of posted',
        ],
        correctIndex: 1,
        explanation: "A schedule only works as external memory if it's actually in view at the moment it's needed.",
      },
      {
        kind: 'reflection',
        prompt: 'Which part of the day feels most chaotic right now — mornings, homework, bedtime?',
      },
      {
        kind: 'exercise',
        title: 'Make one visual schedule',
        instructions:
          'Pick your hardest stretch of the day and build a simple checklist for it with your child today — five to seven steps, posted somewhere visible.',
      },
    ],
  }),

  buildLesson({
    id: 'org-landing-zone',
    courseId: 'organization',
    title: 'Build a Landing Zone',
    summary: 'One consistent spot ends the daily "where is it" scramble.',
    estimatedMinutes: 4,
    icon: HomeIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Build a Landing Zone',
        hook: 'One consistent spot for backpack, shoes, and keys ends the daily "where is it" scramble before it starts.',
        icon: HomeIcon,
      },
      {
        kind: 'concept',
        heading: "The problem isn't memory, it's location",
        body: "If an item's home changes daily, your child has to relocate it from memory every single time — a working-memory task, not a tidiness one. Fix the location, and the memory problem mostly disappears.",
        icon: HomeIcon,
      },
      {
        kind: 'timeline',
        heading: 'Setting one up',
        steps: [
          'Pick one spot near the door — a hook, bin, or shelf',
          'Limit it to three or four items max: backpack, shoes, jacket, keys',
          'Walk through it together a few times on purpose',
          'Keep it in that exact spot, even on hectic days',
        ],
      },
      {
        kind: 'quiz',
        question: 'Why does a landing zone need to stay in the exact same spot every day?',
        options: [
          'It looks tidier',
          'Consistency is what turns it into automatic memory instead of a new decision each time',
          'It is required for it to count as organized',
          'It does not matter as long as it is somewhere',
        ],
        correctIndex: 1,
        explanation:
          'A fixed location becomes automatic through repetition. Moving it around defeats the purpose — it becomes one more thing to remember.',
      },
      {
        kind: 'reflection',
        prompt: 'What item causes the most "where is it" scrambling in your house?',
      },
      {
        kind: 'exercise',
        title: 'Set up one landing zone',
        instructions: 'Pick a spot near your main door today and place a hook or bin there for the single most-lost item in your house.',
      },
    ],
  }),

  buildLesson({
    id: 'org-time-blindness',
    courseId: 'organization',
    title: 'Taming Time Blindness',
    summary: '"Five more minutes" means something different to an ADHD brain.',
    estimatedMinutes: 5,
    icon: BellIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Taming Time Blindness',
        hook: '"Five more minutes" means something very different to an ADHD brain than to yours — here\'s why, and what to do instead.',
        icon: BellIcon,
      },
      {
        kind: 'concept',
        heading: 'What time blindness actually is',
        body: 'Many ADHD brains have a genuinely weaker internal sense of time passing. "We\'ll leave soon" doesn\'t register as a countdown the way it does for you — it needs to be made visible instead.',
        icon: BellIcon,
      },
      {
        kind: 'comparison',
        heading: 'Invisible time vs. visible time',
        leftLabel: 'Invisible',
        leftItems: ['"Five more minutes"', 'A clock on the wall, unreferenced', 'One abrupt "time\'s up"'],
        rightLabel: 'Visible',
        rightItems: ['A visual timer they can watch drain', 'Countdowns: 10, 5, 2 minutes', 'A warning before the warning'],
      },
      {
        kind: 'quiz',
        question: 'What tends to work better than a single verbal warning before a transition?',
        options: [
          'No warning, so there is no anticipatory stress',
          'One louder warning',
          'A layered countdown — 10, 5, 2 minutes, then now',
          'Letting them set their own timer with no check-ins',
        ],
        correctIndex: 2,
        explanation:
          'A layered countdown gives the brain a gradual on-ramp instead of a sudden stop, which is much easier for a still-developing sense of time to work with.',
      },
      {
        kind: 'reflection',
        prompt: 'Which transition in your day causes the most time-related friction?',
      },
      {
        kind: 'exercise',
        title: 'Try a visual timer today',
        instructions:
          'Use a visual or sand timer for your next hard transition, showing time actually draining rather than just stating a number.',
        relatedActivity: { label: "Explore Calm Corner's tools", href: '/(modals)/calm-corner' },
      },
    ],
  }),

  buildLesson({
    id: 'org-homework-station',
    courseId: 'organization',
    title: 'The Homework Station Setup',
    summary: 'Where homework happens matters almost as much as how.',
    estimatedMinutes: 4,
    icon: BookIcon,
    cards: [
      {
        kind: 'intro',
        title: 'The Homework Station Setup',
        hook: 'Where homework happens matters almost as much as how it\'s approached.',
        icon: BookIcon,
      },
      {
        kind: 'concept',
        heading: 'Reduce decisions, reduce friction',
        body: 'A consistent spot, stocked with supplies already there, removes several small decision points — where to sit, what to grab — that can each become a stall point for a task-initiation-challenged brain.',
        icon: BookIcon,
      },
      {
        kind: 'decisionTree',
        heading: 'Choosing the right setup',
        branches: [
          { condition: 'Child gets distracted easily by movement or noise', action: 'Face away from doorways and windows, use a quiet room' },
          { condition: 'Child struggles to start tasks', action: 'Sit nearby for the first two minutes, just as a presence' },
          { condition: 'Child loses supplies mid-task', action: 'Keep a stocked caddy right at the station — pencils, eraser, ruler' },
        ],
      },
      {
        kind: 'quiz',
        question: 'Why does sitting with your child for just the first two minutes of homework often help?',
        options: [
          'It does the work for them',
          'Starting is often the hardest part — presence lowers that barrier',
          'It has nothing to do with task initiation',
          'It only works for younger kids',
        ],
        correctIndex: 1,
        explanation:
          'Task initiation is a distinct executive function skill from motivation. Lowering the barrier to starting — not the size of the task — is often what actually unsticks things.',
      },
      {
        kind: 'reflection',
        prompt: 'Where does homework currently happen, and does that spot help or hurt?',
      },
      {
        kind: 'exercise',
        title: 'Set up a homework caddy',
        instructions: 'Stock a small basket with the basics — pencils, eraser, paper — and keep it permanently at your child\'s homework spot.',
      },
    ],
  }),

  buildLesson({
    id: 'org-breaking-tasks',
    courseId: 'organization',
    title: 'Breaking Big Tasks Into Tiny Steps',
    summary: '"Clean your room" is nearly impossible to start. This isn\'t.',
    estimatedMinutes: 4,
    icon: BackpackIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Breaking Big Tasks Into Tiny Steps',
        hook: '"Clean your room" is nearly impossible to start. "Put the books on the shelf" isn\'t.',
        icon: BackpackIcon,
      },
      {
        kind: 'concept',
        heading: 'Big and vague is the enemy',
        body: 'A large, undefined task overwhelms a working memory that struggles to hold and sequence multiple steps at once. Breaking it down does that sequencing work externally instead.',
        icon: BackpackIcon,
      },
      {
        kind: 'example',
        heading: 'In practice',
        scenario:
          '"Clean your room" becomes: put dirty clothes in the hamper, then books on the shelf, then toys in the bin. Same end result, completely different starting experience.',
        takeaway: 'Specific and small beats big and vague, every time.',
      },
      {
        kind: 'timeline',
        heading: 'Breaking down any big task',
        steps: [
          'Picture the very first physical action, not the whole goal',
          'State it as one comically small, concrete step',
          'Let that step finish fully before naming the next',
          'Celebrate each finished step, not just the whole job',
        ],
      },
      {
        kind: 'quiz',
        question: 'Which instruction is most likely to actually get started?',
        options: ['"Clean your room"', '"Get your room in order"', '"Put the dirty clothes in the hamper"', '"Do better with your space"'],
        correctIndex: 2,
        explanation:
          'The specific, single-action version gives a clear, immediate first move — exactly what a task-initiation-challenged brain needs to get going.',
      },
      {
        kind: 'reflection',
        prompt: 'What\'s one task that regularly stalls out because it\'s too big or vague as given?',
      },
      {
        kind: 'exercise',
        title: 'Break one task down today',
        instructions: 'Take one task you\'d normally give as one big instruction and split it into three tiny, specific steps instead.',
      },
    ],
  }),

  buildLesson({
    id: 'org-morning-routine',
    courseId: 'organization',
    title: 'A Morning Routine That Doesn\'t Start a War',
    summary: 'Often the hardest stretch of the day — also the most fixable.',
    estimatedMinutes: 5,
    icon: HomeIcon,
    cards: [
      {
        kind: 'intro',
        title: 'A Morning Routine That Doesn\'t Start a War',
        hook: 'Mornings are often the hardest stretch of the day — and also the most fixable, with the right structure.',
        icon: HomeIcon,
      },
      {
        kind: 'concept',
        heading: 'Start smaller than feels necessary',
        body: 'Trying to fix the whole morning at once usually collapses within a week. Picking the single hardest five-minute stretch and solidifying just that first tends to actually stick.',
        icon: HomeIcon,
      },
      {
        kind: 'comparison',
        heading: 'What breaks a morning routine',
        leftLabel: 'Common mistakes',
        leftItems: ['Too many steps at once', 'Relies on memory, not visuals', 'Abandoned on hard days'],
        rightLabel: 'What holds up',
        rightItems: ['Starts with the hardest 5 minutes', 'Visible checklist, not verbal', 'Same every day, even rushed ones'],
      },
      {
        kind: 'quiz',
        question: 'Why start with just the hardest five-minute stretch instead of overhauling the whole morning?',
        options: [
          'It is less effort overall',
          'A smaller, solid win is more likely to actually stick than a big system that collapses',
          'The rest of the morning does not matter',
          'It only works for younger kids',
        ],
        correctIndex: 1,
        explanation:
          'Routines fail more often from being too big too fast than from being too small. A small, consistent win becomes the foundation to build on.',
      },
      {
        kind: 'reflection',
        prompt: 'What\'s the single hardest five-minute stretch of your mornings right now?',
      },
      {
        kind: 'exercise',
        title: 'Build one 5-minute routine',
        instructions:
          'Create a simple, visible checklist for just that one hardest stretch, and run it exactly the same way for a full week.',
      },
    ],
  }),

  buildLesson({
    id: 'org-bedtime-routine',
    courseId: 'organization',
    title: 'A Bedtime Routine for Smoother Nights',
    summary: 'Resistance is rarely defiance — it\'s a transition problem in disguise.',
    estimatedMinutes: 5,
    icon: MoonIcon,
    cards: [
      {
        kind: 'intro',
        title: 'A Bedtime Routine for Smoother Nights',
        hook: 'Bedtime resistance is rarely about defiance — it\'s often a transition problem wearing a stalling costume.',
        icon: MoonIcon,
      },
      {
        kind: 'concept',
        heading: 'Why bedtime is its own kind of hard',
        body: 'It combines two of the hardest things for an ADHD brain: stopping an engaging activity, and downshifting from a stimulated day into stillness. Both take real effort to do well.',
        icon: MoonIcon,
      },
      {
        kind: 'timeline',
        heading: 'A wind-down sequence',
        steps: [
          'Screens off 30 to 60 minutes before bed',
          'A predictable quiet activity — bath, book, low light',
          'The same three or four steps, same order, every night',
          'A consistent goodnight phrase or routine to close it out',
        ],
      },
      {
        kind: 'quiz',
        question: 'Why do screens tend to make bedtime harder for ADHD kids specifically?',
        options: [
          'Screens are always bad',
          'Bright light and stimulation make the downshift into stillness even harder',
          'It has nothing to do with sleep',
          'Only certain content matters',
        ],
        correctIndex: 1,
        explanation:
          'Stimulating input right before bed works directly against the nervous-system downshift bedtime requires, which is already a harder transition for many ADHD kids.',
      },
      {
        kind: 'reflection',
        prompt: 'What does the last 30 minutes before your child\'s bedtime actually look like right now?',
      },
      {
        kind: 'exercise',
        title: 'Try one consistent wind-down step',
        instructions: 'Pick one small, repeatable step — dimming lights, a specific book, a phrase — and use it at the same point every night this week.',
      },
    ],
  }),

  buildLesson({
    id: 'org-toolkit',
    courseId: 'organization',
    title: 'Your Family\'s Organization Toolkit',
    summary: 'Systems that survive a bad day — pulling it all together.',
    estimatedMinutes: 5,
    icon: StarIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Your Family\'s Organization Toolkit',
        hook: 'Systems work when they\'re simple enough to survive a bad day. Let\'s pull together what actually holds up.',
        icon: StarIcon,
      },
      {
        kind: 'concept',
        heading: 'Small chores, big wins',
        body: 'A short, visible chore chart with two or three age-appropriate tasks builds real responsibility without overwhelming a still-developing planning system.',
        icon: BackpackIcon,
      },
      {
        kind: 'comparison',
        heading: 'Before vs. after this course',
        leftLabel: 'Before',
        leftItems: ['Relying on memory and nagging', 'One big system, all at once', 'Struggles feel like character flaws'],
        rightLabel: 'Now',
        rightItems: ['Visible supports doing the remembering', 'Small, solid pieces built one at a time', 'Struggles are skill gaps, not flaws'],
      },
      {
        kind: 'stat',
        heading: 'Small and steady wins',
        statText: '2–3 wks',
        detail: 'How long a new organizational habit typically takes to start feeling automatic. Expect some wobble before it clicks — that\'s normal, not failure.',
        icon: ChartIcon,
      },
      {
        kind: 'quiz',
        question: 'What\'s the biggest reason organizational systems fall apart?',
        options: [
          'The child does not want to be organized',
          'Too many steps introduced all at once, with no visible anchor',
          'Parents do not care enough',
          'They were never going to work anyway',
        ],
        correctIndex: 1,
        explanation: 'Systems collapse most often from being too big, too verbal, or too inconsistent — not from a lack of effort or willingness.',
      },
      {
        kind: 'reflection',
        prompt: 'Which one system from this course do you most want to actually keep going?',
      },
      {
        kind: 'exercise',
        title: 'Pick your top three to keep',
        instructions: 'Write down the three tools from this course you want to stick with, and note where each will physically live in your home.',
        relatedActivity: { label: 'Talk it through with Help Bot', href: '/(tabs)/help-bot' },
      },
    ],
  }),
];
