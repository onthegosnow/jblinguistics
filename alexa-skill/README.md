# JB Linguistics Alexa Skill

Habit-forming Alexa skill for JB Linguistics. It now includes:
- Launch: welcome prompt with suggestions
- `HelloIntent`: intro about services
- Habit loops: `DailyPhraseIntent`/`MorningRoutineIntent`, `QuickDrillIntent`, `DrillAnswerIntent`, `ReviewIntent`, `SetTrackIntent` (choose German/Business English/Spanish)
- `ConsultationIntent`: captures details (if provided), posts to your inquiry endpoint, and shares a link
- `TranslationIntent`: quick translation helper with fallback to human follow-up
- Built-in intents: Help, Cancel/Stop, Fallback, SessionEnded
- Intent reflector for debugging other intents

## Local setup

```bash
cd alexa-skill
npm install
npm run build
```

`npm run build` compiles TypeScript to `dist/`. `npm run package` zips the `dist/` folder into `skill.zip` for Lambda upload.

## Deploying to Alexa / Lambda

1) In the Alexa Developer Console, create a new custom skill and choose "Alexa-Hosted (Node.js)" or bring your own Lambda.
2) If using your own Lambda:
   - Create a Lambda function (Node 18 or 22) and set its handler to `index.handler`.
   - Upload `skill.zip` from `npm run package` (includes compiled code).
   - Add an Alexa Skills Kit trigger to the Lambda.
3) In the skill's **Endpoint** settings, set the default endpoint to your Lambda ARN.

## Interaction model (sample)
Add intents like these in the Build tab or via `models/en-US.json` if using ASK CLI:

```jsonc
{
  "interactionModel": {
    "languageModel": {
      "invocationName": "j b linguistics",
      "intents": [
        { "name": "HelloIntent", "samples": ["hello", "hi there"] },
        { "name": "SetTrackIntent", "samples": ["set my language to {trackLanguage}", "I want {trackLanguage}", "switch to {trackLanguage}"], "slots": [
          { "name": "trackLanguage", "type": "AMAZON.Language" }
        ] },
        { "name": "DailyPhraseIntent", "samples": ["give me today's phrase", "what's my morning phrase", "phrase of the day", "morning routine in {trackLanguage}"], "slots": [
          { "name": "trackLanguage", "type": "AMAZON.Language" }
        ] },
        { "name": "QuickDrillIntent", "samples": ["start a quick drill", "give me a short quiz", "30 second drill", "start a drill in {trackLanguage}"], "slots": [
          { "name": "trackLanguage", "type": "AMAZON.Language" }
        ] },
        { "name": "DrillAnswerIntent", "samples": ["my answer is {drillAnswer}", "the answer is {drillAnswer}", "{drillAnswer}"], "slots": [
          { "name": "drillAnswer", "type": "AMAZON.SearchQuery" }
        ] },
        { "name": "ReviewIntent", "samples": ["review my last phrase", "repeat yesterday's phrase", "what did we cover"] },
        { "name": "ConsultationIntent", "samples": ["book a consultation", "I need translation", "talk to a linguist"], "slots": [
          { "name": "name", "type": "AMAZON.Person" },
          { "name": "email", "type": "AMAZON.SearchQuery" },
          { "name": "need", "type": "AMAZON.SearchQuery" },
          { "name": "languages", "type": "AMAZON.Language" }
        ] },
        { "name": "TranslationIntent", "samples": [
          "translate {phrase} to {targetLanguage}",
          "how do I say {phrase} in {targetLanguage}",
          "translate to {targetLanguage}"
        ], "slots": [
          { "name": "phrase", "type": "AMAZON.SearchQuery" },
          { "name": "targetLanguage", "type": "AMAZON.Language" },
          { "name": "sourceLanguage", "type": "AMAZON.Language" }
        ] },
        { "name": "AMAZON.HelpIntent" },
        { "name": "AMAZON.CancelIntent" },
        { "name": "AMAZON.StopIntent" },
        { "name": "AMAZON.FallbackIntent" }
      ]
    }
  }
}
```

## Notes
- Update responses in `src/index.ts` to fit your scripting.
- Add slots/entities if you need to branch by service type or language.
- Set `INQUIRY_ENDPOINT` to your HTTPS endpoint (defaults to `https://www.jblinguistics.com/api/inquiries`).
- For machine translation, set `TRANSLATION_API_URL` (and optional `TRANSLATION_API_KEY`). Without it, the skill falls back to connecting the user with a human linguist.
- For CI/ASK CLI, you can wire this folder into an ASK project; the Lambda entry point remains `dist/index.js`.
