"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const ask_sdk_core_1 = require("ask-sdk-core");
const isIntent = (handlerInput, intentName) => {
    var _a;
    return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
        ((_a = handlerInput.requestEnvelope.request.intent) === null || _a === void 0 ? void 0 : _a.name) === intentName;
};
const getSlotValue = (handlerInput, name) => {
    var _a, _b, _c;
    const request = handlerInput.requestEnvelope.request;
    if (request.type !== "IntentRequest")
        return undefined;
    const slot = (_b = (_a = request.intent) === null || _a === void 0 ? void 0 : _a.slots) === null || _b === void 0 ? void 0 : _b[name];
    return (_c = slot === null || slot === void 0 ? void 0 : slot.value) === null || _c === void 0 ? void 0 : _c.trim();
};
const tracks = {
    german: {
        label: "German",
        morningTip: "Keep it short and polite. Lead with the main ask, end with a softener.",
        phrases: [
            {
                phrase: "Guten Morgen! Wie kann ich Ihnen helfen?",
                translation: "Good morning! How can I help you?",
                context: "Useful for starting a day-of meeting, call, or reply.",
                tip: "Stress the second syllable in 'helfen' for clarity.",
            },
            {
                phrase: "Können wir das bis morgen abschließen?",
                translation: "Can we wrap this up by tomorrow?",
                context: "Set a friendly deadline for a task.",
                tip: "Use a rising tone to keep it collaborative.",
            },
            {
                phrase: "Vielen Dank für die schnelle Rückmeldung.",
                translation: "Thank you for the quick response.",
                context: "Everyday gratitude that sounds native.",
                tip: "Say 'RÜCK-meldung' with stress on the first part.",
            },
            {
                phrase: "Gibt es noch offene Punkte von gestern?",
                translation: "Are there any open items from yesterday?",
                context: "Great for morning standups.",
                tip: "Keep 'offene Punkte' crisp; avoid filler words.",
            },
            {
                phrase: "Lassen Sie uns das kurz festhalten.",
                translation: "Let’s capture that quickly.",
                context: "Use when summarizing action items.",
                tip: "Pair with a quick recap: who, what, by when.",
            },
        ],
        drills: [
            {
                question: "How do you say 'good morning, how can I help you' in German?",
                expected: "guten morgen wie kann ich ihnen helfen",
                hint: "Starts with Guten Morgen…",
            },
            {
                question: "Translate: Thank you for the quick response.",
                expected: "vielen dank für die schnelle rückmeldung",
                hint: "Begins with Vielen Dank…",
            },
            {
                question: "What is a polite way to ask if there are open items from yesterday?",
                expected: "gibt es noch offene punkte von gestern",
                hint: "Starts with Gibt es…",
            },
        ],
    },
    business_english: {
        label: "Business English",
        morningTip: "Open with a friendly check-in, close with a clear next step.",
        phrases: [
            {
                phrase: "Circling back on yesterday’s action items.",
                translation: "Baseline business English, no translation needed.",
                context: "Standups and check-ins.",
            },
            {
                phrase: "Can we lock this by end of day?",
                translation: "Deadline nudge.",
                context: "Agreeing on timing.",
            },
            {
                phrase: "Thanks for the quick turnaround.",
                translation: "Gratitude for speed.",
                context: "Acknowledging responsiveness.",
            },
        ],
        drills: [
            { question: "Give the short phrase to nudge a deadline for today.", expected: "can we lock this by end of day" },
            { question: "Short gratitude for speed?", expected: "thanks for the quick turnaround" },
        ],
    },
    spanish: {
        label: "Spanish",
        morningTip: "Lead with a greeting; keep verbs in the present tense to stay clear.",
        phrases: [
            {
                phrase: "Buenos días, ¿en qué puedo ayudarte?",
                translation: "Good morning, how can I help you?",
                context: "Opening a meeting or call.",
            },
            {
                phrase: "¿Podemos cerrar esto hoy?",
                translation: "Can we close this today?",
                context: "Setting a same-day decision or action.",
            },
            {
                phrase: "Gracias por la respuesta rápida.",
                translation: "Thank you for the quick response.",
                context: "Polite follow-ups.",
            },
        ],
        drills: [
            {
                question: "How do you ask, politely, if you can close something today in Spanish?",
                expected: "podemos cerrar esto hoy",
                hint: "Starts with Podemos…",
            },
        ],
    },
};
const defaultTrack = "german";
const launchSpeak = "Welcome to JB Linguistics. Try: 'give me my morning German phrase', 'start a quick drill', 'translate hello to German', or 'book a consultation'.";
const normalize = (value) => (value ? value.toLowerCase().replace(/[^a-zA-Z\u00C0-\u024F0-9 ]+/g, "").trim() : "");
const resolveTrack = (raw) => {
    const value = normalize(raw);
    if (value.includes("german") || value.includes("deutsch"))
        return "german";
    if (value.includes("business"))
        return "business_english";
    if (value.includes("english"))
        return "business_english";
    if (value.includes("spanish") || value.includes("español"))
        return "spanish";
    return defaultTrack;
};
const getTrack = (trackKey) => { var _a; return (_a = tracks[trackKey !== null && trackKey !== void 0 ? trackKey : defaultTrack]) !== null && _a !== void 0 ? _a : tracks[defaultTrack]; };
const choosePhraseOfDay = (trackKey, today = new Date()) => {
    const track = getTrack(trackKey);
    if (!track.phrases.length)
        return null;
    const seed = Number.parseInt(today.toISOString().slice(0, 10).replace(/-/g, ""), 10);
    const index = seed % track.phrases.length;
    return track.phrases[index];
};
const randomDrill = (trackKey) => {
    const drills = getTrack(trackKey).drills;
    if (!drills.length)
        return null;
    const index = Math.floor(Math.random() * drills.length);
    return drills[index];
};
const getSessionData = (handlerInput) => {
    const attrs = handlerInput.attributesManager.getSessionAttributes();
    return attrs || {};
};
const saveSessionData = (handlerInput, data) => {
    handlerInput.attributesManager.setSessionAttributes(data);
};
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "LaunchRequest";
    },
    handle(handlerInput) {
        const speakOutput = launchSpeak;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("Tell me how I can help with language training or translations.")
            .getResponse();
    },
};
const SetTrackIntentHandler = {
    canHandle(handlerInput) {
        return isIntent(handlerInput, "SetTrackIntent");
    },
    handle(handlerInput) {
        const lang = getSlotValue(handlerInput, "trackLanguage") || getSlotValue(handlerInput, "language");
        const trackKey = resolveTrack(lang);
        const track = getTrack(trackKey);
        const session = getSessionData(handlerInput);
        session.track = trackKey;
        saveSessionData(handlerInput, session);
        const speakOutput = `Got it. I will focus on ${track.label}. Say 'give me today’s phrase' or 'start a quick drill'.`;
        return handlerInput.responseBuilder.speak(speakOutput).reprompt("Want today’s phrase or a drill?").getResponse();
    },
};
const dailyIntentNames = ["DailyPhraseIntent", "MorningRoutineIntent", "PhraseOfTheDayIntent"];
const DailyPhraseIntentHandler = {
    canHandle(handlerInput) {
        var _a, _b;
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            dailyIntentNames.includes((_b = (_a = handlerInput.requestEnvelope.request.intent) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "");
    },
    handle(handlerInput) {
        var _a;
        const session = getSessionData(handlerInput);
        const lang = getSlotValue(handlerInput, "trackLanguage") || getSlotValue(handlerInput, "language");
        const trackKey = (_a = session.track) !== null && _a !== void 0 ? _a : resolveTrack(lang);
        const track = getTrack(trackKey);
        const phrase = choosePhraseOfDay(trackKey);
        if (!phrase) {
            const fallback = "I don’t have a phrase ready right now. Try asking for a quick drill or a translation.";
            return handlerInput.responseBuilder.speak(fallback).getResponse();
        }
        session.track = trackKey;
        session.lastPhrase = phrase;
        session.pendingDrill = undefined;
        saveSessionData(handlerInput, session);
        const tip = phrase.tip ? `Tip: ${phrase.tip}.` : "";
        const speakOutput = `Your ${track.label} phrase of the day: ${phrase.phrase}. It means: ${phrase.translation}. ${phrase.context}. ${tip} Want a 30-second drill or another phrase?`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("Say 'start a quick drill' or 'book a consultation'.")
            .getResponse();
    },
};
const QuickDrillIntentHandler = {
    canHandle(handlerInput) {
        return isIntent(handlerInput, "QuickDrillIntent") || isIntent(handlerInput, "StartDrillIntent");
    },
    handle(handlerInput) {
        var _a;
        const session = getSessionData(handlerInput);
        const lang = getSlotValue(handlerInput, "trackLanguage") || getSlotValue(handlerInput, "language");
        const trackKey = (_a = session.track) !== null && _a !== void 0 ? _a : resolveTrack(lang);
        const track = getTrack(trackKey);
        const drill = randomDrill(trackKey);
        if (!drill) {
            return handlerInput.responseBuilder
                .speak("I don't have a drill ready. Try asking for today’s phrase instead.")
                .getResponse();
        }
        session.track = trackKey;
        session.pendingDrill = drill;
        saveSessionData(handlerInput, session);
        const hint = drill.hint ? `Hint: ${drill.hint}.` : "";
        const speakOutput = `Quick ${track.label} drill: ${drill.question}. ${hint} I'll listen for your answer.`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("What’s your answer?")
            .getResponse();
    },
};
const DrillAnswerIntentHandler = {
    canHandle(handlerInput) {
        return isIntent(handlerInput, "DrillAnswerIntent") || isIntent(handlerInput, "ProvideAnswerIntent");
    },
    handle(handlerInput) {
        const session = getSessionData(handlerInput);
        if (!session.pendingDrill) {
            return handlerInput.responseBuilder
                .speak("Let's start a drill first. Say 'start a quick drill' or 'give me today’s phrase'.")
                .reprompt("Want a drill or today’s phrase?")
                .getResponse();
        }
        const userAnswer = normalize(getSlotValue(handlerInput, "drillAnswer")) ||
            normalize(getSlotValue(handlerInput, "phrase")) ||
            normalize(getSlotValue(handlerInput, "answer"));
        const expected = normalize(session.pendingDrill.expected);
        const isCorrect = !!userAnswer && (userAnswer === expected || expected.includes(userAnswer) || userAnswer.includes(expected));
        session.pendingDrill = undefined;
        saveSessionData(handlerInput, session);
        if (isCorrect) {
            const speakOutput = "Nice work—that’s correct. Want one more drill, or hear another phrase?";
            return handlerInput.responseBuilder.speak(speakOutput).reprompt("Say 'another drill' or 'today’s phrase'.").getResponse();
        }
        const speakOutput = `Good try. The answer I was looking for is: ${expected}. Want another drill or today’s phrase?`;
        return handlerInput.responseBuilder.speak(speakOutput).reprompt("Another drill or today’s phrase?").getResponse();
    },
};
const ReviewIntentHandler = {
    canHandle(handlerInput) {
        return isIntent(handlerInput, "ReviewIntent");
    },
    handle(handlerInput) {
        var _a, _b;
        const session = getSessionData(handlerInput);
        const lang = getSlotValue(handlerInput, "trackLanguage") || getSlotValue(handlerInput, "language");
        const trackKey = (_a = session.track) !== null && _a !== void 0 ? _a : resolveTrack(lang);
        const track = getTrack(trackKey);
        const phrase = (_b = session.lastPhrase) !== null && _b !== void 0 ? _b : choosePhraseOfDay(trackKey);
        if (!phrase) {
            return handlerInput.responseBuilder
                .speak("I don't have anything to review yet. Ask for today’s phrase first.")
                .reprompt("Want today’s phrase?")
                .getResponse();
        }
        const speakOutput = `Here’s your latest ${track.label} phrase: ${phrase.phrase}. It means: ${phrase.translation}. Context: ${phrase.context}. Want to practice with a drill or get a new phrase?`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt("Want a quick drill or another phrase?")
            .getResponse();
    },
};
const HelloIntentHandler = {
    canHandle(handlerInput) {
        return isIntent(handlerInput, "HelloIntent");
    },
    handle(handlerInput) {
        const speakOutput = "Hi there! Try today's phrase, a 30-second drill, or ask for a translation. I can also book you a consultation with a linguist.";
        return handlerInput.responseBuilder.speak(speakOutput).getResponse();
    },
};
const ConsultationIntentHandler = {
    canHandle(handlerInput) {
        return isIntent(handlerInput, "ConsultationIntent");
    },
    async handle(handlerInput) {
        var _a;
        const name = getSlotValue(handlerInput, "name");
        const email = getSlotValue(handlerInput, "email");
        const need = (_a = getSlotValue(handlerInput, "need")) !== null && _a !== void 0 ? _a : "consultation";
        const languages = getSlotValue(handlerInput, "languages");
        const speakOutput = name
            ? `Thanks ${name}. I will share a consultation link now.`
            : "I can connect you with the team. I'll send a consultation link to the Alexa app.";
        await postInquiry({
            name,
            email,
            serviceType: need,
            languages,
            source: "alexa_consultation_intent",
        });
        return handlerInput.responseBuilder
            .speak(`${speakOutput} You can also visit j b linguistics dot com.`)
            .getResponse();
    },
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return isIntent(handlerInput, "AMAZON.HelpIntent");
    },
    handle(handlerInput) {
        const speakOutput = "You can ask for today’s phrase, start a quick drill, translate a phrase, or book a consultation. What do you want to do?";
        return handlerInput.responseBuilder.speak(speakOutput).reprompt(speakOutput).getResponse();
    },
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return (isIntent(handlerInput, "AMAZON.CancelIntent") || isIntent(handlerInput, "AMAZON.StopIntent"));
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.speak("Goodbye!").getResponse();
    },
};
async function translateQuickly(phrase, targetLanguage, sourceLanguage) {
    var _a;
    const endpoint = process.env.TRANSLATION_API_URL;
    if (!endpoint)
        return null;
    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-api-key": (_a = process.env.TRANSLATION_API_KEY) !== null && _a !== void 0 ? _a : "",
            },
            body: JSON.stringify({
                text: phrase,
                targetLanguage: targetLanguage !== null && targetLanguage !== void 0 ? targetLanguage : "en",
                sourceLanguage: sourceLanguage !== null && sourceLanguage !== void 0 ? sourceLanguage : "auto",
            }),
        });
        if (!res.ok) {
            console.error(`Translation API failed: ${res.status}`);
            return null;
        }
        const data = (await res.json().catch(() => null));
        if (data === null || data === void 0 ? void 0 : data.translation)
            return data.translation;
    }
    catch (err) {
        console.error("Translation error", err);
    }
    return null;
}
const TranslationIntentHandler = {
    async canHandle(handlerInput) {
        return isIntent(handlerInput, "TranslationIntent");
    },
    async handle(handlerInput) {
        const phrase = getSlotValue(handlerInput, "phrase");
        const target = getSlotValue(handlerInput, "targetLanguage");
        const source = getSlotValue(handlerInput, "sourceLanguage");
        if (!phrase || !target) {
            const speakOutput = "Tell me what to translate and to which language. For example, translate hello to German.";
            return handlerInput.responseBuilder.speak(speakOutput).reprompt(speakOutput).getResponse();
        }
        const translated = await translateQuickly(phrase, target, source);
        if (translated) {
            const speakOutput = `${phrase} translated to ${target} is: ${translated}. For certified or business use, I can connect you to a human linguist.`;
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        }
        const fallback = `I heard you want to translate ${phrase} to ${target}. For certified or nuanced translations, I'll connect you with our linguists. Would you like me to ask the team to follow up?`;
        return handlerInput.responseBuilder.speak(fallback).reprompt("Want me to alert the team?").getResponse();
    },
};
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return isIntent(handlerInput, "AMAZON.FallbackIntent");
    },
    handle(handlerInput) {
        const speakOutput = "Sorry, I didn't catch that. You can say hello or ask to book a consultation.";
        return handlerInput.responseBuilder.speak(speakOutput).reprompt(speakOutput).getResponse();
    },
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
    },
    handle(handlerInput) {
        var _a;
        if (handlerInput.requestEnvelope.request.type === "SessionEndedRequest") {
            const reason = (_a = handlerInput.requestEnvelope.request.reason) !== null && _a !== void 0 ? _a : "unknown";
            console.log(`Session ended: ${reason}`);
        }
        return handlerInput.responseBuilder.getResponse();
    },
};
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest";
    },
    handle(handlerInput) {
        var _a, _b;
        if (handlerInput.requestEnvelope.request.type !== "IntentRequest") {
            return handlerInput.responseBuilder.getResponse();
        }
        const intentName = (_b = (_a = handlerInput.requestEnvelope.request.intent) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "this";
        const speakOutput = `You just triggered ${intentName}.`;
        return handlerInput.responseBuilder.speak(speakOutput).getResponse();
    },
};
const GlobalErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.error(`Error handled: ${error.message}`);
        const speakOutput = "Sorry, I had trouble doing what you asked. Please try again.";
        return handlerInput.responseBuilder.speak(speakOutput).reprompt(speakOutput).getResponse();
    },
};
async function postInquiry(payload) {
    const endpoint = process.env.INQUIRY_ENDPOINT || "https://www.jblinguistics.com/api/inquiries";
    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            console.error(`Inquiry post failed: ${res.status}`);
        }
    }
    catch (err) {
        console.error("Inquiry post error", err);
    }
}
exports.handler = ask_sdk_core_1.SkillBuilders.custom()
    .addRequestHandlers(LaunchRequestHandler, SetTrackIntentHandler, DailyPhraseIntentHandler, QuickDrillIntentHandler, DrillAnswerIntentHandler, ReviewIntentHandler, HelloIntentHandler, ConsultationIntentHandler, TranslationIntentHandler, HelpIntentHandler, CancelAndStopIntentHandler, FallbackIntentHandler, SessionEndedRequestHandler, IntentReflectorHandler)
    .addErrorHandlers(GlobalErrorHandler)
    .lambda();
