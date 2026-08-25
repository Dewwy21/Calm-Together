export interface ListenScript {
  id: string;
  title: string;
  topic: string;
  estimatedMinutes: number;
  script: string;
  discussionQuestions: string[];
}

// Full scripts, written to be read aloud (see the "Read aloud" toggle on the
// episode screen) rather than actual audio recordings for now. Written to
// sound like a short, warm podcast hosted by the otter, not a lesson.
export const LISTEN_SCRIPTS: ListenScript[] = [
  {
    id: 'big-feelings',
    title: 'Why Everyone Gets Big Feelings',
    topic: 'Big Emotions',
    estimatedMinutes: 4,
    script: `Hey, it's the otter, and I'm really glad you two are listening together right now. Get comfortable, wherever you are.

So today I want to talk about something that happens to literally everyone: big emotions. You know the kind. The kind where you feel so mad, or so sad, or so excited, that it feels like your whole body is part of it, not just your brain.

Here's a secret: even grown-ups get big emotions. Even otters get big emotions. One time I lost a really good piece of driftwood I'd been saving, and I got so mad about it that I splashed water everywhere and didn't talk to anybody for like ten minutes. Afterward I felt a little silly, but you know what? It was still okay that I felt that way.

Big emotions aren't a bad sign. They're not proof that something's wrong with you. They're actually proof that you care about something. You only get that mad about losing something you cared about. You only get that excited about something you were really looking forward to. The size of the emotion is kind of like a signal, showing how much something matters to you.

The tricky part isn't having the big emotion. It's what we do with it. When a big feeling shows up fast, our body wants to do something fast too, like yell, or slam a door, or cry really loud, or go quiet and stomp off. None of that makes you a bad kid, or a bad grown-up. It just means the feeling got there before the thinking did.

One thing that can help is having a plan for before the big feeling shows up. Like deciding together: when one of us feels like we're about to explode a little, what's something we could do instead? Maybe it's taking a breath. Maybe it's asking for a hug. Maybe it's saying "I need a minute" and actually getting one.

Here's the thing I want you to remember most: feeling a big emotion and handling it perfectly are two totally different things. You don't have to do it perfectly. Nobody does. Not even the grown-ups in your house, and definitely not this otter.

Thanks for listening. I'll see you next time.`,
    discussionQuestions: [
      "What's a big feeling you've had recently, and what happened right before it showed up?",
      "What's one thing that actually helps when the feeling is really big?",
    ],
  },
  {
    id: 'mistakes-grow',
    title: 'The Upside of Messing Up',
    topic: 'Mistakes & Growth',
    estimatedMinutes: 4,
    script: `Hey, it's the otter again. Come on in, get cozy.

I want to tell you about the first time I tried to crack open a clam. I was sure I knew exactly how to do it. I banged it against a rock, missed completely, and smacked my own paw instead. It hurt, and honestly, it was a little embarrassing, even though nobody was really watching.

But here's what happened next: I tried again. I missed again. I tried a third time, and that time, I got it. Now cracking clams is something I'm actually pretty good at, all because of those first two times I completely messed it up.

That's kind of how mistakes work for everybody, not just otters. Nobody is born knowing how to do things. Every person who's really good at something, whether it's riding a bike, or reading, or making friends, or cooking dinner, got good at it by doing it wrong first. A lot. Sometimes hundreds of times.

Mistakes feel bad in the moment. I'm not going to pretend they don't. Nobody loves getting something wrong, especially in front of other people. But mistakes are actually doing something really important behind the scenes: they're showing your brain exactly what doesn't work, so next time it can try something different.

Here's something worth remembering: the goal was never to never make mistakes. That's not actually possible for anybody. The real goal is to get a little more okay with mistakes happening, and a little quicker at trying again afterward.

And that goes for grown-ups too, by the way. Grown-ups mess up all the time. They just sometimes get better at hiding it, or pretending it doesn't bother them. It still does, at least a little.

So if you tried something today and it didn't go the way you wanted, that's not the end of the story. That's just the part of the story where you're still figuring it out.

I'll be here next time you want to listen.`,
    discussionQuestions: [
      "What's something you got better at, after messing it up first?",
      "Is there something you're scared to try because you might get it wrong?",
    ],
  },
  {
    id: 'real-courage',
    title: 'What Courage Actually Looks Like',
    topic: 'Courage',
    estimatedMinutes: 3,
    script: `Hey, it's your otter friend. Let's talk about something people get wrong a lot: courage.

When most people picture courage, they picture something big and loud. Fighting off a shark. Climbing a huge cliff. Running into a burning building. And sure, that's courage too, I guess. But that's not really the kind most of us need on a normal Tuesday.

Real courage, the kind you probably showed at some point today without even realizing it, looks a lot smaller and a lot quieter. It looks like raising your hand when you're not sure your answer is right. It looks like saying sorry first, even when part of you doesn't want to. It looks like trying a food you've never had before. It looks like telling someone how you actually feel, instead of just saying "I'm fine."

Courage isn't about not being scared. That's actually a common mix-up. If you're not scared at all, it's not really courage, it's just doing a thing. Courage is being scared, or nervous, or unsure, and doing the thing anyway, because it matters to you.

I'll tell you something honestly: I get scared plenty. Big waves. Deep water where I can't see the bottom. Meeting new otters for the first time. But I've learned the fear doesn't have to be the boss of what I do. It can just kind of come along for the ride.

Here's something else about courage: it's not a one-time thing you either have or don't have. It's more like a muscle. Every time you do something a little brave, even something tiny, it gets a little easier to be brave again next time.

So if today you did something even a little bit hard, even if it doesn't look like a big deal from the outside, that counts. That was courage.

Talk soon.`,
    discussionQuestions: [
      "What's something small you did recently that took a little bit of courage, even if nobody else noticed?",
      "Is there something you've been wanting to try, but you've been waiting until you feel less nervous first?",
    ],
  },
  {
    id: 'listen-first',
    title: 'Listen First, Fix Later',
    topic: 'Listening',
    estimatedMinutes: 4,
    script: `Hi, it's the otter, back again.

I want to tell you about something I used to get wrong a lot. Whenever a friend came to me upset about something, I'd immediately start trying to fix it. They'd say "I had a bad day," and I'd jump straight to "well, here's what you should do," before they'd even finished talking.

You know what I found out? Most of the time, that's not actually what they wanted. They didn't want a fix. They wanted someone to just listen for a minute first.

This is a really easy thing to mix up, for otters and people both. When someone we care about is upset, we want to help, and jumping to solutions feels like helping. But sometimes offering a solution too fast can actually feel like being brushed off, like the feelings didn't get enough time to just exist before someone tried to make them go away.

Here's a trick that helps me: before I try to solve anything, I try to understand it first. I ask something like "that sounds really hard, what happened?" and then I actually wait for the whole answer. Not the version I'm guessing at in my head. The real one.

This goes both ways, by the way. It's true for grown-ups listening to kids, and it's true for kids listening to grown-ups too. Everybody, no matter how old, wants to feel heard before they get helped.

That doesn't mean solutions are bad. Sometimes people really do want help figuring out what to do next. But usually that comes after the listening part, not instead of it.

So here's something you could try this week: next time someone in your family is upset, try just listening for a full minute before saying anything back. Not even "here's what you should do." Just "tell me more," and then real, quiet listening.

See you next time.`,
    discussionQuestions: [
      'Can you think of a time someone really listened to you, all the way through? What did that feel like?',
      'Is there a time you jumped to fixing something before really listening first?',
    ],
  },
  {
    id: 'small-moments',
    title: 'The Small Stuff Is the Good Stuff',
    topic: 'Everyday Moments',
    estimatedMinutes: 4,
    script: `Hey, it's the otter. Glad you're here.

I want to tell you about my favorite part of most days, and it's not anything big. Right before the sun goes down, the water gets really still and warm on top, and if I float on my back right at that moment, I can see the whole sky turning orange. It only lasts a few minutes. Nothing "happens." Nobody's watching. It's just nice.

I used to think good days needed something big in them. A big adventure, a big surprise, a big win. But the more I paid attention, the more I noticed that most of my favorite moments were actually small ones. A good laugh over something dumb. The first bite of a snack when you're really hungry. Someone saving you a spot next to them without even asking.

Small moments are easy to miss, because they don't announce themselves. Big moments come with balloons and cake. Small moments just kind of quietly happen, and if you're not paying attention, they slide right by.

Here's something interesting though: when people look back on their whole lives, a lot of the moments they remember most fondly aren't the huge, planned-out ones. They're small ones. An ordinary car ride with a good song on. A random weekday dinner where everyone was just being silly. A quiet minute with someone they love, doing basically nothing.

I think part of growing up, and honestly part of being an otter too, is learning to actually notice those small moments while they're happening, instead of only noticing them later, in memory.

One easy way to practice this: at the end of the day, try naming one small good moment from that day. Not the biggest thing that happened. Just one small nice thing you might have otherwise forgotten about by tomorrow.

Talk again soon.`,
    discussionQuestions: [
      "What's one small moment from today that was actually pretty nice, now that you think about it?",
      'Is there a small moment you remember from a long time ago that you still think about sometimes?',
    ],
  },
  {
    id: 'family-safety',
    title: 'What Makes Home Feel Safe',
    topic: 'Family Safety',
    estimatedMinutes: 4,
    script: `Hey, it's the otter again.

I want to ask you both something, and I want you to really think about it: what does it actually mean for a family to feel safe?

I don't mean safe like locks on the doors, though that's part of it too. I mean the other kind. The feeling where you know that no matter what happens, no matter what you did or how you're feeling, you're still going to be loved when you walk through the door.

I think a family feels safe when people can be honest without getting in trouble just for being honest. If you did something wrong and you tell the truth about it, what happens next matters a lot. Does telling the truth make things better or worse? Families that feel safe are usually families where telling the truth, even about hard things, doesn't blow everything up.

I think a family feels safe when feelings are allowed. All of them. Not just the easy ones like happy and excited, but the harder ones too, like angry, or jealous, or embarrassed, or scared. A safe family doesn't need you to only show the feelings that are convenient.

I think a family feels safe when people say sorry, and mean it, and it actually changes something afterward. Not just the words, but the follow-through.

And I think a family feels safe when there's room for things to go wrong sometimes. Nobody has to be perfect. Nobody has to get everything right every day. Safety isn't about never messing up. It's about knowing you're still okay, even after you do.

None of this happens perfectly, by the way, in any family, anywhere. Every family has hard days, disagreements, moments where somebody says something they wish they hadn't. That doesn't mean the family isn't safe. It just means they're a family of actual people.

I'll see you next time.`,
    discussionQuestions: [
      "What's something that makes you feel safe in our family?",
      'Is there anything that would help you feel even safer, that we could try together?',
    ],
  },
  {
    id: 'different-needs',
    title: "We Don't All Need the Same Thing",
    topic: 'Individual Needs',
    estimatedMinutes: 4,
    script: `Hi, it's the otter, back for another one.

Here's something I noticed a while back: my friends and I are all otters, but we are not all the same. One of my friends loves being around a big group, the noisier the better. Another friend needs quiet time alone every single day or she gets grumpy and tired. One friend needs to talk about a problem out loud to feel better. Another needs total silence and space before she's ready to talk about anything at all.

For a long time I thought everybody needed the same things I needed, because that's just what feels normal to me. So if I was upset and being alone helped me, I figured being alone would help my friends too. Sometimes it did. But sometimes it made things worse, because that friend actually needed the opposite: company, and someone checking in.

Here's the big thing I learned: needing something different from someone else doesn't mean anyone is doing it wrong. It just means people are different. Some people recharge by being around others. Some people recharge by being alone. Some people need to move their body when they're upset. Some people need to sit very still. None of those are the "right" way. They're just different ways.

This matters a lot inside a family, because families are full of different kinds of people living very close together. What helps one person calm down might be exactly the wrong thing for another person in the same house.

The trick isn't figuring out the one right way for everybody. It's learning what each specific person actually needs, even if it's different from what you need.

One way to find out: just ask. "What do you need right now, quiet or company?" It's a simple question, and a lot of the time, people don't even ask it.

Talk soon.`,
    discussionQuestions: [
      "What's something you need when you're upset that might be different from what someone else in our family needs?",
      'Is there a time someone gave you exactly what you needed, without you even having to explain it?',
    ],
  },
  {
    id: 'repair-after-arguments',
    title: 'Making Things Right Again',
    topic: 'Repairing After Conflict',
    estimatedMinutes: 4,
    script: `Hey, it's the otter.

Today I want to talk about something nobody loves talking about: arguments. The kind where voices get loud, or feelings get hurt, or somebody says something they didn't totally mean.

Here's the truth: every family has arguments. Every single one. If you've ever thought some other family out there never argues, never gets frustrated with each other, never says the wrong thing, I promise that's not actually true. It might look that way from the outside, but every family has hard moments.

So if arguments are going to happen no matter what, here's the question that actually matters: what happens afterward?

That's called repair. Repair is what happens after an argument, when people come back together and try to make things right again. Honestly, I think repair might matter even more than not arguing in the first place.

Repair can be small. It can be someone saying "I'm sorry I raised my voice, that wasn't fair to you." It can be a hug that doesn't need any words at all. It can be someone saying "I was more upset about something else, and I took it out on you, and that wasn't okay." It can even just be doing something kind for the other person afterward, without a big speech about it.

What repair isn't: pretending nothing happened. Pretending doesn't actually fix anything, it just buries it, and buried things have a funny way of coming back up later, usually at a worse time.

I think families that do repair well aren't families that never fight. They're families where, after the fight, everyone knows things are going to get talked through and made right, and the relationship isn't in danger just because one hard moment happened.

If you had an argument recently, even a small one, it's not too late to repair it. Repair doesn't have an expiration date.

I'll see you next time.`,
    discussionQuestions: [
      'Is there a repair, big or small, that we could do together this week?',
      "What helps you feel like things are really okay again, after an argument?",
    ],
  },
  {
    id: 'progress-not-perfection',
    title: 'Better, Not Perfect',
    topic: 'Progress Over Perfection',
    estimatedMinutes: 4,
    script: `Hi, it's the otter again.

I want to tell you about learning to swim against a strong current, back when I was very young. The first time, I barely moved forward at all. I mostly just got tired and drifted sideways. It was pretty discouraging, honestly.

But here's what I didn't notice at the time, because I was too busy comparing myself to where I wanted to be: I was getting a tiny bit better every single time. Not perfect. Not even close to perfect. But better. A little more distance. A little less tired afterward. A little more control.

If I had only paid attention to whether I was perfect yet, I would have felt like I was failing for a really long time, because perfect was really far away. When I started paying attention to progress instead, I could see it almost every day. That felt completely different.

I think a lot of us, otters and people both, get stuck comparing ourselves to some perfect version of how things are supposed to go. When we do that, even real progress can feel like it doesn't count, because it's not "there" yet.

Here's a different way to look at it: progress means you're better than you used to be, not that you've arrived somewhere final. Nobody ever really "arrives" and stays perfect forever anyway. Everybody is always somewhere in the middle of getting better at something.

Celebrating progress doesn't mean pretending things are perfect when they're not. It means noticing what's actually improved, even if there's still a long way to go. That's not lying to yourself. That's just being fair to yourself.

Something worth trying: instead of asking "is this perfect yet," try asking "is this better than it used to be?" Most of the time, if you're honest, the answer is yes, even a little.

Talk again soon.`,
    discussionQuestions: [
      "What's something you've gotten better at, even if it's still not perfect?",
      "What's something you're working on right now where you could notice the progress, instead of just what's still hard?",
    ],
  },
  {
    id: 'kindness-to-yourself',
    title: 'Be Your Own Friend',
    topic: 'Self-Kindness',
    estimatedMinutes: 4,
    script: `Hey, it's the otter, one more time.

I want to ask you something: if your best friend made a mistake, or had a rough day, or said something they regretted, what would you say to them?

Probably something kind, right? Something like "it's okay, everybody has bad days," or "that doesn't mean you're a bad friend, that just means today was hard."

Now here's the harder question: is that the same thing you say to yourself, when you make a mistake, or have a rough day?

For a lot of people, otters included, the answer is no. We're a lot kinder to other people than we are to ourselves. When a friend messes up, we give them grace. When we mess up ourselves, we sometimes talk to ourselves in a voice we would never use on anyone we cared about.

I used to be pretty hard on myself. If I messed something up, the voice in my head would say things like "you always mess this up," or "why can't you just get this right." That voice never actually helped me do better. It just made me feel worse, and feeling worse doesn't usually make anybody try harder. Usually it makes people want to give up.

Being kind to yourself doesn't mean pretending mistakes don't matter, or never trying to improve. It just means talking to yourself the way you'd talk to someone you love, even on the hard days. Especially on the hard days, actually.

This matters for grown-ups and kids both. Everybody has that inside voice, and everybody deserves for that voice to be a little kinder than it sometimes is.

One thing you can try: next time you catch yourself being really hard on yourself, pause and ask, "would I say this to someone I love?" If the answer is no, that's a good sign it's worth softening.

Thanks for listening today. I'll be here next time.`,
    discussionQuestions: [
      "What's something kind you could say to yourself today?",
      "Is there a mistake you're still being a little hard on yourself about, that maybe you could let go of a bit?",
    ],
  },
];

export function getListenScriptById(id: string) {
  return LISTEN_SCRIPTS.find((s) => s.id === id);
}
