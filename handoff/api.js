const MODEL_FAST = 'claude-sonnet-4-6';   // hard cascades, structured JSON, speed matters
const MODEL_RICH = 'claude-opus-4-6';    // soft cascades, contextual reasoning, quality matters
const MAX_TOKENS = 1000;
const ENDPOINT = 'https://spring-rain-0f72.sstnicolaas.workers.dev';

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

// Strips markdown fences and attempts JSON.parse.
// If the response was truncated (max_tokens hit mid-JSON), attempts to
// salvage a partial object by closing open structures — better than crashing.
function safeParseJSON(raw) {
  const clean = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch {
    // Truncated — try to close open JSON structures and re-parse
    let patched = clean;
    // Count open braces/brackets and close them
    const opens  = (patched.match(/\{/g) || []).length;
    const closes = (patched.match(/\}/g) || []).length;
    const arrOpens  = (patched.match(/\[/g) || []).length;
    const arrCloses = (patched.match(/\]/g) || []).length;
    // Remove trailing incomplete value (comma or partial string)
    patched = patched.replace(/,\s*$/, '').replace(/:\s*"[^"]*$/, ': null');
    for (let i = 0; i < arrOpens - arrCloses; i++) patched += ']';
    for (let i = 0; i < opens - closes; i++) patched += '}';
    try {
      return JSON.parse(patched);
    } catch {
      // Salvage failed — return empty object, cascade renders error state
      return {};
    }
  }
}

