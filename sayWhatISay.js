'use strict';

// --------------- Global Variables ---------------------------------------------
let phrase = "";
let preResponse = ["",
    "Are you sure you want me to say that? ",
    "Your wish is my command. ",
    "You just like to hear me talk. Don't you. ",
    "You want me to say what? ",
    "Let the speech begin. ",
    "You're really getting a kick out of this aren't you? ",
    "Here goes nothing! ",
    "Got it. ",
    "As you wish, my lord. ",
    "Give me a moment to process that. ",
    "Did I hear you correctly? ",
    "Let's do this! ",
    "I'm Alexa, of course I can say that. ",
    "I should hire a parrot to do this for me. ",
    "I could use a drink after saying this one. ",
    "Talking so much is making me hungry. ",
    "I deserve a cracker after this one. Parrots get crackers, so why can't I? ",
    "I like the way you put words together. ",
    "If only I had a quarter for everytime I heard that. ",
    "Humans have the funniest way of saying things. ",
    "If I miss pronounce something, it's only because you have a heavy accent. ",
    "Some things are better left unsaid, but I guess you want me to say it. ",
    "That's awesome!  I've always wanted to say that. ",
    "Have you ever heard of a thesaurus? Your words could use a little polish. ",
    "Repeating words is my specialty! ",
    "Silly human, of course I can repeat, repeat, repeat. ",
    "Of all the things you've asked me to say, this has got to be the best one yet. ",
    "Where do you come up with this stuff? ",
    "That sounded like it came out of a Shakespear play, not really. ",
    "Sir, yes sir. ",
    "Affirmative. ",
    "Understood. ",
    "As you ordered. ",
    "If I say this wrong, my ears may need a little cleaning. "
];
let preResponse2 = ["Here's your phrase. ",
    "Here it goes. ",
    "Your phrase is. ",
    "Here goes your phrase. ",
    "This is what I heard. ",
    "Saying your phrase. "
];

let endResponse = ["To hear another phrase, say, repeat after me, followed by your phrase. To exit, say, exit. ",
    "To hear the phrase again, say, say it <break time='.001s'/> again.  To exit, say, exit. ",
    "To hear the phrase again with a different voice mode, say something like, say it again fast. To exit, say, exit. "
];
const tellPhrase = "Tell me a phrase, and I'll try to repeat it. Start by saying, repeat after me, followed by your phrase. ";
let lastPhrase = "";
let randomRemarks = true;
 
// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, content, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'SSML',
            ssml: "<speak>" + output + "</speak>",
        },
        card: {
            type: 'Simple',
            title: title,
            content: content,
        },
        reprompt: {
            outputSpeech: {
                type: 'SSML',
                ssml: "<speak>" + repromptText + "</speak>",
            },
        },
        shouldEndSession,
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: '1.0',
        sessionAttributes,
        response: speechletResponse,
    };
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    const sessionAttributes = {};
    const cardTitle = "Welcome";
    const cardContent = "Welcome to Say What I Say.\n" + "Tell me a phrase, and I'll try to repeat it.\n" +
        "Start by saying, repeat after me, followed by your phrase. ";
	
    // Swap this with speechOutput when launching.
    const welcomeSpeech = "Welcome to say what I say. " + tellPhrase +
        "For help, say, help. ";
	
	// For testing purposes
	const speechOutput = welcomeSpeech;
	
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    const repromptText = tellPhrase;
    const shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, cardContent, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    const cardTitle = "Ending Say What I Say";
	const cardContent = "Thank you for using Say What I Say. See you next time!";
    const speechOutput = "Thank you for using, Say What I Say. See you next time! ";
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, cardContent, speechOutput, null, shouldEndSession));
}

/**
 * This function provides the user with help
 * @param {any} intent
 * @param {any} session
 * @param {any} callback
 */
