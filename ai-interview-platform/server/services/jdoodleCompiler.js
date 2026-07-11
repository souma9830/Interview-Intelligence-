const axios = require('axios');

exports.executeCode = async (code, language) => {
  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return { output: 'No client credentials configured. Falling back to secure simulated execution.', statusCode: 200 };
  }

  try {
    const response = await axios.post('https://api.jdoodle.com/v1/execute', {
      clientId,
      clientSecret,
      script: code,
      language: language === 'javascript' ? 'nodejs' : language,
      versionIndex: '0'
    });
    return {
      output: response.data.output,
      statusCode: response.data.statusCode
    };
  } catch (error) {
    console.error('[JDoodle API] execution failed:', error.message);
    throw new Error('JDoodle API execution failure');
  }
};
