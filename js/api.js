const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 1000;
const ENDPOINT = 'https://spring-rain-0f72.sstnicolaas.workers.dev';

export const api = {
  async send({ system, messages, maxTokens = MAX_TOKENS }) {
    const body = {
      model: MODEL,
      max_tokens: maxTokens,
      messages,
    };
    if (system) body.system = system;

    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    return data.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');
  },

  async getMissionTiles({ worldId, worldData, situationAnswer }) {
    const world = worldData.find(w => w.id === worldId);
    if (!world) throw new Error('Unknown world');

    const system = `You are the intelligence layer of Your Life: Unlocked, 
a life companion app. The user has chosen the ${world.name} world. 
Your entire response must be valid JSON — an array of 4 tile objects, 
each with an "id" (snake_case string) and a "label" (short phrase, 
max 6 words, in the natural language of the ${world.name} world). 
The tiles represent problem spaces the user might want to address. 
Include one emotionally honest option that feels natural in this world's language. 
No preamble. No explanation. JSON array only.`;

    const messages = [{
      role: 'user',
      content: `World: ${world.name}
Situation answer: ${situationAnswer}
Mission prompt: "${world.onboarding.smesc.mission.prompt}"
Generate 4 mission tiles.`,
    }];

    const raw = await this.send({ system, messages, maxTokens: 400 });

    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      throw new Error('Failed to parse mission tiles');
    }
  },
};
