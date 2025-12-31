const logger = require('../utils/logger');

class GooeyService {
  constructor() {
    this.apiKey = process.env.GOOEY_API_KEY;
    this.baseUrl = "https://api.gooey.ai/v2/DeforumSD/";
  }

  async generateVideo(userPrompt) {
    const payload = {
      "animation_prompts": [
        {
          "frame": 1,
          "prompt": userPrompt
        }
      ]
    };

    try {
      const response = await fetch(`${this.baseUrl}?run_id=6gnu2gz9&uid=en5uGuoba4d7an6GL6bbQSmvLuk1`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Gooey API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result || !result.output || !result.output.output_video) {
        throw new Error('Invalid API response structure');
      }

      return {
        videoUrl: result.output.output_video,
        id: result.id,
        createdAt: result.created_at
      };
    } catch (error) {
      logger.error('Gooey API error:', error);
      throw error;
    }
  }
}

module.exports = new GooeyService();