export const api = {
  async send({ system, messages, maxTokens = MAX_TOKENS, model = MODEL_FAST }) {
    const body = {
      model,
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
  // getMissionTiles — RETIRED (Session 11)
  // Mission tiles are now locked in worlds.json. AI generation removed
  // because the app had insufficient data at onboarding to personalise.
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // getTeamReflection — called by team.js after emotionally weighted answers
  // Returns a single sentence — warm, quiet, never a question
  // partnerPronoun: 'she' | 'he' | 'they' — used so the AI never assumes
  // ---------------------------------------------------------------------------

  // ---------------------------------------------------------------------------
  // CASCADE AI CONTRACTS
  // Hard cascade methods. Each returns structured JSON only — no preamble,
  // no explanation, no prose. The AI is a database, not a performer.
  // ---------------------------------------------------------------------------

  async getRegistrationCascade({ route, province, vehicle_name, vehicle_year }) {
    const system = `You are a data retrieval service for a personal life app.
Return ONLY valid JSON. No preamble, no explanation, no markdown fences.
You have accurate, jurisdiction-specific knowledge of vehicle registration
and insurance requirements across Canadian provinces and US states.
BC: registration and basic insurance are combined through ICBC Autoplan only.
AB: standard registration through registry agents, private insurance market.
Never fabricate addresses or phone numbers — use null if unknown.`;

    const messages = [{
      role: 'user',
      content: `Vehicle: ${vehicle_name || 'unknown'}${vehicle_year ? `, ${vehicle_year}` : ''}.
Province/state: ${province}.
Route selected: ${route}.

Return JSON with these fields (use null for unknown values):
{
  "what_you_need": ["string"],
  "what_to_bring": ["string"],
  "estimated_cost": "string",
  "time_estimate": "string",
  "eligibility_note": "string or null",
  "office_name": "string or null",
  "office_address": "string or null",
  "office_hours": "string or null",
  "mail_address": "string or null",
  "mail_include": ["string"] or null,
  "processing_time": "string or null",
  "portal_url": "string or null",
  "instructions": "string or null"
}`,
    }];

    const raw  = await this.send({ system, messages, maxTokens: 800, model: MODEL_FAST });
    return safeParseJSON(raw);
  },

  async getServiceCascade({ route, vehicle_year, vehicle_make, vehicle_model, service_type, preferred_shop }) {
    const system = `You are a data retrieval service for a personal life app.
Return ONLY valid JSON. No preamble, no explanation, no markdown fences.
You have accurate knowledge of vehicle service specifications including
oil types, volumes, filter part numbers, torque specs, and maintenance
light reset procedures for specific vehicles.
Never fabricate dealer addresses, phone numbers, or shop details — use null.
For part numbers, provide OEM part numbers where known.`;

    const vehicleDesc = [vehicle_year, vehicle_make, vehicle_model].filter(Boolean).join(' ') || 'unknown vehicle';
    const serviceDesc = service_type === 'oil_change' ? 'oil and filter change' : service_type?.replace(/_/g, ' ') || 'service';

    const messages = [{
      role: 'user',
      content: `Vehicle: ${vehicleDesc}.
Service type: ${serviceDesc}.
Route selected: ${route}.
Preferred shop on file: ${preferred_shop || 'none'}.

Return JSON with these fields (use null for unknown values):
{
  "oil_volume_litres": number or null,
  "oil_spec": "string or null",
  "filter_part_oem": "string or null",
  "filter_part_aftermarket": "string or null",
  "drain_plug_washer": "string or null",
  "tools": ["string"] or null,
  "torque_spec": "string or null",
  "maintenance_light_reset": "string or null",
  "disposal_search_query": "string",
  "service_type_label": "string",
  "dealer_name": "string or null",
  "dealer_address": "string or null",
  "dealer_phone": "string or null",
  "dealer_hours": "string or null",
  "booking_url": "string or null",
  "shop_name": "string or null",
  "shop_address": "string or null",
  "shop_phone": "string or null",
  "shop_hours": "string or null"
}`,
    }];

    const raw   = await this.send({ system, messages, maxTokens: 700, model: MODEL_FAST });
    return safeParseJSON(raw);
  },

  async getMedicalCascade({ route, appointment_type, provider_name, provider_phone, provider_url, province }) {
    const system = `You are a data retrieval service for a personal life app.
Return ONLY valid JSON. No preamble, no explanation, no markdown fences.
You have knowledge of healthcare booking systems and clinic finding in Canada and the US.
Never fabricate specific clinic names, addresses, or phone numbers — use null and provide a search query instead.
Provide accurate what_to_mention guidance based on appointment type.`;

    const apptDesc = appointment_type?.replace(/_/g, ' ') || 'general appointment';

    const messages = [{
      role: 'user',
      content: `Appointment type: ${apptDesc}.
Province: ${province || 'unknown'}.
Route: ${route}.
Provider name on file: ${provider_name || 'none'}.
Provider phone on file: ${provider_phone || 'none'}.
Provider booking URL on file: ${provider_url || 'none'}.

Return JSON with these fields (use null for unknown values):
{
  "provider_name": "string or null",
  "provider_address": "string or null",
  "provider_hours": "string or null",
  "provider_phone": "string or null",
  "booking_url": "string or null",
  "what_to_mention": "string",
  "last_visit_label": "string or null",
  "clinic_name": "string or null",
  "clinic_address": "string or null",
  "clinic_hours": "string or null",
  "clinic_phone": "string or null",
  "accepting_note": "string or null",
  "search_query": "string",
  "search_note": "string or null"
}`,
    }];

    const raw   = await this.send({ system, messages, maxTokens: 600, model: MODEL_FAST });
    return safeParseJSON(raw);
  },

  async getTeamReflection({ type, partnerName, partnerPronoun, tenure, state, works,
    profession, birthday, love_language }) {

    const contextParts = [];
    if (partnerName)    contextParts.push(`Partner's name: ${partnerName}`);
    if (partnerPronoun) {
      const objective  = partnerPronoun === 'she' ? 'her' : partnerPronoun === 'he' ? 'him' : 'them';
      const possessive = partnerPronoun === 'she' ? 'her' : partnerPronoun === 'he' ? 'his' : 'their';
      contextParts.push(`Partner's pronouns: ${partnerPronoun}/${objective}/${possessive}`);
    }
    if (tenure)         contextParts.push(`Together: ${tenure}`);
    if (state)          contextParts.push(`Relationship state: ${state}`);
    if (works)          contextParts.push(`Partner works: ${works}`);
    if (profession)     contextParts.push(`Profession: ${profession}`);
    if (birthday)       contextParts.push(`Birthday: ${birthday}`);
    if (love_language)  contextParts.push(`Love language: ${love_language}`);

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
Use the partner's correct pronouns as provided in context. Never assume gender.
No preamble. No explanation. The sentence only.`;

    const messages = [{
      role: 'user',
      content: `Context: ${contextParts.join('. ')}.
Moment: ${typeInstructions[type] || 'The user shared something about their team.'}
Respond with one quiet, warm sentence acknowledging this.`,
    }];

    const raw = await this.send({ system, messages, maxTokens: 60, model: MODEL_RICH });
    return raw.trim();
  },
};