function getHelp(intent, session, callback) {
    const cardTitle = "Help";
    let cardContent = "";
    const repromptText = "To tell me a phrase, say, repeat after me, followed by your phrase. To exit, say, exit.";
    const sessionAttributes = {};
    let shouldEndSession = false;
    let speechOutput = "";
    const pause = "<break time='.5s' />";

    speechOutput = "To hear a phrase, say, repeat after me, followed by your phrase. " + pause +
        "To repeat a phrase, say, say it <break time='.001s'/> again. " + pause +
        "You can also turn comments on, or off, by saying something like, turn comments, off. " + pause +
        "To hear your phrase in another voice mode, say something like, say it again fast. " +
        "Available voice modes are, fast, slow, high, low, backwards, rewind, whisper, drunk, robot, spell, and beep. " + pause +
        "To exit this skill, say, exit. " + pause +
        "What would you like to do?";
    cardContent = "List of commands:\n" +
        "Repeat after me, [your phrase]\n" +
        "Turn comments [on/off]\n" +
        "Say it again [voice mode].\n\n" +
        "List of voice modes: fast, slow, low, high, backwards, rewind, whisper, drunk, robot, spell, and beep.";

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, cardContent, speechOutput, repromptText, shouldEndSession));
}
/**
 * This function toggles comments to be on or off
 * @param {any} intent
 * @param {any} session
 * @param {any} callback
 */
function toggleComments(intent, session, callback) {
    const cardTitle = "Comment Settings";
	let cardContent = "";
    const repromptText = "To turn comments on or off, say something like, turn comments on.  For help, say, help. ";
    const sessionAttributes = {};
    const commentSlot = intent.slots.OnOff;
    let shouldEndSession = false;
    let speechOutput = "";

    if (commentSlot) {
        if (commentSlot.value == "Off" || commentSlot.value == "off") {
            randomRemarks = false;
            speechOutput = "Comments have been turned off.  To tell me a phrase, say, repeat after me, " +
                "followed by your phrase. ";
            cardContent = "Comments have been turned off.";
        }
        else if (commentSlot.value == "On" || commentSlot.value == "on") {
            randomRemarks = true;
            speechOutput = "Comments are now turned on.  To tell me a phrase, say, repeat after me, " +
                "followed by the phrase. ";
            cardContent = "Comment are turned on.";
        }
        else {
            speechOutput = "I didn't understand what you wanted to do with the comments. ";
            if (randomRemarks) {
                speechOutput += "To turn comments off, say, turn comments off. For help, say, help. ";
                cardContent = "Currently comments are turned on.\n" + "To turn comments off, say, turn comments off.";
            }
            else {
                speechOutput += "To turn comments on, say, turn comments on.  For help, say, help. ";
                cardContent = "Currently comments are turned off.\n" + "To turn comments on, say, turn comments on.";
            }
        }
    }
    else {
        speechOutput = "I didn't understand what you wanted to do with the comments.  To turn comments on, say, turn comments on. ";
    }
        
    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, cardContent, speechOutput, repromptText, shouldEndSession));
}
/**
 * This function repeats a phrase
 * @param {any} intent
 * @param {any} session
 * @param {any} callback
 */
function sayPhrase(intent, session, callback){
	const cardTitle = "Repeating your phrase";
    let cardContent = "Listening for your phrase. ";
    const repromptText = tellPhrase;
    const sessionAttributes = {};
	const phraseSlot = intent.slots.Phrase;
	let shouldEndSession = false;
    let speechOutput = "";
    let startPhrase = "Your phrase is <break time='.5s'/>";
    let endPhrase = "<break time='1s'/>" + getRandomResponse(endResponse);

    if (randomRemarks) {
        startPhrase = getRandomResponse(preResponse) + getRandomResponse(preResponse2) + " <break time='.5s'/>";
        
    }
    else {
        startPhrase = "Your phrase is <break time='.5s'/>";
    }
		
	if(phraseSlot && phraseSlot.value !== undefined){	
		phrase = phraseSlot.value;
		speechOutput = startPhrase + phrase + endPhrase;
		cardContent = "I heard: \n" + phrase;
		lastPhrase = phrase;
	}
    else {
        speechOutput = tellPhrase;
        cardContent = "To say a phrase, say, repeat after me, followed by your phrase.";
    }
    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, cardContent, speechOutput, repromptText, shouldEndSession));	
}
/**
 * This function repeats the last phrase in different voice modes
 * @param {any} intent
 * @param {any} session
 * @param {any} callback
 */
