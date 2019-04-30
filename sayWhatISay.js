'use strict';

/**
 * Author: Ernest Lee
 * Say What I Say
 * An Alexa Skill that repeats what you say in different voice modes and accents.
 */

// --------------- Global Variables ---------------------------------------------
const modes = [
    "fast",
    "slow",
    "high",
    "low",
    "backwards",
    "rewind",
    "whisper",
    "beep",
    "spelled out",
    "robot",
    "drunk",
    "valley girl",
    "random"
];

const fillerWords = [
    "like",
    "umm",
    "I mean",
    "okay",
    "uh",
    "you know",
    "you see"
];

const valleyFillerWords = [
    " like",
    ", umm",
    ", umm, like",
    " like, umm",
    " like",
    " like"
];

const preResponse = [
    "",
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
    "That sounded like it came out of a Shakespeare play, not really. ",
    "Sir, yes sir. ",
    "Affirmative. ",
    "Understood. ",
    "As you ordered. ",
    "If I say this wrong, my ears may need a little cleaning. "
];

const preResponse2 = [
    "Here's your phrase. ",
    "Here it goes. ",
    "Your phrase is. ",
    "Here goes your phrase. ",
    "This is what I heard. ",
    "Saying your phrase. "
];

const exitResponses = [
    "",
    "Thank you for using Say What I Say. ",
    "Thanks for the stimulating conversation. ",
    "It's about time! I was starting to lose my voice. ",
    "Thanks for the chit chat, I needed it! ",
    "I get the hint, I talk too much, but that just means you do too! ",
    "Got it. ",
    "Ending already?  But I was just getting started! ",
    "That was a fun chat. "
];

const exitResponses2 = [
    "",
    "Can't wait to hear more next time! ",
    "Talk to you next time! ",
    "Have a good one! ",
    "Anytime you need someone to repeat something, you know where to find me! ",
    "See you later, alligator. ",
    "Bye bye! ",
    "Audios, amigo! ",
    "ah-sta-la-vee-sta, baby! ",
    "Ciao! ",
    "Till we meet again! "
]

const accents = {
    "Alexa": 'default',
    "boy": 'Justin',
    "girl": 'Ivy',
    "American male": 'Matthew',
    "American female": 'Salli',
    "Australian male": 'Russell',
    "Australian female": 'Nicole',
    "British male": 'Brian',
    "British female": 'Amy',
    "Indian female two": 'Raveena',
    "Indian female": 'Aditi',
    "German male": 'Hans',
    "German female": 'Vicki',
    "Spanish male": 'Enrique',
    "Spanish female": 'Conchita',
    "Italian male": 'Giorgio',
    "Italian female": 'Carla',
    "Japanese male": 'Takumi',
    "Japanese female": 'Mizuki',
    "French male": 'Mathieu',
    "French female": 'Lea'
};

const tellPhrase = "Tell me a phrase, and I'll try to repeat it. Start by saying, repeat after me, followed by your phrase. ";

let phrase = "";
let lastPhrase = "";
let randomRemarks = true;
let currentAccent = "default";
let voiceTag = "";
let voiceTagClose = "";

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, content, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: 'SSML',
            ssml: "<speak>" + voiceTag + output + voiceTagClose + "</speak>",
        },
        card: {
            type: 'Simple',
            title: title,
            content: content,
        },
        reprompt: {
            outputSpeech: {
                type: 'SSML',
                ssml: "<speak>" + voiceTag + repromptText + voiceTagClose + "</speak>",
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
    const speechOutput = getRandomArrayElement(exitResponses) + getRandomArrayElement(exitResponses2);
    // Setting this to true ends the session and exits the skill.
    const shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, cardContent, speechOutput, null, shouldEndSession));
}

/**
 * This function provides the user with help *
 */
function getHelp(intent, session, callback) {
    const cardTitle = "Help";
    const repromptText = "To tell me a phrase, say, repeat after me, followed by your phrase. To end this skill, say, end.";
    const sessionAttributes = {};
    const shouldEndSession = false;
    const pause = "<break time='.5s' />";
    const speechOutput = "To hear a phrase, say, repeat after me, followed by your phrase. " + pause +
        "To repeat a phrase, say, say it <break time='.001s'/> again. " + pause +
        "You can also turn comments on, or off, by saying something like, turn comments, off. " + pause +
        "To hear your phrase in another voice mode, say something like, say it again," +  getRandomArrayElement(modes) + ". " +
        "For a list of voice modes, say, list voice modes." + pause +
        "To change my accent, say something like, change accent to " + getRandomAccent() + ". " +         
        "For a list of accents I can speak, say, list accents." + pause +
        "To end this skill, say, end. " + pause +
        "What would you like to do?";
    const cardContent = "List of commands:\n" +
        "Repeat after me, [your phrase]\n" +
        "Turn comments [on/off]\n" +
        "Say it again [voice mode].\n" +
        "Change accent to [name of accent].\n" +
        "List voice modes.\n" +
        "List accents";

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, cardContent, speechOutput, repromptText, shouldEndSession));
}

