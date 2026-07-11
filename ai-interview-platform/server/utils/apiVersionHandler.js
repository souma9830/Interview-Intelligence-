class ApiVersionHandler {
  static isDeprecated(version) {
    const v = parseFloat(version);
    return v < 2.0;
  }

  static getSunsetDate(version) {
    if (this.isDeprecated(version)) return '2026-12-31';
    return null;
  }

  static getMigrationGuide(version) {
    if (version === '1.0') {
      return {
        breaking: ['Response format changed in v2.0'],
        new: ['Pagination via Link header', 'Rate limit in response headers'],
        changelog: 'https://api.camsense.ai/changelog',
      };
    }
    return null;
  }

  static wrapResponse(version, data) {
    if (parseFloat(version) >= 2.0) {
      return {
        success: true,
        version,
        data,
        meta: {
          generatedAt: new Date().toISOString(),
        },
      };
    }
    return data;
  }
}

module.exports = ApiVersionHandler;
