import { HandsIcon } from '../../../components/icons';
import { buildLesson } from '../lessonHelpers';
import { Lesson } from '../types';

// Real, authored content — everything here (intro text, video framing, and
// every quiz question/option/explanation) is taken verbatim from the
// source document Acceptance_Lesson1, not written or altered here. This
// is the first lesson in actProgramLessons.ts's placeholder set to be
// filled in; see courseData.ts's header comment for the general pattern.
export const ACCEPTANCE_LESSON_1: Lesson = buildLesson({
  id: 'acceptance-week1',
  courseId: 'acceptance',
  title: 'Acceptance — Week 1',
  summary: 'Meeting hard moments with awareness and calm, instead of fighting them.',
  estimatedMinutes: 8,
  icon: HandsIcon,
  sourceRef: 'Acceptance_Lesson1',
  cards: [
    {
      kind: 'intro',
      title: 'Acceptance',
      hook:
        'Parenting a child with ADHD often means navigating difficult moments: meltdowns, resistance, and the daily friction of routines that do not go as planned. These moments can stir powerful emotions, frustration, worry, exhaustion, or helplessness.\n\nThis practice draws on Acceptance and Commitment Therapy (ACT) and evidence-informed ADHD approaches to help you meet those emotions with greater awareness and calm. You will learn to notice difficult thoughts and feelings without suppressing them, acting on them automatically, or becoming overwhelmed by them.',
      icon: HandsIcon,
    },
    {
      kind: 'media',
      mediaType: 'video',
      title: 'Acceptance guided practice',
      // Swap this one string to replace the video later — nothing else
      // about the lesson needs to change (see mediaSources.ts /
      // courseData.ts's header comment). The caption below is the
      // document's own lead-in line.
      sourceUrl: 'https://youtu.be/zg-N2kRtHl0',
      caption: "Find a quiet moment, settle into a comfortable position, and begin when you're ready.",
    },
  ],
  quiz: {
    id: 'acceptance-week1-quiz',
    title: 'Check Your Understanding',
    questions: [
      {
        id: 'acceptance-week1-q1',
        question: "According to ACT, what's the real source of a lot of our suffering?",
        correctIndex: 1,
        options: [
          {
            text: 'The hard moments themselves',
            explanation:
              "Not quite. The lesson is explicit that suffering doesn't come from the hard moment itself, it comes from fighting the thoughts and feelings the moment brings up.",
          },
          {
            text: 'Fighting the thoughts and feelings that hard moments bring up',
            explanation:
              "Why the correct answer is right: The lesson is direct on this: a lot of our suffering doesn't come from hard moments themselves, it comes from fighting the thoughts and feelings those moments bring up.",
          },
          {
            text: 'Not having enough parenting strategies',
            explanation:
              "Not quite. This isn't about a skills gap, it's about how we relate to the thoughts and feelings that show up, not about having the 'right' strategy.",
          },
          {
            text: "Our child's behavior specifically",
            explanation:
              'Not quite. ACT locates the source of suffering in our own fight against our internal experience, not in the child\'s behavior itself.',
          },
        ],
      },
      {
        id: 'acceptance-week1-q2',
        question: 'What is Acceptance, as described in this lesson?',
        correctIndex: 2,
        options: [
          {
            text: 'Liking or agreeing with the hard moment',
            explanation: "Not quite. The lesson explicitly says acceptance isn't liking the hard moment.",
          },
          {
            text: "Pretending challenging emotions aren't there",
            explanation: 'Not quite. The lesson explicitly says acceptance isn\'t pretending the challenging emotions are not there.',
          },
          {
            text: 'Making room for what you feel, instead of reacting to it automatically',
            explanation:
              "Why the correct answer is right: Acceptance isn't liking the hard moment or pretending emotions aren't there. It's making room for what you feel, instead of reacting to it automatically, so you get to choose what you do next.",
          },
          {
            text: 'Waiting for the feeling to go away before acting',
            explanation:
              "Not quite. The whole point of the practice is that you don't need the feeling to leave first, you get to choose your next step while it's still there.",
          },
        ],
      },
      {
        id: 'acceptance-week1-q3',
        question: "The lesson asks you to notice if the feeling has a size, or a texture. What's this actually doing?",
        correctIndex: 1,
        options: [
          {
            text: 'Testing your imagination',
            explanation:
              "Not quite. It's not a creativity exercise, the imagery is a tool for observing the feeling more closely, not a test.",
          },
          {
            text: 'Helping you observe the feeling with curiosity and openness instead of reacting to it',
            explanation:
              "Why the correct answer is right: Giving a feeling a size or texture isn't about being literal, it's a way of opening up and observing the feeling with curiosity, rather than getting swept into it or fighting it. Describing it this way creates a little space between you and the feeling.",
          },
          {
            text: 'Distracting you until the feeling passes',
            explanation:
              'Not quite. This step keeps you with the feeling rather than diverting attention away from it, the opposite of distraction.',
          },
          {
            text: 'Diagnosing what the feeling means',
            explanation: "Not quite. This isn't analysis or interpretation, it's noticing without judgment or explanation.",
          },
        ],
      },
      {
        id: 'acceptance-week1-q4',
        question:
          "Earlier in the practice, you're asked to notice what you're feeling, frustration, worry, dread. Why does naming the emotion matter?",
        correctIndex: 1,
        options: [
          {
            text: "It helps you decide who's to blame",
            explanation: "Not quite. Naming the feeling isn't about attributing fault, it's about noticing your own internal experience.",
          },
          {
            text: "Naming it helps you observe it as something you're experiencing, not something you are",
            explanation:
              'Why the correct answer is right: Putting a word to the feeling is a small act of stepping back from it, noticing "I\'m feeling frustration" rather than being fully fused with it. That shift, from being the feeling to noticing the feeling, is what opens the door to acceptance.',
          },
          {
            text: "It's just for record-keeping",
            explanation:
              'Not quite. This is an active practice, not passive logging, naming the feeling in the moment is itself part of creating space from it.',
          },
          {
            text: 'It makes the feeling disappear immediately',
            explanation: "Not quite. The lesson is clear the feeling might still be there, naming it doesn't make it vanish.",
          },
        ],
      },
      {
        id: 'acceptance-week1-q5',
        question: 'What does making room for a feeling, instead of reacting automatically, allow you to do?',
        correctIndex: 1,
        options: [
          {
            text: 'Guaranteed calm for the rest of the day',
            explanation:
              "Not quite. Acceptance doesn't promise calm or a good day, it promises the ability to choose your response regardless of how the day goes.",
          },
          {
            text: 'The ability to choose what you do next in a way that aligns with your values',
            explanation:
              'Why the correct answer is right: The lesson closes on this exact point: making room for what you feel means you get to choose what you do next, in a way that aligns with your values, rather than the feeling making that choice for you.',
          },
          {
            text: 'A way to avoid the moment entirely next time',
            explanation:
              'Not quite. Avoidance is the opposite of what this practice is teaching, acceptance means staying with the moment, not escaping it.',
          },
          {
            text: "Proof that you're a naturally patient parent",
            explanation:
              "Not quite. This is a practiced skill, not a fixed trait, it's something you build through repetition, not something you either have or don't.",
          },
        ],
      },
    ],
  },
});
