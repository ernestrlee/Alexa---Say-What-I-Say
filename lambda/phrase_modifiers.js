const VoiceModes = require('./voice_modes.js');
const Voices = require('./voices.js');

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
 * This function returns a speech output with a given phrase, accent and voice mode
 * @param {String} phrase 
 * @param {String} voice
 * @param {String} voiceMode
 * @returns {String} the speech output
 */
function buildSpeechOutput(phrase, voice, voiceMode) {
    let output = "";
    let isValidVoice = false;

    for(let i = 0; i < Voices.voices.length; i++){
        if(voice == Voices.voices[i].name){
            isValidVoice = true;
        }
    }

    if(voiceMode != "" || !voiceMode){
        phrase = getModifiedPhrase(phrase, voiceMode);
    }

    // If the voice is default or not known
    if(voice == "Alexa" || !isValidVoice){
        output = phrase;
    }
    else{        
        output = `<voice name='${voice}'>${phrase}</voice>`;
    }

    return output;
}

/**
 * This function returns a modified phrase by changing the phrase or adding voice tags
 * @param {String} phrase 
 * @param {String} voiceMode 
 * @returns {String} the modified phrase
 */
function getModifiedPhrase(phrase, voiceMode){
    let output = "";
    let modPhrase = "";

    switch (voiceMode) {
        case "whisper":
            output = `<amazon:effect name='whispered'>${phrase}</amazon:effect>`;
            break;
        case "slow":
            modPhrase = addPauses(phrase);
            output = `<prosody rate='80%'>${modPhrase}</prosody>`;
            break;
        case "fast":
            output = `<prosody rate='150%'>${phrase}</prosody>`;
            break;
        case "low":
            output = `<prosody pitch='-30%'>${phrase}</prosody>`;
            break;
        case "high": 
            output = `<prosody pitch='+30%'>${phrase}</prosody>`;
            break;
        case "reverse":
            modPhrase = reversePhrase(phrase);
            output = `<prosody rate='70%'>${modPhrase}</prosody>`;
            break;
        case "backwards":
            modPhrase = flipBackwards(phrase);
            output = `<prosody rate='70%'>${modPhrase}</prosody>`;
            break;
        case "drunk":
            output = `<prosody rate='40%'>${phrase}</prosody>`;
            break;
        case "beep":
            modPhrase = addBeeps(phrase);
            output = modPhrase;
            break;
        case "valley girl":
            modPhrase = addFiller(phrase, VoiceModes.valleyFillerWords);
            output = modPhrase;
                break;
        case "robot":
            modPhrase = robot(phrase);
            output = modPhrase;
            break;
        case "spell":
            modPhrase = spellOut(phrase, true);
            output = modPhrase;
            break;
        case "spell random":
            modPhrase = spellOut(phrase, false);
            output = modPhrase;
            break;
        case "default":
        case "":
        case undefined:
            output = phrase;
            break;
        default:
            output = phrase;
    }

    return output;
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
            sentence += exStart + words[i] + "abc" + exEnd + " ";
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
 * This recursive function creates a random array of ordered numbers 
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

module.exports = {
    Utils: {
        getERSlotValue,
        buildSpeechOutput,
        getModifiedPhrase,       
        addPauses,
        flipBackwards,
        reversePhrase,
        addBeeps,
        addFiller,
        robot,
        spellOut,
        getRandomArrayElement,
        getRandomPitch,
        setPitch,
        setRate
    },
  };