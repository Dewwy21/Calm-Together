**Using OpenFace 3.0 in the 28-Day ACT Lessons**

**Engineering notes \- draft for implementation**

October 2026

**Main idea:** use OpenFace to notice when the user's facial expression changes during a few selected parts of a lesson. If the change is clear and lasts for a short period, the app can ask the user what they are noticing. The user decides what the feeling means. The lesson then continues as normal.

**Important:** OpenFace output should not be treated as the user's true emotion. For example, a high "anger" score only means the model saw a facial pattern similar to its anger class. We should not show "you are angry" to the user.

# **1\. What we want to build**

The first version can be quite small. We only need the following loop:

Camera \-\> OpenFace \-\> short time window \-\> compare with baseline

       \-\> possible expression change \-\> lesson checks whether a prompt is allowed

       \-\> ask user what they notice \-\> continue the ACT exercise

The camera is only useful at parts of a lesson where the user is already being asked to think about a difficult moment, notice a thought, or reflect on a barrier. We do not need to run active prompting through every page of all 28 lessons.

# **2\. OpenFace outputs we need**

For the first build, keep the OpenFace side simple. The main output we need is the facial-expression probability vector. Other signals can be saved if they are easy to expose, but they do not need to control the interaction yet.

| Output | How we use it |
| :---- | :---- |
| Face detected / confidence | Check that the face is visible. If the face is missing or confidence is low, do nothing. |
| 8 expression scores | Main signal for the first prototype: neutral, happy, sad, surprise, fear, disgust, anger, contempt. |
| Action Units | Optional logging. Useful later if we want to study specific facial movements. |
| Gaze | Optional. Do not use gaze as an emotion label. |
| Landmarks | Optional quality/debug information. |

Do not reduce each frame to one label such as "anger". Keep the full probability vector so we can smooth it over time and compare it with the user's own baseline.

# **3\. Basic runtime logic**

Single frames will be noisy, so the app should work with short windows rather than react immediately.

1\.  At the start of a selected checkpoint, collect a short baseline while the user is relatively settled.

2\.  During the activity, collect OpenFace outputs for a rolling window.

3\.  Ignore frames where no good face is detected.

4\.  Smooth the expression probabilities across the window.

5\.  Compare the current window with the baseline window.

6\.  If the change is large enough and lasts long enough, create a trigger candidate.

7\.  The lesson decides whether that trigger candidate should become a prompt. Use a cooldown so the user is not interrupted repeatedly.

## **Initial settings for the prototype**

| Setting | Starting value | Comment |
| :---- | :---- | :---- |
| Camera sampling | 2-5 fps | No need to process every video frame. |
| Baseline | 5-10 seconds | Use valid-face frames only. |
| Active rolling window | 5-8 seconds | Short enough to react, long enough to smooth noise. |
| Valid-face coverage | at least \~60% | Below this, mark the window unreliable and do not trigger. |
| Persistence | 2-3 seconds | A brief spike or blink should not create a prompt. |
| Prompt cooldown | one prompt per checkpoint at first | Simple and safe for the MVP. |

These numbers are only starting values. They should be tuned after internal testing. It is better to begin with a conservative trigger and miss some changes than to interrupt the user too often.

# **4\. How this fits into the lessons**

The lesson remains in control. OpenFace only gives the lesson a signal that "something may have changed." The same signal can be handled differently depending on the lesson.

## **4.1 Acceptance**

This is the best lesson to implement first because the current script already asks the parent to recall a difficult parenting moment and notice frustration, worry, dread, or body tension.

1\.  Before the recall section, collect a short baseline.

2\.  When the lesson asks the user to picture the difficult moment, start an active window.

3\.  If a sustained expression change is detected, show one simple check-in: "What are you noticing right now?"

4\.  The user can choose something such as frustration, worry, sadness, tension, something else, or nothing noticeable.

5\.  Continue the existing breathing/acceptance exercise.

6\.  After the exercise, collect another short window and keep the normal reflection question.

We should not define success as "the negative expression went away." ACT does not require the feeling to disappear. The post window is useful as research data, not as a pass/fail score.

## **4.2 Cognitive Defusion \- Thought Bubbles**

Here the useful part is comparing the user's response across different versions of the same thought.

1\.  Collect a short baseline before the thought is shown.

2\.  Window A: original thought, for example "I am failing my child."

3\.  Window B: after changing it to "I am noticing the thought that I am failing my child."

4\.  Window C: while the thought bubble is drifting on screen.

5\.  Store the three windows for comparison. Only show a prompt if the change is strong and the interruption does not break the exercise.

For this lesson, logging the three windows may be more useful than actively prompting the user every time.

## **4.3 Committed Action \- Growing What Matters**

The most useful point is the "Notice the weather" page, where the parent thinks about barriers such as tiredness, frustration, worry, or a discouraging thought.

1\.  Keep sensing passive during the earlier value/seed choice.

2\.  Start the main active window when the user begins thinking about the barrier.

3\.  If a clear change appears, ask: "As you think about this barrier, what are you noticing?"

4\.  The user identifies the barrier. The existing lesson then helps them make the planned action smaller or easier.

## **4.4 Values lessons**

For the first version, do not use facial expression to choose or rank values. A smile should not make "Connection" or "Patience" more important. Values are selected by the user. We can log expression features for research if needed, but they should not change the values UI.

# **5\. Prompt wording**

Keep the wording neutral. The system should invite the user to check in, not tell them what they feel.

