const modes = [
    "fast",
    "slow",
    "high",
    "low",
    "backwards",
    "reverse",
    "whisper",
    "beep",
    "spell",
    "spell random",
    "robot",
    "drunk",
    "valley girl",
    "random",
    "default"
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

function getRandomVoiceMode() {
    let i = Math.floor(Math.random() * modes.length);
    return modes[i];
}

module.exports = {
    getRandomVoiceMode,
    modes,
    fillerWords,
    valleyFillerWords
};