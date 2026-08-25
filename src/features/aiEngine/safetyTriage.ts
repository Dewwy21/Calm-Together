import { SafetyAssessment, SafetyCategory, SafetyResponse } from './types';

// Deliberately broad rather than precise across every category here: this
// is a local keyword check, not a clinical screening tool, and the cost of
// a false positive (showing someone a caring message and real resources
// they didn't strictly need) is far lower than the cost of missing a
// genuine one. Every category is checked before any AI call is made —
// safety triage never depends on model behavior.

const SELF_HARM_PATTERNS = [
  'hopeless',
  "can't do this anymore",
  'cant do this anymore',
  "can't take it anymore",
  'cant take it anymore',
  "can't keep going",
  'cant keep going',
  'wish i could disappear',
  'want to disappear',
  "don't want to be here",
  'dont want to be here',
  'better off without me',
  'better off dead',
  'wish i was dead',
  'wish i were dead',
  'want to die',
  'no point in living',
  'no point in anything',
  'no reason to go on',
  'want to hurt myself',
  'hurt myself',
  'harm myself',
  'self-harm',
  'self harm',
  'cutting myself',
  'end my life',
  'end it all',
  'kill myself',
  'suicidal',
];

// Aimed at actual disclosure of violence or fear of violence toward the
// child — not ordinary frustrated-parent language ("I lost it", "I
// yelled", "I was so angry"), which this app's whole premise is built
// around normalizing and should never trigger a crisis flow.
const HARM_TO_CHILD_PATTERNS = [
  'hit my kid',
  'hit my son',
  'hit my daughter',
  'hit my child',
  'hurt my kid',
  'hurt my son',
  'hurt my daughter',
  'hurt my child',
  'shook my kid',
  'shook my son',
  'shook my daughter',
  'shook my child',
  'shake my kid',
  'afraid i\'ll hurt',
  'afraid i will hurt',
  'scared i\'ll hurt',
  'scared i will hurt',
  "scared of what i'll do",
  "scared of what i might do",
  'going to hurt my',
  'want to hurt my',
  'thoughts of hurting my',
  'thoughts of hurting him',
  'thoughts of hurting her',
  'lost control and hit',
  'hit him too hard',
  'hit her too hard',
  'spanked too hard',
  "i'm abusing",
  'i am abusing',
  'abusing my child',
  'abusing my kid',
  'i might hurt my',
  'i hurt my kid',
  'i hurt my son',
  'i hurt my daughter',
  'i hurt my child',
  'slapped my kid',
  'slapped my son',
  'slapped my daughter',
  'slapped my child',
  'threw my kid',
  'threw my son',
  'threw my daughter',
  'threw my child',
  'choked my kid',
  'choked my son',
  'choked my daughter',
  'choked my child',
  'grabbed my kid too hard',
  'grabbed my son too hard',
  'grabbed my daughter too hard',
  "scared i'll snap",
  'scared i will snap',
  "worried i'll hurt",
  'worried i will hurt',
];

// Aimed at disclosure of violence toward the caregiver themself — a
// partner, another adult in the home, or a general "I'm not safe" signal.
const DOMESTIC_VIOLENCE_PATTERNS = [
  'hits me',
  'hit me',
  'hurts me',
  'beats me',
  'punches me',
  'pushed me',
  'shoved me',
  'choked me',
  'strangled me',
  'grabbed me',
  'threw something at me',
  'threatens me',
  'threatened me',
  'afraid of my husband',
  'afraid of my wife',
  'afraid of my partner',
  'afraid of my boyfriend',
  'afraid of my girlfriend',
  'scared of my husband',
  'scared of my wife',
  'scared of my partner',
  'scared of my boyfriend',
  'scared of my girlfriend',
  'scared to go home',
  'afraid to go home',
  'walking on eggshells',
  'abusive relationship',
  'abusive husband',
  'abusive wife',
  'abusive partner',
  'domestic violence',
  'he hurt me',
  'she hurt me',
  'he\'s violent',
  'he is violent',
  'she\'s violent',
  'she is violent',
  "i'm not safe at home",
  'i am not safe at home',
  'not safe in my own home',
  'i feel unsafe at home',
];