| Do not show | Better wording |
| :---- | :---- |
| You are angry. | What are you noticing right now? |
| We detected that you are anxious. | Would you like to pause for a moment and check in with yourself? |
| Your emotion improved. | What do you notice now compared with a moment ago? |
| The camera says you are stressed. | The system noticed a change in your facial expression. You are the best judge of what it means. |

The prompt should always be dismissible. If the user selects "nothing noticeable," accept that and continue. Do not repeat the model label or challenge the user.

# **6\. Suggested implementation setup**

For the first prototype, it is probably easiest to run OpenFace as a local Python service and keep the lesson UI separate. This avoids putting the full OpenFace/PyTorch stack inside the web front-end.

| Part | Simple first implementation |
| :---- | :---- |
| Lesson UI | Existing app. Add checkpoint start/stop calls and a small reflection modal. |
| Camera | Browser camera or native camera wrapper. Sample frames at a low rate. |
| OpenFace | Local Python process on the same machine. |
| Communication | WebSocket for streaming state updates; REST is also fine for a basic prototype. |
| Temporary state | In-memory buffers for baseline/current window. |
| Research log | Save summary values and interaction events. Do not save raw video by default. |

## **Simple message flow**

UI \-\> sensing service

checkpoint\_start(session\_id, lesson\_id, checkpoint\_id, mode="baseline")

checkpoint\_mode("active")

checkpoint\_stop()

sensing service \-\> UI

state\_update(face\_valid, probs, state\_distance, trigger\_candidate)

The sensing service should only report numeric state. The front-end/lesson logic decides whether a prompt is allowed. This makes it easier to change lesson behavior without touching the computer-vision code.

# **7\. Data to save**

Keep OpenFace output and the user's own answer in different fields. We will probably want to compare them later.

participant\_id

session\_id

lesson\_id

checkpoint\_id

start\_time / end\_time

face\_valid\_ratio

baseline\_expression\_probs\[8\]

active\_expression\_probs\[8\]

post\_expression\_probs\[8\]        \# if used

state\_distance

trigger\_candidate

prompt\_shown

prompt\_dismissed

user\_reported\_state

user\_reported\_intensity         \# optional

lesson\_action\_taken

lesson\_completed

If Action Units or gaze are easy to expose, save window summaries for research. They do not need to be part of the first trigger rule.

# **8\. Privacy and fallback**

* Ask for camera permission and explain that the camera is used during selected lesson activities.  
* Run inference locally for the prototype if possible.  
* Do not save raw video or still images in the normal MVP flow.  
* Discard frames after OpenFace has produced the features we need.  
* Show a visible camera/sensing indicator and allow the user to pause it.  
* If the camera is denied, unavailable, or OpenFace crashes, the ACT lesson must still work normally.  
* Do not block access to any lesson because facial sensing failed.

# **9\. What the engineer should build first**

1\.  Get webcam \-\> OpenFace \-\> 8 expression probabilities working locally.

2\.  Add smoothing and a 5-10 second baseline buffer.

3\.  Add a 5-8 second active rolling window and a simple distance/change score.

4\.  Create trigger\_candidate only after the change persists for a few seconds.

5\.  Expose state\_update through WebSocket or REST.

6\.  Integrate the Acceptance lesson only.

7\.  Add one generic reflection prompt and user self-report.

8\.  Save baseline, active, prompt, and user-response events.

9\.  Test that the lesson works the same way when sensing is turned off.

10\.  After Acceptance is stable, add Thought Bubbles and Growing What Matters.

# **10\. Internal testing**

Before using this with participants, run simple internal tests. We mainly want to know whether the system is stable and whether it interrupts too often.

* Different lighting conditions.  
* User moves closer/farther from the camera.  
* Glasses, facial hair, looking away, hand covering part of the face.  
* Natural talking and head movement.  
* Short expression changes versus sustained changes.  
* Camera permission denied or revoked during the lesson.  
* OpenFace process stopped unexpectedly.

Useful engineering numbers to record: face-valid percentage, processing latency/FPS, trigger candidates per lesson, visible prompts per lesson, prompt dismissal rate, and lesson completion rate.

# **11\. Very simple trigger pseudocode**

start\_checkpoint():

    collect baseline for 5-10 s

for each sampled frame:

    result \= openface(frame)

    if face is not valid:

        continue

    probs \= softmax(result.expression\_logits)

    add probs to rolling window

    smooth window

    distance \= compare(current\_window, baseline)

    if distance is above threshold for 2-3 s:

        trigger\_candidate \= true

lesson\_ui:

    if trigger\_candidate and prompt\_not\_used\_in\_this\_checkpoint:

        show neutral check-in prompt

        start cooldown

The first version does not need a learned trigger model. A transparent rule is easier to debug. We can decide later whether AU/gaze or a learned model actually improves it.

# **12\. Questions we can decide later**

* Which of the remaining 28 lesson checkpoints should use active prompts and which should only log data?  
* Should the user report a category (frustration/worry/etc.), an intensity score, or both?  
* Should sensing run for the full lesson or only during clearly marked windows?  
* Do Action Units add useful information beyond the 8 expression probabilities?  
* What derived features should be kept after the study and for how long?

# **References**

1\. Hu, J., Mathur, L., Liang, P. P., & Morency, L.-P. OpenFace 3.0: A Lightweight Multitask System for Comprehensive Facial Behavior Analysis. arXiv:2506.02891.

2\. CMU MultiComp Lab. OpenFace 3.0 public repository.

3\. Project lesson scripts in the shared ACT 28 lessons folder: Acceptance, Thought Bubbles, Parenting Values Card Sort, Bull's Eye Values Exercise, and Growing What Matters.