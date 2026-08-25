import { WaveIcon, ThoughtIcon, EyeOffIcon, FlameIcon, SwirlIcon, HandsIcon, LeafIcon, HeartIcon, PeopleIcon, StarIcon, ChartIcon } from '../../../components/icons';
import { buildLesson } from '../lessonHelpers';
import { Lesson } from '../types';

export const TANTRUM_LESSONS: Lesson[] = [
  buildLesson({
    id: 'tantrum-vs-meltdown',
    courseId: 'tantrums',
    title: 'Tantrum or Meltdown?',
    summary: 'Learn to tell the two apart so you can respond the right way, fast.',
    estimatedMinutes: 4,
    icon: WaveIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Tantrum or Meltdown?',
        hook: "They can look identical from the outside, but knowing which one you're facing changes everything about how to respond.",
        icon: WaveIcon,
      },
      {
        kind: 'concept',
        heading: 'Two very different things',
        body: 'A tantrum is goal-directed: your child wants something and is testing whether protest will get it. A meltdown is a nervous-system overload — the brain\'s alarm system has taken over, and your child genuinely cannot think their way out of it right now.',
        icon: ThoughtIcon,
      },
      {
        kind: 'concept',
        heading: 'The tell: does an audience change it?',
        body: "Tantrums often ease up, even slightly, once the audience leaves or the demand gets dropped. Meltdowns don't, because they were never about getting something in the first place.",
        icon: EyeOffIcon,
      },
      {
        kind: 'comparison',
        heading: 'Spot the difference',
        leftLabel: 'Tantrum',
        leftItems: ['Usually has a clear goal', 'Checks your reaction', 'Can pause if you give in', 'Often lighter, more controlled'],
        rightLabel: 'Meltdown',
        rightItems: ['No clear goal, just overwhelm', "Doesn't track your reaction", "Doesn't stop when demand drops", 'Full-body, harder to interrupt'],
      },
      {
        kind: 'quiz',
        question:
          "Your child is mid-outburst. You quietly leave the room, and within a minute they've completely stopped and are asking for a snack. What was this most likely?",
        options: ['A tantrum', 'A meltdown', 'Both at once', "Impossible to tell"],
        correctIndex: 0,
        explanation:
          "Stopping quickly once the \"audience\" leaves, and pivoting easily to something new, points to a goal-directed tantrum rather than a true overload meltdown.",
      },
      {
        kind: 'reflection',
        prompt: "Think of your child's last big outburst. Looking back, does it feel more like a tantrum or a meltdown — and what tips you off?",
      },
      {
        kind: 'exercise',
        title: 'Track it for a day',
        instructions:
          "Next time it happens, jot one word — \"tantrum\" or \"meltdown\" — in your Daily Log along with what came right before. Patterns usually show up within a few entries.",
        relatedActivity: { label: 'Log it in Daily Log', href: '/(modals)/log-event' },
      },
    ],
  }),

  buildLesson({
    id: 'tantrum-buildup',
    courseId: 'tantrums',
    title: 'Catch It Before It Blows',
    summary: 'Every meltdown has a runway. Learn to spot yours.',
    estimatedMinutes: 5,
    icon: SwirlIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Catch It Before It Blows',
        hook: 'Every meltdown has a runway before takeoff — usually just 30 to 90 seconds. Learn your child\'s specific signs and you get a window to act while things are still small.',
        icon: SwirlIcon,
      },
      {
        kind: 'concept',
        heading: 'The build-up has a shape',
        body: 'Restlessness, a change in voice, clenched hands, going quiet, repeating a word or complaint — these early signs are unique to your child, and once you know them, they become impossible to unsee.',
        icon: SwirlIcon,
      },
      {
        kind: 'timeline',
        heading: 'The typical arc',
        steps: [
          'Trigger happens (told no, plan changes, told to stop)',
          'Body reacts first — fidgeting, faster breathing, tight jaw',
          'Words get louder, or disappear completely',
          'Full escalation — yelling, crying, shutting down',
          'The only way out is through, then recovery',
        ],
      },
      {
        kind: 'example',
        heading: 'What it looks like at home',
        scenario:
          'Every time my son is about to melt down, he starts flapping his hands faster and his voice gets a specific whiny edge. If I catch that moment and get down to his level, half the time we avoid the full blowup.',
        takeaway: 'Your child has signs too — you likely already half-notice them without naming them yet.',
      },
      {
        kind: 'quiz',
        question: "What's the best use of the 30-to-90-second build-up window?",
        options: [
          'Explain calmly why they\'re wrong',
          'Offer a small choice or a break, before words stop working',
          'Ignore it and hope it passes',
          'Warn them of a consequence',
        ],
        correctIndex: 1,
        explanation:
          'Once escalation is underway, reasoning gets harder to access. A small choice or a physical reset — a breath, movement, space — works with the build-up instead of against it.',
      },
      {
        kind: 'reflection',
        prompt: "What's one physical sign — in your child's body or voice — that shows up right before things escalate?",
      },
      {
        kind: 'exercise',
        title: 'Name it out loud today',
        instructions:
          'The next time you notice the early signs, say them out loud, gently: "I can see this is getting hard." You\'re not fixing it yet — just building your own habit of catching it early.',
        relatedActivity: { label: 'Try Box Breathing together', href: '/(modals)/calm-corner/box-breathing' },
      },
    ],
  }),

  buildLesson({
    id: 'tantrum-coregulation',
    courseId: 'tantrums',
    title: 'Your Calm Is Contagious',
    summary: 'Why your own nervous system is the most powerful tool in the room.',
    estimatedMinutes: 4,
    icon: HandsIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Your Calm Is Contagious',
        hook: "Young kids can't self-soothe from a full meltdown alone — they borrow regulation from the calmest nervous system in the room. That's usually supposed to be you.",
        icon: HandsIcon,
      },
      {
        kind: 'concept',
        heading: 'Borrowed calm, not performed calm',
        body: "This isn't about faking a smile through gritted teeth. It's about your body actually settling — slower breath, softer voice, loosened shoulders — so there's real calm in the room for your child's nervous system to sync with.",
        icon: HandsIcon,
      },
      {
        kind: 'concept',
        heading: "You can't lend what you don't have",
        body: "If you're also activated, there's no calm left to borrow. This is exactly why looking after your own regulation isn't a side project — it's the actual tool.",
        icon: ThoughtIcon,
      },
      {
        kind: 'stat',
        heading: 'Kids read tone before words',
        statText: '~90%',
        detail: 'Roughly how much of emotional communication in a tense moment comes through tone, posture, and face — not the actual words said.',
        icon: ThoughtIcon,
      },
      {
        kind: 'sequence',
        heading: 'Put your own reset in order',
        instructions: 'When you feel yourself getting activated too, these tend to work best in this order.',
        items: [
          'Notice your own body — racing heart, tight jaw, faster breathing',
          'Take one slow breath before saying or doing anything',
          'Soften your voice and posture on purpose',
          'Get down to your child\'s physical level',
          'Offer a short, calm phrase, then stay present',
        ],
      },
      {
        kind: 'quiz',
        question: "Your child is mid-meltdown and you feel your own heart racing. What's the most useful first move?",
        options: [
          'Match their volume so they know you mean it',
          'Take one slow breath before saying anything',
          'Immediately explain the rule they broke',
          'Leave the room without a word',
        ],
        correctIndex: 1,
        explanation: 'One breath buys just enough time for your own regulation to catch up, so what comes next is a response, not a reaction.',
      },
      {
        kind: 'reflection',
        prompt: "What's your own early warning sign that you're starting to get activated too?",
      },
      {
        kind: 'exercise',
        title: 'One breath, on purpose',
        instructions:
          'Pick one predictable hard moment today. Before you respond, take a single slow breath first — in through the nose, longer out through the mouth. Notice if it changes what comes out of your mouth next.',
        relatedActivity: { label: 'Practice a Body Scan', href: '/(modals)/calm-corner/body-scan-meditation' },
      },
    ],
  }),

  buildLesson({
    id: 'tantrum-calmspace',
    courseId: 'tantrums',
    title: 'Build a Calm-Down Corner',
    summary: 'A real, physical place to reset — not a timeout.',
    estimatedMinutes: 5,
    icon: LeafIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Build a Calm-Down Corner',
        hook: "A dedicated, cozy space your child can go to (or be gently guided to) turns \"calm down\" from a vague command into a real, physical option.",
        icon: LeafIcon,
      },
      {
        kind: 'concept',
        heading: "It's a reset, not a punishment",
        body: 'Frame it clearly, ahead of time, as a place to feel better — never as a timeout or consequence. The distinction matters enormously for whether your child will actually use it.',
        icon: LeafIcon,
      },
      {
        kind: 'concept',
        heading: 'What makes a good one',
        body: 'Soft, low-stimulation, and stocked with two or three sensory tools your child actually likes — a squishy ball, noise-canceling headphones, a weighted lap pad, a favorite soft blanket. Fewer options beats a pile of choices.',
        icon: HandsIcon,
      },
      {
        kind: 'decisionTree',
        heading: 'Choosing what goes in it',
        branches: [
          { condition: 'Child seeks movement when overwhelmed', action: 'Add something to squeeze, push, or rock on' },
          { condition: 'Child is sound-sensitive', action: 'Add noise-canceling headphones or a white-noise option' },
          { condition: 'Child seeks deep pressure', action: 'Add a weighted blanket or lap pad' },
          { condition: 'Child shuts down and goes quiet', action: 'Keep it dim, soft, and free of demands to talk' },
        ],
      },
      {
        kind: 'quiz',
        question: 'When should you introduce the calm-down corner to your child?',
        options: [
          "Right when they're melting down, so they see the point",
          'During a calm moment, as a place to practice using ahead of time',
          'Only after they ask for it',
          'Never mention it, just guide them there silently',
        ],
        correctIndex: 1,
        explanation:
          "Teaching the tool during calm moments means it's already familiar and non-threatening by the time your child actually needs it.",
      },
      {
        kind: 'reflection',
        prompt: 'What\'s one small corner of your home that could realistically become this space?',
      },
      {
        kind: 'exercise',
        title: 'Set it up together',
        instructions:
          'Spend 10 minutes today picking the spot and two or three items with your child. Let them help choose — ownership makes them far more likely to actually use it.',
      },
    ],
  }),

  buildLesson({
    id: 'tantrum-what-to-say',
    courseId: 'tantrums',
    title: 'Fewer Words Work Better',
    summary: 'What to actually say (and skip) in the heat of the moment.',
    estimatedMinutes: 4,
    icon: ThoughtIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Fewer Words Work Better',
        hook: "In the heat of a meltdown, your child's brain has limited room for language. Less really is more.",
        icon: ThoughtIcon,
      },
      {
        kind: 'concept',
        heading: 'Why long explanations fail here',
        body: "During real escalation, the reasoning part of the brain gets partially sidelined by the alarm system. A paragraph of logic is being delivered to a brain that, right now, can barely process a sentence.",
        icon: ThoughtIcon,
      },
      {
        kind: 'comparison',
        heading: 'Say less, mean more',
        leftLabel: 'Skip this',
        leftItems: ['"Why are you acting like this?"', 'A full explanation of the rule', '"Calm down right now"', 'Multiple instructions at once'],
        rightLabel: 'Try this',
        rightItems: ['"I\'m here."', '"You\'re safe."', '"Take your time."', "Your child's name, said slowly"],
      },
      {
        kind: 'example',
        heading: 'In the moment',
        scenario:
          'Instead of "I\'ve told you five times we\'re leaving, you need to stop this right now," one parent switched to just: "I know. It\'s hard to stop. I\'m right here." Nothing about the situation changed — but the meltdown ran its course faster.',
        takeaway: 'Short, calm, repeated phrases work with an overwhelmed brain instead of against it.',
      },
      {
        kind: 'scenario',
        heading: 'What would you say?',
        situation:
          "Your child is mid-meltdown in the back seat, refusing to buckle their seatbelt, and you're already running late. What do you say?",
        options: [
          {
            text: '"I\'ve asked you three times, we are leaving right now."',
            feedback:
              "Understandable in the moment, but a longer, firmer sentence asks for more processing than an overwhelmed brain can usually give right now — it often extends the meltdown rather than ending it.",
          },
          {
            text: '"I\'m here. Take your time."',
            feedback:
              'Short and calm, with nothing to argue against. This kind of phrase tends to help the meltdown run its course faster, even though it feels like it\'s doing less.',
          },
          {
            text: 'Stay silent and wait it out without saying anything.',
            feedback:
              "Not wrong, but most kids do better with some calm anchor from you — a few quiet words can help without adding pressure.",
          },
        ],
      },
      {
        kind: 'quiz',
        question: 'Which question should wait until AFTER things calm down?',
        options: ['"Are you safe?"', '"What happened?" or "Why did you do that?"', '"Do you need space?"', 'None of these — ask them all immediately'],
        correctIndex: 1,
        explanation:
          "Cause-and-effect questions need reasoning skills that are largely offline mid-meltdown. Save the \"why\" conversation for later, when it can actually be heard.",
      },
      {
        kind: 'reflection',
        prompt: "What's one phrase, short and calm, you could have ready for your child's next hard moment?",
      },
      {
        kind: 'exercise',
        title: 'Pick your go-to phrase',
        instructions:
          'Choose one short phrase — three words or fewer if you can manage it — and say it out loud once right now, while you\'re calm, so it\'s already sitting there ready for the real moment.',
        relatedActivity: { label: 'Practice with Conversation Cards', href: '/(modals)/connect/conversation-cards' },
      },
    ],
  }),

  buildLesson({
    id: 'tantrum-prevention',
    courseId: 'tantrums',
    title: 'Get Ahead of It',
    summary: 'Not every tantrum is preventable — but plenty are.',
    estimatedMinutes: 5,
    icon: ChartIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Get Ahead of It',
        hook: "Not every tantrum is preventable, but a surprising number are, once you know your child's specific triggers.",
        icon: ChartIcon,
      },
      {
        kind: 'concept',
        heading: 'The usual suspects',
        body: "Hunger, tiredness, overstimulation, and abrupt transitions cause a disproportionate share of blowups. None of these are about defiance — they're about a depleted, overloaded system.",
        icon: FlameIcon,
      },
      {
        kind: 'concept',
        heading: 'HALT-plus, an ADHD-friendly version',
        body: 'Before a hard moment, quickly check: Hungry? Angry or anxious already? Lonely or under-connected? Tired? Plus — has there been a lot of screen time or sensory input today? Most meltdowns trace back to one of these.',
        icon: ChartIcon,
      },
      {
        kind: 'timeline',
        heading: 'Building a prevention routine',
        steps: [
          'Notice which trigger shows up most in your Daily Log',
          'Add a buffer right before that trigger — snack, warning, quiet time',
          'Keep the buffer consistent for two weeks',
          'Adjust based on what actually helped',
        ],
      },
      {
        kind: 'quiz',
        question: 'Your child reliably melts down every day around 5pm. What\'s most likely going on?',
        options: [
          'They\'re testing boundaries on purpose',
          'Blood sugar and fatigue building up after a full day',
          'They dislike that time of day specifically',
          "Nothing predictable — it's random",
        ],
        correctIndex: 1,
        explanation:
          'Late-afternoon meltdowns are extremely common and usually trace back to hunger and accumulated fatigue, not intentional defiance.',
      },
      {
        kind: 'reflection',
        prompt: 'Looking at recent hard moments, is there a time of day or situation that comes up again and again?',
      },
      {
        kind: 'exercise',
        title: 'Add one buffer today',
        instructions:
          "Pick your child's most predictable trigger time and add one small buffer before it — a snack, an earlier warning, five quiet minutes. Just one small change, tried consistently.",
        relatedActivity: { label: 'Review recent patterns', href: '/(modals)/past-logs' },
      },
    ],
  }),

  buildLesson({
    id: 'tantrum-in-public',
    courseId: 'tantrums',
    title: 'When It Happens in Public',
    summary: 'The core response barely changes — here\'s the extra layer.',
    estimatedMinutes: 4,
    icon: PeopleIcon,
    cards: [
      {
        kind: 'intro',
        title: 'When It Happens in Public',
        hook: 'Public meltdowns come with an extra layer — an audience — but the core response barely changes. Here\'s how to hold steady when people are watching.',
        icon: PeopleIcon,
      },
      {
        kind: 'concept',
        heading: "The stares aren't the emergency",
        body: "In the moment, your child's regulation matters more than a stranger's opinion. It's genuinely hard to ignore judgment, but the meltdown will end faster if your energy goes toward your child, not toward managing an audience.",
        icon: PeopleIcon,
      },
      {
        kind: 'example',
        heading: 'A real approach',
        scenario:
          'One parent\'s go-to in the grocery store: crouch to eye level, gently block her son from the aisle traffic with her body, and repeat one phrase quietly — "I\'ve got you, we\'ll get through this" — until it passed. No lecture, no audience management, just staying present.',
        takeaway: 'A small physical shift — crouching, creating a bit of shelter — does a lot without needing many words.',
      },
      {
        kind: 'decisionTree',
        heading: 'Quick decisions in public',
        branches: [
          { condition: 'Meltdown starting in a crowded space', action: 'Move to a quieter corner or exit if safely possible, then get down to their level' },
          { condition: 'A stranger comments or stares', action: 'Ignore it, or give a brief, neutral "we\'re okay, thanks" — don\'t engage further' },
          { condition: 'Child needs to leave but resists', action: 'Offer a tiny choice: "walk or carry?" rather than a flat command' },
        ],
      },
      {
        kind: 'quiz',
        question: 'A stranger offers unsolicited advice while your child is mid-meltdown in the store. What\'s the most useful response?',
        options: [
          'A detailed explanation of your parenting approach',
          'A brief, neutral acknowledgment, then back to your child',
          'Matching their tone to defend yourself',
          'Ignoring your child until the stranger leaves',
        ],
        correctIndex: 1,
        explanation:
          "Your bandwidth belongs to your child right now. A short, neutral response closes the interaction without pulling your attention away from what actually matters.",
      },
      {
        kind: 'reflection',
        prompt: "What's the hardest part of a public meltdown for you — your child's distress, or the feeling of being watched?",
      },
      {
        kind: 'exercise',
        title: 'Build a two-line public script',
        instructions:
          'Write down one calming phrase for your child and one neutral line for onlookers, like "We\'re okay, thanks." Having both ready in advance takes the improvising out of an already hard moment.',
      },
    ],
  }),

  buildLesson({
    id: 'tantrum-repair',
    courseId: 'tantrums',
    title: 'The Conversation That Comes After',
    summary: 'What happens once everyone\'s calm matters just as much.',
    estimatedMinutes: 5,
    icon: HeartIcon,
    cards: [
      {
        kind: 'intro',
        title: 'The Conversation That Comes After',
        hook: 'What happens once everyone\'s calm matters just as much as what happens during the storm — sometimes more.',
        icon: HeartIcon,
      },
      {
        kind: 'concept',
        heading: "Repair isn't about blame",
        body: "The goal of the after-conversation isn't punishment or a lecture. It's reconnecting, understanding what happened, and — gently — planning for next time.",
        icon: HeartIcon,
      },
      {
        kind: 'timeline',
        heading: 'A simple repair conversation',
        steps: [
          "Wait until both of you are genuinely calm, even if that's the next day",
          'Name what happened without blame: "Earlier got really big for both of us"',
          'Ask, and really listen: "What was going on for you right before that?"',
          'If it\'s your side too: "I got loud, and I\'m sorry, that wasn\'t fair to you"',
          'Only then, gently: "What could we try next time?"',
        ],
      },
      {
        kind: 'example',
        heading: 'Why the order matters',
        scenario:
          'Jumping straight to "next time you need to..." before your child feels heard tends to trigger defensiveness. Starting with curiosity about their experience first makes them far more likely to actually engage with the planning part.',
        takeaway: 'Understanding before problem-solving — every time.',
      },
      {
        kind: 'quiz',
        question: "You raised your voice during your child's meltdown earlier today. What's the most useful thing to do once things are calm?",
        options: [
          "Avoid bringing it up so it doesn't restart anything",
          'Briefly own it: "I got really loud, I\'m sorry"',
          'Explain in detail why you lost your temper',
          'Wait for your child to apologize first',
        ],
        correctIndex: 1,
        explanation:
          'A short, genuine repair models exactly the skill you\'re hoping to teach: big feelings happen, and they don\'t have to end the story.',
      },
      {
        kind: 'reflection',
        prompt: 'Is there a repair conversation from a recent hard day that\'s still waiting to happen?',
      },
      {
        kind: 'exercise',
        title: 'Have the repair conversation',
        instructions:
          'If there\'s one still owed, have it today, even briefly. Start with a curious question about what was happening for your child, not with the lesson you want them to learn.',
      },
    ],
  }),

  buildLesson({
    id: 'tantrum-sensory',
    courseId: 'tantrums',
    title: 'When It\'s Sensory Overload',
    summary: 'Some meltdowns are the body, not the mood.',
    estimatedMinutes: 4,
    icon: SwirlIcon,
    cards: [
      {
        kind: 'intro',
        title: 'When It\'s Sensory Overload',
        hook: 'Some meltdowns have nothing to do with a rule or a request — they\'re the body hitting its limit on noise, light, texture, or crowding.',
        icon: SwirlIcon,
      },
      {
        kind: 'concept',
        heading: 'Overload builds silently',
        body: 'A loud store, scratchy clothing tag, bright lights, and a crowded hallway can each add a small amount of strain. None looks like much alone — together, they can tip into a meltdown that seems to come from nowhere.',
        icon: SwirlIcon,
      },
      {
        kind: 'comparison',
        heading: 'Behavioral vs. sensory meltdown',
        leftLabel: 'More likely behavioral',
        leftItems: ['Tied to a specific "no"', 'Eases once the demand is dropped', 'Child can be reasoned with once calmer'],
        rightLabel: 'More likely sensory',
        rightItems: ['No clear demand involved', 'Environment is loud, bright, or crowded', 'Covering ears/eyes or seeking pressure helps'],
      },
      {
        kind: 'quiz',
        question: 'Your child melts down in a loud, crowded birthday party with no clear trigger event. What\'s worth checking first?',
        options: [
          'Whether they\'re trying to manipulate the situation',
          'Whether the noise and crowd have become too much',
          'Whether they\'re just being dramatic',
          'Nothing — treat it exactly like any other tantrum',
        ],
        correctIndex: 1,
        explanation: 'When there\'s no clear demand behind it, sensory overload is a common, often-missed cause worth ruling in first.',
      },
      {
        kind: 'reflection',
        prompt: 'What environments tend to overwhelm your child — loud, bright, crowded, or something else entirely?',
      },
      {
        kind: 'exercise',
        title: 'Pack a small sensory kit',
        instructions:
          'Put one or two comfort items — headphones, sunglasses, a fidget — somewhere easy to grab before your next outing to a loud or busy place.',
      },
    ],
  }),

  buildLesson({
    id: 'tantrum-toolkit',
    courseId: 'tantrums',
    title: 'Your Family\'s Calm-Down Toolkit',
    summary: 'Pulling everything from this course into one plan you\'ll actually use.',
    estimatedMinutes: 5,
    icon: StarIcon,
    cards: [
      {
        kind: 'intro',
        title: 'Your Family\'s Calm-Down Toolkit',
        hook: 'You\'ve covered a lot of ground. This last lesson pulls it into one thing you can actually keep and use.',
        icon: StarIcon,
      },
      {
        kind: 'concept',
        heading: 'What you\'ve built so far',
        body: 'Spotting the build-up, lending your own calm, a physical space to reset in, short calming phrases, prevention habits, a plan for public moments, and a repair routine — that\'s a real toolkit, not a single trick.',
        icon: StarIcon,
      },
      {
        kind: 'comparison',
        heading: 'Before vs. after this course',
        leftLabel: 'Before',
        leftItems: ['Reacting in the moment', 'One-size-fits-all response', 'Meltdowns feel random'],
        rightLabel: 'Now',
        rightItems: ['A window to act early', 'Different tools for different moments', 'Patterns you can actually see'],
      },
      {
        kind: 'stat',
        heading: 'Consistency beats intensity',
        statText: '2–3 wks',
        detail: 'Roughly how long it takes a new calm-down routine to start feeling automatic for both you and your child. Expect it to feel shaky before it clicks.',
        icon: FlameIcon,
      },
      {
        kind: 'quiz',
        question: 'What matters most for a calm-down toolkit to actually work long-term?',
        options: ['Having as many tools as possible', 'Using it perfectly every single time', 'Consistency, even on the hard days', 'Only using it during major meltdowns'],
        correctIndex: 2,
        explanation: 'Tools become automatic through repetition. A toolkit used inconsistently stays a suggestion instead of becoming a real habit.',
      },
      {
        kind: 'reflection',
        prompt: 'Which single tool from this course felt most useful for your family, and why?',
      },
      {
        kind: 'exercise',
        title: 'Write your one-page plan',
        instructions:
          'In your Daily Log or a note, jot the three tools from this course you actually want to keep using. Short and specific beats a long list you\'ll forget.',
        relatedActivity: { label: 'Talk it through with Help Bot', href: '/(tabs)/help-bot' },
      },
    ],
  }),
];
