console.log("Chat Bot Java Script");

const Chatbot = {
  defaultResponses: {
    'hello hi': `Hello! How can I help you?`,
    'hi': `Hi! How can I help you?`,
    'how are you': `I'm doing great! How can I help you?`,

    'flip a coin': function () {
      return Math.random() < 0.5
        ? 'Sure! You got heads'
        : 'Sure! You got tails';
    },

    'roll a dice': function () {
      const diceResult = Math.floor(Math.random() * 6) + 1;
      return `Sure! You got ${diceResult}`;
    },

    'what is the date today': function () {
      const now = new Date();
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `Today is ${months[now.getMonth()]} ${now.getDate()}`;
    },

    'thank': 'No problem! Let me know if you need help with anything else!',
  },

  additionalResponses: {},

  unsuccessfulResponse:
    `Sorry, I didn't quite understand that. Currently, I only know how to flip a coin, roll a dice, or get today's date. Let me know how I can help!`,

  emptyMessageResponse:
    `Sorry, it looks like your message is empty. Please make sure you send a message and I will give you a response.`,

  addResponses: function (additionalResponses) {
    this.additionalResponses = {
      ...this.additionalResponses,
      ...additionalResponses
    };
  },

  getResponse: function (message) {
    if (!message || !message.trim()) {
      return this.emptyMessageResponse;
    }

    // ✅ Normalize input (KEY FIX)
    message = message
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim();

    const responses = {
      ...this.defaultResponses,
      ...this.additionalResponses,
    };

    const { ratings, bestMatchIndex } =
      this.stringSimilarity(message, Object.keys(responses));

    const bestResponseRating = ratings[bestMatchIndex].rating;
    if (bestResponseRating <= 0.3) {
      return this.unsuccessfulResponse;
    }

    const bestResponseKey = ratings[bestMatchIndex].target;
    const response = responses[bestResponseKey];

    return typeof response === 'function' ? response() : response;
  },

  getResponseAsync: function (message) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.getResponse(message));
      }, 1000);
    });
  },

  compareTwoStrings: function (first, second) {
    // ✅ Normalize both strings (KEY FIX)
    first = first.toLowerCase().replace(/\s+/g, '');
    second = second.toLowerCase().replace(/\s+/g, '');

    if (first === second) return 1;
    if (first.length < 2 || second.length < 2) return 0;

    const firstBigrams = new Map();

    for (let i = 0; i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      firstBigrams.set(bigram, (firstBigrams.get(bigram) || 0) + 1);
    }

    let intersectionSize = 0;

    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.get(bigram) || 0;

      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }

    return (2 * intersectionSize) / (first.length + second.length - 2);
  },

  stringSimilarity: function (mainString, targetStrings) {
    const ratings = [];
    let bestMatchIndex = 0;

    for (let i = 0; i < targetStrings.length; i++) {
      const rating = this.compareTwoStrings(mainString, targetStrings[i]);
      ratings.push({ target: targetStrings[i], rating });

      if (rating > ratings[bestMatchIndex].rating) {
        bestMatchIndex = i;
      }
    }

    return { ratings, bestMatchIndex };
  },
};

// UUID polyfill
function uuidPolyfill() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
    const random = Math.random() * 16 | 0;
    const value = char === 'x' ? random : (random & 0x3 | 0x8);
    return value.toString(16);
  });
}

// UMD wrapper
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    if (!root.crypto) root.crypto = {};
    if (!root.crypto.randomUUID) root.crypto.randomUUID = uuidPolyfill;
    root.Chatbot = factory();
    root.chatbot = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return Chatbot;
}));
