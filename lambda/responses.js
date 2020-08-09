// Note: For each response, end it with a punctuation and a space after it
// so that Alexa creates a pause before the next sentence.

const VoiceModes = require('./voice_modes.js');
const Voices = require('./voices.js');

const initialPrompt = [
    "Okay, let's hear it. ",
    "Go ahead. ",
    "Okay. ",
    "Go for it. ",
    "Tell me what to say. ",
    "Ready when you are. ",
    "I'm all ears. ",
    "What would you like me to say? ",
    "What's your phrase? ",
    "I'm ready. ",
    "I'm listening. ",
    "Tell me your phrase. ",
    "You may begin. ",
    "Ready! "
];

const endPrompt = [
    "What would you like to do next? ",
    "What else would you like to do? ",
    "What's next? ",
    "What's your next request? "
];

const fallback = [
    "I didn't understand what you were trying to say. ",
    "I didn't quite get that. ",
    "I might not have heard that correctly. ",
    "I didn't get that. ",
    "I'm not sure I can do something like that. ",
    "I'm not sure of what you wanted me to do. ",
    "I don't think I know that one. "
];

const helpPhrases = [
    "Say help, to learn more about what this skill can do. ",
    "If you say help, I can tell you what I can do. ",
    "Try saying, repeat after me, if you'd like me to repeat a phrase. ",
    "Say help, to learn what this skill can do. ",
    "You can say something like, say it again, to hear your phrase again. ",
    `You can try something like, change accent to, ${Voices.getRandomVoice().description}. `,
    `You can try something like, say it again, ${VoiceModes.getRandomVoiceMode()}. `,
    "You can same something like, turn comments off. ",
    "You can say something like, turn hints off. ",
    "To hear a list of accents, say, list accents. ",
    "To hear a list of voice modes, say, list voice modes. ",
    "You can say something like, list accents. ",
    "You can say something like, list voice modes. ",
    "For help, say help. "
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

const hints = [
    `To change my accent, say something like, change accent to, ${Voices.getRandomVoice().description}. `,
    `To say this phrase with a different voice mode, say something like, say it again, ${VoiceModes.getRandomVoiceMode()}. `,
    `To say the phrase again, say, say it <break time='.001s'/> again. `,
    `To tell me another phrase, say, repeat after me. `,
    "For a list of voice modes, say, list voice modes. ",
    "For a list of accents I can speak with, say, list accents. ",
    "If you'd like me to say something else, say, repeat after me. "
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
];

/**
 * Returns a random responses from given arrays
 * 
 */
function getRandomInitialPrompt() {
    return getRandomResponse(initialPrompt);
}
function getRandomHint() {
    return getRandomResponse(hints);
}
function getRandomPreResponse() {
    return getRandomResponse(preResponse);
}
function getRandomPreResponse2() {
    return getRandomResponse(preResponse2);
}
function getRandomExitResponse() {
    return getRandomResponse(exitResponses);
}
function getRandomExitResponse2() {
    return getRandomResponse(exitResponses2);
}
function getRandomFallback() {
    return getRandomResponse(fallback);
}
function getRandomHelpResponse() {
    return getRandomResponse(helpPhrases);
}
function getRandomFallbackResponse(){
    return getRandomFallback() + getRandomHelpResponse();
}
function getRandomEndPrompt(){
    return getRandomResponse(endPrompt);
}

// Helper function to select random response from an array
function getRandomResponse(response) {
    let i = Math.floor(Math.random() * response.length);
    return response[i];
}

module.exports = {
    getRandomInitialPrompt,
    getRandomHint,
    getRandomPreResponse,
    getRandomPreResponse2,
    getRandomExitResponse,
    getRandomExitResponse2,
    getRandomFallbackResponse,
    getRandomFallback,
    getRandomHelpResponse,
    getRandomEndPrompt
};