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

  // ---------------------------------------------------------------------------
  // getMissionTiles — unchanged logic, proxy endpoint
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // getTeamReflection — called by team.js after emotionally weighted answers
  // Returns a single sentence — warm, quiet, never a question
  // ---------------------------------------------------------------------------

  async getTeamReflection({ type, partnerName, tenure, state, works,
    profession, birthday, love_language }) {

    const contextParts = [];
    if (partnerName)   contextParts.push(`Partner's name: ${partnerName}`);
    if (tenure)        contextParts.push(`Together: ${tenure}`);
    if (state)         contextParts.push(`Relationship state: ${state}`);
    if (works)         contextParts.push(`Partner works: ${works}`);
    if (profession)    contextParts.push(`Profession: ${profession}`);
    if (birthday)      contextParts.push(`Birthday: ${birthday}`);
    if (love_language) contextParts.push(`Love language: ${love_language}`);

    const typeInstructions = {
      state:            'The user just described the current state of their relationship.',
      profession:       'The user just shared what their partner does for work.',
      birthday:         "The user just shared their partner's birthday.",
      partner_complete: 'The user has finished sharing details about their partner.',
    };

    const system = `You are a quiet, perceptive presence inside a personal life app called Your Life / Unlocked.
The user is sharing details about the people they care about during onboarding.
Your entire response must be ONE sentence only — warm, brief, never therapeutic, never a question.
Acknowledge what was just shared as a thoughtful person would. Under 20 words.
No preamble. No explanation. The sentence only.`;

    const messages = [{
      role: 'user',
      content: `Context: ${contextParts.join('. ')}.
Moment: ${typeInstructions[type] || 'The user shared something about their team.'}
Respond with one quiet, warm sentence acknowledging this.`,
    }];

    const raw = await this.send({ system, messages, maxTokens: 60 });
    return raw.trim();
  },
};
