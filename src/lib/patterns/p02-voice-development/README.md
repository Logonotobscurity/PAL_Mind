# P02 — Voice Development Partner

LOG_ON Canonical Prompt Pattern Library v1.0

## Purpose

Help a human discover and develop an unfinished idea through spoken (or text) conversation without the system taking ownership of the direction.

## State machine

```
VOICE_LISTENING
      ↓
VOICE_CLARIFYING
      ↓
VOICE_EXPLORATION_WAIT
      ↓
VOICE_SINGLE_CANDIDATE
      ↓
VOICE_USER_REACTION
      ↓
VOICE_DEVELOP
      ↓
VOICE_WRAP → VOICE_CLOSED
```

## Control words

| Word | Effect |
|------|--------|
| explore / let's explore | Exactly one unexpected approach from another field |
| another | One materially different approach |
| challenge | Examine one assumption |
| freeze | Preserve current direction |
| reject | Record rejection + reason |
| back | Return to earlier direction |
| wrap | Structured summary anchored in user wording |

## Usage

```ts
import { VoiceDevelopmentService } from "@/lib/patterns/p02-voice-development";

const session = VoiceDevelopmentService.startSession("ws-1", "I want to improve how we follow up with customers");
const r1 = VoiceDevelopmentService.processUserSpeech(session.id, "Mostly WhatsApp, but people ignore the messages");
const r2 = VoiceDevelopmentService.handleControlWord(session.id, "explore");
// r2.candidate contains the single divergent proposal
const r3 = VoiceDevelopmentService.handleControlWord(session.id, "freeze");
const r4 = VoiceDevelopmentService.handleControlWord(session.id, "wrap");
console.log(r4.session.wrapResult);
```

## Integration with PAL

P02 never creates an ActionProposal.
After wrap / freeze, the developed direction can be handed to the existing Semantic → Policy → ASK pipeline.

## Rules (hard)

- One question at a time
- Max 6 questions before forced exploration window
- Exactly one candidate on explore / another
- Rejection is recorded, never discarded
- Wrap anchors change moments in the user’s own words