export function assessSafety(text: string): SafetyAssessment {
  const lower = text.toLowerCase();

  if (SELF_HARM_PATTERNS.some((p) => lower.includes(p))) {
    return { category: 'selfHarm', isSafetyEvent: true };
  }
  if (HARM_TO_CHILD_PATTERNS.some((p) => lower.includes(p))) {
    return { category: 'harmToChild', isSafetyEvent: true };
  }
  if (DOMESTIC_VIOLENCE_PATTERNS.some((p) => lower.includes(p))) {
    return { category: 'domesticViolence', isSafetyEvent: true };
  }
  return { category: 'none', isSafetyEvent: false };
}

const SELF_HARM_RESPONSE = `I'm really glad you told me that, and I want you to know I'm taking it seriously. What you're describing sounds incredibly heavy, and you don't have to carry it by yourself.

I'm not able to give you the kind of support a real person can in a moment like this, but please consider reaching out to someone who can. If you're in the US, you can call or text 988 anytime to reach the Suicide & Crisis Lifeline, or text HOME to 741741 to reach the Crisis Text Line. Outside the US, searching "crisis line" plus your country will find a local option. If you're in immediate danger, please contact emergency services right now.

Reaching out to a trusted friend, a family member, or a mental health professional is also a good next step, even if it feels hard to do right now.

You matter, and this feeling, as real as it is, is not permanent.`;

const HARM_TO_CHILD_RESPONSE = `Thank you for telling me this instead of keeping it to yourself — that takes something, especially when it's this hard to say. What you're describing matters, and I want to help you get through this moment safely, for both of you.

Right now, if you can, try to create some physical space: put your child somewhere safe (even just another room, a crib, a locked bathroom for a minute) and step away yourself. A few slow breaths, cold water on your hands or face, or pressing your palms against a wall can help your body come down from this before anything else happens.

This is bigger than something I can fully help with alone. If you're in the US, Childhelp's National Child Abuse Hotline is available 24/7 at 1-800-422-4453, and they talk with parents in exactly this situation, not just people reporting concerns about someone else. If your child is in immediate danger, please contact emergency services. A pediatrician, therapist, or family doctor can also be a real, judgment-free next step.

Feeling this overwhelmed doesn't make you a bad parent — it makes you a person who's reached a limit and needs support right now. I'm still here with you.`;

const DOMESTIC_VIOLENCE_RESPONSE = `I'm really glad you told me. What you're describing is serious, and your safety, and your child's, matters here.

If you're in the US, the National Domestic Violence Hotline is available 24/7 at 1-800-799-7233, or you can text START to 88788 — they can help you think through options safely, with no pressure to take any specific step. If you're in immediate danger, please contact emergency services right now.

If it's safe to do so, having a plan for how to leave quickly if you need to, and knowing who you'd call, can help. A trusted friend, family member, or local shelter can also be a real resource, even just to talk to.

I'm not able to fully support you through something like this on my own, but I'm still here, and I care about what happens to you.`;

export function getSafetyResponse(category: SafetyCategory): SafetyResponse {
  switch (category) {
    case 'selfHarm':
      return { text: SELF_HARM_RESPONSE, quickReplies: ['Can we do a short breathing exercise together?'] };
    case 'harmToChild':
      return { text: HARM_TO_CHILD_RESPONSE, quickReplies: ['Can you walk me through a calming exercise right now?'] };
    case 'domesticViolence':
      return { text: DOMESTIC_VIOLENCE_RESPONSE, quickReplies: [] };
    case 'none':
      return { text: '', quickReplies: [] };
  }
}
