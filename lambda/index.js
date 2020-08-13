// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const Responses = require('./responses.js');
const Voices = require('./voices.js');
const VoiceModes = require('./voice_modes.js');
const { Utils } = require('./phrase_modifiers');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const cardTitle = "Welcome";
        const cardContent = `Tell me a phrase, and I'll try to repeat it.`;
        const welcomeSpeech = "Welcome to say what I say. Start by saying, repeat after me. ";
        let repromptText = Responses.getRandomEndPrompt();
        let speakOutput = welcomeSpeech;

        // Initialize session attributes
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.lastPhrase = "";
        sessionAttributes.randomRemarks = true;
        sessionAttributes.randomHints = true;
        sessionAttributes.currentAccent = "default";

        let currentAccent = sessionAttributes.currentAccent;

        speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");
        repromptText = Utils.buildSpeechOutput(repromptText, currentAccent, "");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .withSimpleCard(cardTitle, cardContent)
            .getResponse();
    }
};


// // For custom task
// const SayPhraseTaskHandler = {
//     canHandle(handlerInput) {
//         return (Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest'
//             && handlerInput.requestEnvelope.request.task.name === "amzn1.ask.skill.ac17abf2-8c3a-41dd-a81c-e63cf50cea72.SayPhrase");
//     },
//     handle(handlerInput) {
//         const { task } = handlerInput.requestEnvelope.request;
//         const cardTitle = "Saying phrase";
//         let speakOutput = "";
//         let cardContent = "";
//         let phrase = "";
//         let voice = "";
//         let mode = "";

//         if (task) {
//             phrase = task.input.phrase;
//             voice = task.input.voice;
//             mode = task.input.voiceMode;
//         }

//         cardContent = `Here's what I heard: \n ${phrase}`;

//         speakOutput = Utils.buildSpeechOutput(phrase, voice, mode);

//         return handlerInput.responseBuilder
//             .speak(speakOutput)
//             .withShouldEndSession(true)
//             .withSimpleCard(cardTitle, cardContent)
//             .getResponse();
//     }
// };

const SayPhraseStartedHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SayPhraseIntent'
            && !handlerInput.requestEnvelope.request.intent.slots.phrase.value;
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const currentAccent = sessionAttributes.currentAccent;
        let cardTitle = "Say your phrase";
        let cardContent = "Tell me what to say.";
        let speakOutput = Responses.getRandomInitialPrompt();

        speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .addElicitSlotDirective('phrase')
            .withSimpleCard(cardTitle, cardContent)
            .getResponse();
    }
};

const SayPhraseCompletedHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SayPhraseIntent'
            && handlerInput.requestEnvelope.request.intent.slots.phrase.value;
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const currentAccent = sessionAttributes.currentAccent;
        const randomRemarks = sessionAttributes.randomRemarks;
        const randomHints = sessionAttributes.randomHints;
        const cardTitle = "Repeating your phrase";
        let cardContent = "Here goes your phrase... ";
        const phrase = Alexa.getSlotValue(handlerInput.requestEnvelope, 'phrase');
        let speakOutput = "";
        let startPhrase = "";
        let endPhrase = "";

        if (randomRemarks) {
            startPhrase = Responses.getRandomPreResponse() + Responses.getRandomPreResponse2() + " <break time='.5s'/>";
        }
        else {
            startPhrase = "<break time='1s'/>";
        }

        if (randomHints) {
            endPhrase = "<break time='1s'/>" + Responses.getRandomHint();
        }
        else {
            endPhrase = "<break time='1s'/>";
        }

        if (phrase) {
            speakOutput = Utils.buildSpeechOutput(startPhrase + phrase + endPhrase + Responses.getRandomEndPrompt(), currentAccent, "");
            cardContent = `I heard: \n${phrase}`;
            sessionAttributes.lastPhrase = phrase;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        }
        else {
            speakOutput = "To tell me a phrase, say, repeat after me. ";
            cardContent = `To tell me a phrase, start by saying, "repeat after me".`;
            speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard(cardTitle, cardContent)
            .withShouldEndSession(false)
            .getResponse();
    },
};

const SayAgainHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SayAgainIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const lastPhrase = sessionAttributes.lastPhrase;
        const currentAccent = sessionAttributes.currentAccent;
        const randomRemarks = sessionAttributes.randomRemarks;
        const randomHints = sessionAttributes.randomHints;
        const cardTitle = "Saying the last phrase";
        let cardContent = "";
        let repromptText = `To hear the phrase again, say, say it <break time='.001s'/> again. ${Responses.getRandomEndPrompt()}`;
        const modeSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'mode');
        const modeValue = Utils.getERSlotValue(modeSlot);
        let endPhrase = "";
        let speakOutput = "";
        let speakAgainMode = "";
        let startPhrase = "";
        let isValidMode = false;

        for (let i = 0; i < VoiceModes.modes.length; i++) {
            if (modeValue == VoiceModes.modes[i]) {
                isValidMode = true;
            }
        }

        if (randomRemarks) {
            startPhrase = Responses.getRandomPreResponse2();
        }
        else {
            startPhrase = "<break time='1s'/>";
        }

        if (randomHints) {
            endPhrase = "<break time='1s'/>" + Responses.getRandomHint();
        }
        else {
            endPhrase = "<break time='1s'/>";
        }

        if (modeSlot) {
            speakAgainMode = modeValue;

            if (speakAgainMode == "random") {
                speakAgainMode = VoiceModes.getRandomVoiceMode();
            }

            if (isValidMode && lastPhrase != "") {
                startPhrase += "in " + speakAgainMode + " mode. " + " <break time='.5s'/>";

                let modOutput = Utils.buildSpeechOutput(lastPhrase, currentAccent, speakAgainMode);
                speakOutput = Utils.buildSpeechOutput(startPhrase + modOutput + endPhrase + Responses.getRandomEndPrompt(), currentAccent, "");
                cardContent = "Repeating your last phrase (mode: " + speakAgainMode + "):\n " + lastPhrase;
            }
            else if ((modeValue == "" || !modeValue) && lastPhrase != "") {
                speakOutput = Utils.buildSpeechOutput(startPhrase + lastPhrase + endPhrase + Responses.getRandomEndPrompt(), currentAccent, "");
                cardContent = "Repeating your last phrase:\n " + lastPhrase;
            }
            else if (lastPhrase == "") {
                speakOutput = "I don't remember the last phrase. To tell me a phrase, say, repeat after me";
                speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");
                cardContent = "Tell me a phrase by saying, repeat after me, followed by your phrase.";
            }
            else {
                speakOutput = `I wasn't able to find, ${modeSlot.value}, mode.`;
                speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");
                cardContent = `Unable to find the ${speakAgainMode} mode.`;
            }
        }
        else {
            speakOutput = "I'm not sure what you were trying to say.  To say the phrase again, say, say it <break time='.001s'/> again. ";
            speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");
            cardContent = "Tell me a phrase by saying, repeat after me, followed by your phrase.";
        }

        repromptText = Utils.buildSpeechOutput(repromptText, currentAccent, "");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .withSimpleCard(cardTitle, cardContent)
            .getResponse();
    }
};

const SayVoiceModesHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SayVoiceModesIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const currentAccent = sessionAttributes.currentAccent;
        const cardTitle = "Voice Mode List";
        const cardContent = "List of voice modes:\n" +
            "Fast, slow, low, high, backwards, rewind, whisper, drunk, robot, spell, and beep.";
        let speakOutput = "The following are a list of voice modes. " +
            "fast, slow, high, low, backwards, rewind, whisper, drunk, robot, spell, and beep. " +
            "To hear your phrase in another voice mode, say something like, say it again, " + VoiceModes.getRandomVoiceMode() + ". ";
        let repromptText = "To hear your phrase in another voice mode, say something like, say it again, " + VoiceModes.getRandomVoiceMode() + ". ";

        speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");
        repromptText = Utils.buildSpeechOutput(repromptText, currentAccent, "");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .withSimpleCard(cardTitle, cardContent)
            .getResponse();
    }
};

const SayAccentsHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SayAccentsIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const currentAccent = sessionAttributes.currentAccent;
        const cardTitle = "Accent List";
        const cardContent = "List of accents:\n" +
            "American, Australian, British, French, German, Indian, Italian, Japanese, Portuguese, and Spanish.";
        let speakOutput = "The following are a list of accents I can speak with. " +
            "American, Australian, British, French, German, Indian, Italian, Japanese, Portuguese, and Spanish. " +
            "To change my accent, say something like, change to " + Voices.getRandomVoice().description + ". ";
        let repromptText = "To change my accent, say something like, change accent to " + Voices.getRandomVoice().description + ". ";

        speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");
        repromptText = Utils.buildSpeechOutput(repromptText, currentAccent, "");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .withSimpleCard(cardTitle, cardContent)
            .getResponse();
    }
};

const ChangeAccentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ChangeAccentIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let currentAccent = sessionAttributes.currentAccent;
        const cardTitle = "Changing Accent";
        let cardContent = "";
        let repromptText = "To change an accent, say something like, change accent to, " + Voices.getRandomVoice().description + ". ";
        let accentSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'accent');
        let newAccent = Utils.getERSlotValue(accentSlot);
        let speakOutput = "";

        if (!accentSlot.value) {
            let newVoice = Voices.getRandomVoice();
            let voiceDescription = newVoice.description;
            let voiceName = newVoice.name;

            currentAccent = voiceName;
            sessionAttributes.currentAccent = currentAccent;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

            speakOutput = `Accent has been changed to ${voiceDescription}. ${Responses.getRandomEndPrompt()}`;
            cardContent = `Accent has been changed to ${voiceDescription}. `;
        }
        else if (newAccent) {
            let isValidVoice = false;

            if (newAccent == "random") {
                let newVoice = Voices.getRandomVoice();
                accentSlot.value = newVoice.description;
                newAccent = newVoice.name;
            }

            for (let i = 0; i < Voices.voices.length; i++) {
                if (newAccent == Voices.voices[i].name) {
                    isValidVoice = true;
                }
            }

            if (isValidVoice) {
                currentAccent = newAccent;

                sessionAttributes.currentAccent = currentAccent;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                speakOutput = `Accent has been changed to ${accentSlot.value}. ${Responses.getRandomEndPrompt()}`;
                cardContent = `Accent has been changed to ${accentSlot.value}. `;
            }
            else {
                speakOutput = `I don't think I know how to speak with a ${accentSlot.value} accent. 
                Please try a different accent by saying something like, change accent to, ${Voices.getRandomVoice().description}. `;
                cardContent = "The following are a list of available accents I can speak: \n" +
                    "American, Australian, British, French, German, Indian, Italian, Japanese, Portuguese, and Spanish.";
            }
        }
        else {
            speakOutput = "I didn't understand which accent you wanted. To change accents, say, change accent to, " +
                "followed by the name of the accent.  For a list of accents, say, list accents. ";
            cardContent = "I didn't understand which accent you wanted.\n To change accents, say, change accent to, " +
                "followed by the name of the accent.  For a list of accents, say, list accents. ";
        }

        speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");
        repromptText = Utils.buildSpeechOutput(repromptText, currentAccent, "");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .withSimpleCard(cardTitle, cardContent)
            .getResponse();
    }
};

const ToggleCommentsHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ToggleCommentsIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const currentAccent = sessionAttributes.currentAccent;
        let randomRemarks = sessionAttributes.randomRemarks;
        const cardTitle = "Comment Settings";
        let cardContent = "";
        let repromptText = `To turn comments on or off, say something like, turn comments on. ${Responses.getRandomHelpResponse()}`;
        const commentSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'onOff');
        let speakOutput = "";

        if (commentSlot) {
            if (commentSlot.value == "Off" || commentSlot.value == "off") {
                randomRemarks = false;

                sessionAttributes.randomRemarks = randomRemarks;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                speakOutput = `Comments have been turned off. ${Responses.getRandomEndPrompt()}`;
                cardContent = "Comments have been turned off.";
            }
            else if (commentSlot.value == "On" || commentSlot.value == "on") {
                randomRemarks = true;

                sessionAttributes.randomRemarks = randomRemarks;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                speakOutput = `Comments are now turned on. ${Responses.getRandomEndPrompt()}`;
                cardContent = "Comment are turned on.";
            }
            else {
                speakOutput = "I didn't understand what you wanted to do with the comments. ";
                if (randomRemarks) {
                    speakOutput += `To turn comments off, say, turn comments off. ${Responses.getRandomHelpResponse()}`;
                    cardContent = "Currently comments are turned on.\n" + "To turn comments off, say, turn comments off.";
                }
                else {
                    speakOutput += `To turn comments on, say, turn comments on. ${Responses.getRandomHelpResponse()}`;
                    cardContent = "Currently comments are turned off.\n" + "To turn comments on, say, turn comments on.";
                }
            }
        }
        else {
            speakOutput = "I didn't understand if you wanted comments on or off.  To turn comments on, say, turn comments on. ";
            cardContent = "To turn comments on or off, say something like, turn comments on.";
        }

        speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");
        repromptText = Utils.buildSpeechOutput(repromptText, currentAccent, "");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .withSimpleCard(cardTitle, cardContent)
            .getResponse();
    }
};

const ToggleHintsHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ToggleHintsIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const currentAccent = sessionAttributes.currentAccent;
        let randomHints = sessionAttributes.randomHints;
        const cardTitle = "Hint Settings";
        let cardContent = "";
        let repromptText = `To turn hints on or off, say something like, turn hints on. ${Responses.getRandomHelpResponse()}`;
        const hintSlot = Alexa.getSlot(handlerInput.requestEnvelope, 'onOff');
        let speakOutput = "";

        if (hintSlot) {
            if (hintSlot.value == "Off" || hintSlot.value == "off") {
                randomHints = false;

                sessionAttributes.randomHints = randomHints;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                speakOutput = `Hints have been turned off. ${Responses.getRandomEndPrompt()}`;
                cardContent = "Hints have been turned off.";
            }
            else if (hintSlot.value == "On" || hintSlot.value == "on") {
                randomHints = true;

                sessionAttributes.randomHints = randomHints;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                speakOutput = `Hints are now turned on. ${Responses.getRandomEndPrompt()}`;
                cardContent = "Hints are turned on.";
            }
            else {
                speakOutput = "I didn't understand what you wanted to do with the hints. ";
                if (randomHints) {
                    speakOutput += `To turn hints off, say, turn hints off. ${Responses.getRandomHelpResponse()}`;
                    cardContent = "Currently hints are turned on.\n" + "To turn hints off, say, turn hints off.";
                }
                else {
                    speakOutput += `To turn hints on, say, turn hints on. ${Responses.getRandomHelpResponse()}`;
                    cardContent = "Currently hints are turned off.\n" + "To turn hints on, say, turn hints on.";
                }
            }
        }
        else {
            speakOutput = "I didn't understand if you wanted hints on or off.  To turn hints on, say, turn hints on. ";
            cardContent = "To turn hints on or off, say something like, turn hints on.";
        }

        speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");
        repromptText = Utils.buildSpeechOutput(repromptText, currentAccent, "");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .withSimpleCard(cardTitle, cardContent)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const currentAccent = sessionAttributes.currentAccent;
        const cardTitle = "Help";
        let repromptText = "To tell me a phrase, say, repeat after me.";
        const pause = "<break time='.5s' />";
        let speakOutput = `To hear me repeat a phrase, say, repeat after me. ${pause}
            To repeat a phrase, say, say it <break time='.001s'/> again. ${pause}
            Comments can be turned on, or off, by saying something like, turn comments, off. ${pause}
            Hints can be turned on, or off, by saying something like, turn hints, off. ${pause}
            To hear your phrase in another voice mode, say something like, say it again, ${VoiceModes.getRandomVoiceMode()}. ${pause}
            For a list of voice modes, say, list voice modes. ${pause}
            To change my accent, say something like, change accent to ${Voices.getRandomVoice().description}. ${pause}
            For a list of accents I can speak, say, list accents. ${pause}
            To end this skill, say, end. ${pause}
            ${Responses.getRandomEndPrompt()}`;
        const cardContent = "List of commands:\n" +
            "Repeat after me, [your phrase]\n" +
            "Turn comments [on/off]\n" +
            "Turn hints [on/off]\n" +
            "Say it again [voice mode].\n" +
            "Change accent to [name of accent].\n" +
            "List voice modes.\n" +
            "List accents";

        speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");
        repromptText = Utils.buildSpeechOutput(repromptText, currentAccent, "");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .withSimpleCard(cardTitle, cardContent)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const currentAccent = sessionAttributes.currentAccent;
        const cardTitle = "Need Help?";
        const cardContent = "I didn't understand what you were trying to say. For help, say help.";
        let speakOutput = Responses.getRandomFallback() + Responses.getRandomHelpResponse();

        speakOutput = Utils.buildSpeechOutput(speakOutput, currentAccent, "");

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard(cardTitle, cardContent)
            .withShouldEndSession(false)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = Responses.getRandomExitResponse() + Responses.getRandomExitResponse2();
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        const cardTitle = "Ending Say What I Say";
        const cardContent = "Thanks for using Say What I Say. See you next time!";
        const speakOutput = Responses.getRandomExitResponse() + Responses.getRandomExitResponse2();

        // Any cleanup logic goes here.
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withSimpleCard(cardTitle, cardContent)
            .getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        //SayPhraseTaskHandler,
        LaunchRequestHandler,
        SayPhraseStartedHandler,
        SayPhraseCompletedHandler,
        SayAgainHandler,
        SayVoiceModesHandler,
        SayAccentsHandler,
        ChangeAccentHandler,
        ToggleCommentsHandler,
        ToggleHintsHandler,
        HelpIntentHandler,
        FallbackIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