/**
 * This function toggles comments to be on or off * 
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
        speechOutput = "I didn't understand if you wanted comments on or off.  To turn comments on, say, turn comments on. ";
    }
        
    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, cardContent, speechOutput, repromptText, shouldEndSession));
}

/**
 * The function says a list of available accents * 
 */
function sayAccents(intent, session, callback) {
    const cardTitle = "Accent List";
    const cardContent = "List of accents:\n" + 
        "American, Australian, British, French, German, Italian, Japanese, and Spanish.";
    const sessionAttributes = {};
    const shouldEndSession = false;
    const speechOutput = "The following are a list of accents I can speak with. " + 
        "American, Australian, British, French, German, Italian, Japanese, and Spanish. " + 
        "To change my accent, say something like, change to " + getRandomAccent() + ". ";
    const repromptText = "To change my accent, say something like, change accent to " + getRandomAccent() + ". ";

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, cardContent, speechOutput, repromptText, shouldEndSession));
}

/**
 * The function says a list of available voice modes * 
 */
function sayVoiceModes(intent, session, callback) {
    const cardTitle = "Voice Mode List";
    const cardContent = "List of voice modes:\n" + 
        "Fast, slow, low, high, backwards, rewind, whisper, drunk, robot, spell, and beep.";
    const sessionAttributes = {};
    const shouldEndSession = false;
    const speechOutput = "The following are a list of voice modes. " +
        "fast, slow, high, low, backwards, rewind, whisper, drunk, robot, spell, and beep. " + 
        "To hear your phrase in another voice mode, say something like, say it again, " + getRandomArrayElement(modes) + ". ";
    const repromptText = "To hear your phrase in another voice mode, say something like, say it again, " + getRandomArrayElement(modes) + ". ";

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, cardContent, speechOutput, repromptText, shouldEndSession));
}

/**
* This function changes the accent
*/
function changeAccent(intent, session, callback){
    const cardTitle = "Changing Accent";
	let cardContent = "";
    const repromptText = "To change an accent, say something like, change accent to, " + getRandomAccent() + ".  For help, say, help. ";
    const sessionAttributes = {};
    const accentSlot = intent.slots.Accent
    const newAccent = getERSlotValue(intent.slots.Accent);
    let shouldEndSession = false;
    let speechOutput = "";
    
    if (newAccent) {
        let accentName = accents[newAccent]
        if (accentName != undefined){
            setVoiceTags(accentName);
            currentAccent = accentName;
            speechOutput = "Accent has been changed to " + newAccent + ". " + tellPhrase;
            cardContent = "Accent has been changed to " + newAccent + ". "
        }      
        else{
            speechOutput = "I don't think I know how to speak in, " + accentSlot.value +
                ".  Please try a different accent by saying something like, change accent to, " + getRandomAccent() + ". ";
            cardContent = "The following are a list of available accents I can speak: \n" + 
                "American, Australian, British, French, German, Italian, Japanese, and Spanish.";
        }        
    }
    else{
        speechOutput = "I didn't understand which accent you wanted. To change accents, say, change accent to, " +
            "followed by the name of the accent.  For a list of accents, say, list accents. ";
        cardContent = "I didn't understand which accent you wanted.\n To change accents, say, change accent to, " +
        "followed by the name of the accent.  For a list of accents, say, list accents. "
    }
    
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, cardContent, speechOutput, repromptText, shouldEndSession));
}

/**
 * This function repeats a phrase
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
    let endPhrase = "<break time='1s'/>" + "To hear the phrase again with a different voice mode, say something like, say it again," +
    getRandomArrayElement(modes) + ". To end this skill, say, end. ";

    if (randomRemarks) {
        startPhrase = getRandomArrayElement(preResponse) + getRandomArrayElement(preResponse2) + " <break time='.5s'/>";
        
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
 */
