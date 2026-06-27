import API from '../api/apiClient';

/**
 * Upload PDF resume file statelessly.
 */
export const uploadResume = async (formData) => {
  const response = await API.post('/resume/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Compare resume against job description.
 */
export const analyzeJobDescription = async (payload) => {
  const response = await API.post('/resume/analyze-jd', payload);
  return response.data;
};

/**
 * Start a new mock interview session by posting the setup options.
 */
export const startSession = async (params) => {
  const response = await API.post('/interview/start', params);
  return response.data;
};

/**
 * Submit a candidate's answer for real-time AI evaluation.
 */
export const evaluateAnswerRealtime = async (payload) => {
  const response = await API.post('/interview/evaluate-answer', payload);
  return response.data;
};

/**
 * Submit answer and generate follow-up question.
 */
export const submitAnswerAndGenerateFollowUp = async (payload) => {
  const response = await API.post('/interview/follow-up', payload);
  return response.data;
};

/**
 * Trigger compiler analysis and AI evaluation of candidate solution code.
 */
export const evaluateSolution = async (payload) => {
  const response = await API.post('/interview/coding/eval', payload);
  return response.data;
};

/**
 * Synthesize final performance report from interview transcript.
 */
export const synthesizeReport = async (payload) => {
  const response = await API.post('/report/synthesize', payload);
  return response.data;
};