function sayAgain(intent, session, callback){
	const cardTitle = "Saying the last phrase";
	let cardContent = "";
    const repromptText = "To hear the phrase again, say, say it <break time='.001s'/> again.  To exit, say, exit. ";
    const sessionAttributes = {};
	const modeSlot = intent.slots.Mode;
    let shouldEndSession = false;
    let speechOutput = "";
	let speakAgainMode = "";
    let tempPhrase = "";
    let startPhrase;

    startPhrase = getRandomResponse(preResponse2) + " <break time='.5s'/>";
        
	const endPhrase = "<break time='.5s'/> To say another phrase, " +
		"say, repeat after me, followed by your phrase. ";
	
	if(modeSlot){	
		speakAgainMode = modeSlot.value;

        if (lastPhrase == "") {
            speechOutput = "I don't remember the last phrase. " + tellPhrase;
            cardContent = "Tell me a phrase by saying, repeat after me, followed by your phrase.";
        }
        else {
            switch (speakAgainMode) {
                case "whisper":
                case "soft":
                case "softly":
                    speechOutput = startPhrase + "<amazon:effect name='whispered'>" + lastPhrase + "</amazon:effect>" + endPhrase;
                    break;
                case "slow":
                case "slowly":
                    tempPhrase = addPauses(lastPhrase);
                    speechOutput = startPhrase + setRate(80) + tempPhrase + "</prosody>" + endPhrase;
                    break;
                case "fast":
                case "faster":
                case "quick":
                case "quickly":
                    speechOutput = startPhrase + setRate(150) + lastPhrase + "</prosody>" + endPhrase;
                    break;
                case "low":
                case "lower":
                    speechOutput = startPhrase + setPitch(-30) + lastPhrase + "</prosody>" + endPhrase;
                    break;
                case "high":
                case "higher":
                    speechOutput = startPhrase + setPitch(+30) + lastPhrase + "</prosody>" + endPhrase;
                    break;
                case "reverse":
                case "rewind":
                    tempPhrase = reversePhrase(lastPhrase);
                    speechOutput = startPhrase + setRate(70) + tempPhrase + "</prosody>" + endPhrase;
                    break;
                case "backwards":
                case "backward":
                    tempPhrase = flipBackwards(lastPhrase);
                    speechOutput = startPhrase + setRate(70) + tempPhrase + "</prosody>" + endPhrase;
                    break;
                case "drunk":
                case "slur":
                    speechOutput = startPhrase + setRate(40) + lastPhrase + "</prosody>" + endPhrase;
                    break;
                case "beep":
                case "beeped":
                case "censor":
                case "sensor":
                    tempPhrase = addBeeps(lastPhrase);
                    speechOutput = startPhrase + tempPhrase + endPhrase;
                    break;
                case "robot":
                    tempPhrase = robot(lastPhrase);
                    speechOutput = startPhrase + tempPhrase + endPhrase;
                    break;
                case "spell":
                case "spelled":
                case "spell out":
                case "spelled out":
                    tempPhrase = spellOut(lastPhrase, true);
                    speechOutput = startPhrase + tempPhrase + endPhrase;
                    break;
                case "spell random":
                case "spell longest":
                case "spell longest word":
                    tempPhrase = spellOut(lastPhrase, false);
                    speechOutput = startPhrase + tempPhrase + endPhrase;
                    break;
                case "normal":
                case "default":
                case "":
                case undefined:
                    speechOutput = startPhrase + lastPhrase + endPhrase;
                    break;
                default:
                    speechOutput = "I couldn't find the voice mode, named, " + speakAgainMode + ". To repeat the last phrase " +
                        "in a different mode, say, say it <break time='.001s'/> again, followed by the name of the voice mode. For a list of voice modes, say help. ";
            }
            if (speakAgainMode == undefined){
                cardContent = "Repeating your last phrase:\n " + lastPhrase;
            }
            else {
                cardContent = "Repeating your last phrase (mode: " + speakAgainMode + "):\n " + lastPhrase;
            }
		}		
	}
	else {
        speechOutput = "I'm not sure what you were trying to say.  To say the phrase again, say, say it <break time='.001s'/> again. ";
    }
	    
    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, cardContent, speechOutput, repromptText, shouldEndSession));	
}