function sayAgain(intent, session, callback){
	const cardTitle = "Saying the last phrase";
	let cardContent = "";
    const repromptText = "To hear the phrase again, say, say it <break time='.001s'/> again.  To end this skill, say, end. ";
    const sessionAttributes = {};
	const modeSlot = intent.slots.Mode;
    let shouldEndSession = false;
    let speechOutput = "";
	let speakAgainMode = "";
    let tempPhrase = "";
    let startPhrase;

    startPhrase = getRandomArrayElement(preResponse2);
        
	const endPhrase = "<break time='.5s'/> To say another phrase, " +
		"say, repeat after me, followed by your phrase. ";
	
	if(modeSlot){	
		speakAgainMode = modeSlot.value;

        if (speakAgainMode == "random") {
            speakAgainMode = getRandomArrayElement(modes);
        }

        if (speakAgainMode !== undefined) {
            startPhrase += "in " + speakAgainMode + " mode. " + " <break time='.5s'/>";
        }

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
                case "valley girl":
                case "valley speak":
                case "like":
                case "valley":
                    tempPhrase = addFiller(lastPhrase, valleyFillerWords);
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
                case "spell one":
                case "spell 1":
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
    } else if (intentName === 'ChangeAccentIntent') {
        changeAccent(intent, session, callback);
    } else if (intentName === 'ListVoiceModeIntent') {
        sayVoiceModes(intent, session, callback);
    } else if (intentName === 'ListAccentIntent') {
        sayAccents(intent, session, callback);
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
 * This function uses entity resolution to get a slot value
 * If a slot synonym is found the named slot value is returned
 * If using slots by id, set useId to true
 * Original code found on stackoverflow:
 * https://stackoverflow.com/questions/48638353/how-to-handle-synonyms-in-intents-in-alexa
 * @param {String} slot
 * @param {bool} useId 
 * @return {String} the slot value
 */
function getERSlotValue(slot, useId){
    let value = slot.value;
    let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;
    if(resolution && resolution.status.code == 'ER_SUCCESS_MATCH'){
        let resolutionValue = resolution.values[0].value;
        value = resolutionValue.id && useId ? resolutionValue.id : resolutionValue.name;
    }
    return value;
}

/**
 * This function sets the opening and closing voice tags to a targeted name
 * to obtain a particular accent, reference Amazon Polly
 * @param {String} name 
 */
function setVoiceTags(name){
    if (name == "default" || name == ""){
        voiceTag = "";
        voiceTagClose = "";
    }
    else{
        voiceTag = "<voice name ='" + name + "'>";
        voiceTagClose = "</voice>";
    }
}

/**
 * Returns a random accent from the accents array
 * 
 */
function getRandomAccent(){
    let accentTypes = Object.keys(accents);
    let i = Math.floor(Math.random() * accentTypes.length);
    return accentTypes[i];
}

/**
 * This function adds pauses between the words
 * @param {String array} p
 * @return {String} The phrase with pauses added
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
 * @return {String} The phrase flipped backwards
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
 * @return {String} The phrase reversed
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
 * @return {String} The phrase with beep tags added
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
 * This function adds filler words from an array to the original phrase
 * @param {String} p 
 * @param {String Array} fillers - an array of filler words
 * @return {String} The new phrase with added filler words
 */
function addFiller(p, fillers) {
    let sentence = "";
    let words = p.split(" ");
    const wordCount = words.length;
    let numInserts;
    let insertWordIndex = [];

    // Set the number of words to be inserted
    if (wordCount > 2 && wordCount <= 4) {
        numInserts = 1;
    }
    else if (wordCount > 4 && wordCount <= 15) {
        numInserts = Math.floor(Math.random() * 3) + 1;
    }
    else if (wordCount > 15) {
        numInserts = Math.floor(Math.random() * 5) + 1;
    }
    else {
        numInserts = 0;
    }

    // Create a matrix to store the index of the random inserted words
    if (numInserts > 0) {
        let index = 0;

        for (let i = 0; i < numInserts; i++) {
            // Set to a random word
            index = Math.floor(Math.random() * (wordCount - 1));
            // If the array already contains the index number, find a new one
            if (insertWordIndex.includes(index)) {
                index = findUniqueOrder(insertWordIndex, wordCount);
                insertWordIndex[i] = index;
            }
            else {
                insertWordIndex[i] = index;
            }
        }
    }

    for (let i = 0; i < wordCount; i++) {
        let fillerWord = getRandomArrayElement(fillers) + ", ";
        // If the current index is in the insert word index array, add the word
        if (insertWordIndex.includes(i)) {
            sentence += fillerWord + words[i] + " ";
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
 * @return {String} The modified phrase with added tags
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

/**
 * This recursive function finds 
 * @param {Array} orderArray 
 * @param {Int} wordCount 
 */
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
 * @return {String} The phrase with spaces between each letter
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
 * This function chooses a random element from an array
 * @param {any array} e, an array with elements
 * @return {any} a random element from the array
 */
function getRandomArrayElement(e) {
    let i = Math.floor(Math.random() * e.length);
    return e[i];
}
 
/**
 * This function generates a random Pitch and returns it
 * with the prosody tag
 * @param {int} min, the minimum value
 * @param {int} max, the maximum value
 * @param {Bool} negative, if the pitch should be negative or positive
 * @return {String} A randomized pitch value with a tag
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
 * @return {String} A tag with an added value
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
 * @return {String} A tag with an added value
 */
function setRate(percent) {
    return "<prosody rate='" + percent + "%'>";
}
	
