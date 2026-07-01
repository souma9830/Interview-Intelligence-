
const { getStorageAdapter } = require('../repositories/storageAdapter');

exports.fetchQuestionSets = async (userId) => {
  return [
    { id: '1', title: 'React Hooks Deep Dive', questionsCount: 5 },
    { id: '2', title: 'System Design Scaling', questionsCount: 8 }
  ];
};
      