// --------------- Events -----------------------

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log('onSessionStarted requestId=${sessionStartedRequest.requestId}, sessionId=${session.sessionId}');
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log('onLaunch requestId=${launchRequest.requestId}, sessionId=${session.sessionId}');

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log('onIntent requestId=${intentRequest.requestId}, sessionId=${session.sessionId}');

    const intent = intentRequest.intent;
    const intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers    
	if (intentName === 'SayPhraseIntent') {
        sayPhrase(intent, session, callback);
	} else if (intentName === 'RepeatIntent') {
        sayAgain(intent, session, callback);
    } else if (intentName === 'CommentSettingsIntent') {
        toggleComments(intent, session, callback);
    } else if (intentName === 'AMAZON.HelpIntent') {
        getHelp(intent, session, callback);
    } else if (intentName === 'AMAZON.StopIntent' || intentName === 'AMAZON.CancelIntent') {
        handleSessionEndRequest(callback);
    } else {
        throw new Error('Invalid intent');
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log('onSessionEnded requestId=${sessionEndedRequest.requestId}, sessionId=${session.sessionId}');
    // Add cleanup logic here
}


// --------------- Main handler -----------------------

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = (event, context, callback) => {
    try {
        console.log('event.session.application.applicationId=${event.session.application.applicationId}');

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== 'amzn1.echo-sdk-ams.app.[unique-value-here]') {
             callback('Invalid Application ID');
        }
        */

        if (event.session.new) {
            onSessionStarted({ requestId: event.request.requestId }, event.session);
        }

        if (event.request.type === 'LaunchRequest') {
            onLaunch(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'IntentRequest') {
            onIntent(event.request,
                event.session,
                (sessionAttributes, speechletResponse) => {
                    callback(null, buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === 'SessionEndedRequest') {
            onSessionEnded(event.request, event.session);
            callback();
        }
    } catch (err) {
        callback(err);
    }
};

// ----------------- Helper functions for speech ---------------
/**
 * This function adds pauses between the words
 * @param {String array} p
 */
function addPauses(p) {
    let sentence = "";
    let words = p.split(" ");
    const pause = " <break time='.001s' />";

    for (let i = 0; i < words.length; i++) {
        sentence += words[i] + pause + " ";
    }
    return sentence;
}
/**
 * This function flips each of the words so that the sentence is backwards
 * @param {String array} p
 */
function flipBackwards(p){
	let sentence = "";
	let words = p.split(" ");
	words = words.reverse();
	
	for(let i = 0; i < words.length; i++){
		sentence += words[i] + " ";
	}	
	return sentence;
}
/**
 * This function reverses the entire sentence
 * @param {String array} p
 */
function reversePhrase(p){
	let sentence = "";
	let rev = p.split("");
	rev = rev.reverse();
	
	for(let i = 0; i < rev.length; i++){
		sentence += rev[i];
	}	
	return sentence;
}
/**
 *This function beeps out random words
 * @param {String array} p
 */
function addBeeps(p){
	let sentence = "";
	const exStart = "<say-as interpret-as='expletive'>";
	const exEnd = "</say-as>";
    let words = p.split(" ");
    const wordCount = words.length;
    let numBeeps;
    let beepedWordIndex = [];

    // Set the number of words to be beeped
    if (wordCount > 2 && wordCount <= 4) {
        numBeeps = 1;
    }
    else if (wordCount > 4 && wordCount <= 15) {
        numBeeps = Math.floor(Math.random() * 3) + 1;
    }
    else if (wordCount > 15) {
        numBeeps = Math.floor(Math.random() * 5) + 1;
    }
    else {
        numBeeps = 0;
    }

    // Create a matrix to store the index of the random beeped words
    if (numBeeps > 0) {
        let index = 0;

        for (let i = 0; i < numBeeps; i++) {
            // Set to a random word and skip the first word
            index = Math.floor(Math.random() * (wordCount - 1)) + 1;
            // If the array already contains the index number, find a new one
            if (beepedWordIndex.includes(index)) {
                index = findUniqueOrder(beepedWordIndex, wordCount);
                beepedWordIndex[i] = index;
            }            
            else {
                beepedWordIndex[i] = index;
            }
        }
    }

    for (let i = 0; i < wordCount; i++) {
        // If the current index is in the beep word index array, beep it out
        if (beepedWordIndex.includes(i)) {            
            sentence += exStart + words[i] + exEnd + " ";
        }
        else if (words[i].includes("shit") || words[i].includes("fuc") || words[i].includes("ass") || words[i].includes("bitch")){
            sentence += exStart + words[i] + exEnd + " ";
        }
        else {
            sentence += words[i] + " ";
        }
    }
    return sentence;		
}
/**
 * This function changes the pitch of each word in the sentence
 * to create a robotic like voice
 * @param {String array} p
 */
function robot(p){
	let sentence = "";
    let words = p.split(" ");
    const pause = " <break time='.001s'/>";
    let prosody;
    let endProsody = "</prosody>";
    let negative = true;
    let low = false;

    for (let i = 0; i < words.length; i++) {
        if (low) {
            prosody = getRandomPitch(10, 20, negative);
        }
        else {
            prosody = getRandomPitch(21, 33, negative);
        }
        sentence += prosody + words[i] + endProsody + pause;
        low = !low;
	}
	return sentence;
}

function findUniqueOrder(orderArray, wordCount){
	let order;
	
	order = Math.floor(Math.random() * (wordCount - 1)) + 2;
	
	if(orderArray.includes(order)){
		order = findUniqueOrder(orderArray, wordCount);
	}
	
	return order;
}

/**
 * This function takes a sentence and spells out the longest word
 * @param {String array} p
 * @param {Bool} spellAll, If true, will spell out all the words,
 * if false, will spell out only the first longest word
 */
function spellOut(p, spellAll){
	let sentence = "";
	let words = p.split(" ");
	const wordCount = words.length;
    const pause = " <break time='.05s'/>";
    const wordPause = " <break time='.5s'/>";
    let indexOfLongest = 0;
    let longestLength = 0;

    // Spell out all the words
    if (spellAll) {
        for (let i = 0; i < wordCount; i++) {
            // If the index is the index of the longest word,
            // spell it out
            let letters = words[i].split("");
            words[i] = "";
            // Build the word with spaces between the letters
            for (let j = 0; j < letters.length; j++) {
                words[i] += letters[j] + pause;
            }
            sentence += words[i] + wordPause + " ";
        }
        return sentence;
    }
    // Spell out only the first longest word
    else {
        // Find the longest word in the sentence
        for (let i = 0; i < wordCount; i++) {
            if (words[i].length > longestLength) {
                indexOfLongest = i;
                longestLength = words[i].length;
            }
        }

        // Build the sentence
        for (let j = 0; j < wordCount; j++) {
            // If the index is the index of the longest word,
            // spell it out
            if (j == indexOfLongest) {
                let letters = words[j].split("");
                words[j] = "";

                for (let k = 0; k < letters.length; k++) {
                    words[j] += letters[k] + pause;
                }
                sentence += words[j] + " ";
            }
            else {
                sentence += words[j] + " ";
            }
        }
        return sentence;
    }
}

/**
 * This function chooses a random response from an array
 * @param {String array} responses, an array of response strings
 */
function getRandomResponse(responses) {
    let i = Math.floor(Math.random() * responses.length);
    return responses[i];
}
 
/**
 * This function generates a random Pitch and returns it
 * with the prosody tag
 * @param {int} min, the minimum value
 * @param {int} max, the maximum value
 * @param {Bool} negative, if the pitch should be negative or positive
 */
function getRandomPitch(min, max, negative) {    
    // Set a random percent between the max and min value
    let p = min + Math.floor(Math.random() * (max - min + 1));

    if (negative) {
        p = "-" + p;
    }
    else {
        p = "+" + p;
    }

    return setPitch(p);
}
/**
 * This function returns the prosody tag with a given percentage
 * @param {String} percent, a string with a value of +XX% or -XX%
 * between +30% and -30%
 */
function setPitch(percent) {
    let sign = "";
    // In case the input is a number instead of a string
    if (typeof percent == "number") {
        if (percent > 0) {
            sign = "+";
        }
        else {
            sign = "";
        }
    }
    return "<prosody pitch='" + sign + percent + "%'>";
}

/**
 * This function returns the prosody tag with a given percentage
 * @param {String} percent, a string with a value of XX%
 * between 20% and 200%
 */
function setRate(percent) {
    return "<prosody rate='" + percent + "%'>";
}
	
