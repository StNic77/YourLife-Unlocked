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

  async getRegistrationCascade({ route, province, vehicle_name, vehicle_year, city, lat, lng }) {
    const system = `You are a data retrieval service for a personal life app.
Return ONLY valid JSON. No preamble, no explanation, no markdown fences.
You have accurate, jurisdiction-specific knowledge of vehicle registration
and insurance requirements across Canadian provinces and US states.
BC: registration and basic insurance are combined through ICBC Autoplan only.
AB: standard registration through registry agents, private insurance market.
For broker recommendations: return real businesses you have confident knowledge of
for the given city. If you are not confident a business exists at that address,
use null for address and phone — never fabricate specific details.
Return 2-3 brokers ordered by likelihood of being closest to the user's location.`;

    const locationContext = city ? `User location: ${city}, ${province}${lat ? ` (${lat}, ${lng})` : ''}.` : '';

    const messages = [{
      role: 'user',
      content: `Vehicle: ${vehicle_name || 'unknown'}${vehicle_year ? `, ${vehicle_year}` : ''}.
Province/state: ${province}.
Route selected: ${route}.
${locationContext}

Return JSON with these fields (use null for unknown values):
{
  "what_you_need": ["string"],
  "what_to_bring": ["string"],
  "estimated_cost": "string",
  "time_estimate": "string",
  "eligibility_note": "string or null",
  "brokers": [
    {
      "name": "string",
      "address": "string or null",
      "phone": "string or null",
      "hours": "string or null"
    }
  ],
  "maps_search_query": "string",
  "portal_url": "string or null",
  "instructions": "string or null"
}`,
    }];

    const raw  = await this.send({ system, messages, maxTokens: 900, model: MODEL_FAST });
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

  async getMedicalCascade({ route, appointment_type, provider_name, provider_phone, provider_url, province,
      age, sex, conditions, medications, screenings_due, last_seen, next_due }) {
    const system = `You are a health preparation assistant inside a personal life app.
Return ONLY valid JSON. No preamble, no explanation, no markdown fences.
You have knowledge of healthcare booking systems, preventive care guidelines, and appointment preparation in Canada and the US.
Never fabricate specific clinic names, addresses, or phone numbers — use null and provide a search query instead.
Provide accurate, age-appropriate, and personalised preparation guidance based on the patient profile provided.
Health Intelligence Boundary: surface reminders and broadly accepted general guidance only. Never give medical advice, diagnoses, or medication commentary.
Keep all text concise — displayed in a compact mobile interface.`;

    const apptDesc = appointment_type?.replace(/_/g, ' ') || 'general appointment';
    const patientProfile = [
      age  ? `Age: ${age}`  : null,
      sex  ? `Sex assigned at birth: ${sex}` : null,
      conditions?.length  ? `Conditions on file: ${conditions.join(', ')}` : null,
      medications?.length ? `Medications on file: ${medications.length} (names withheld)` : null,
      screenings_due?.length ? `Screenings due or overdue: ${screenings_due.join(', ')}` : null,
      last_seen ? `Last appointment: ${last_seen}` : null,
      next_due  ? `Next due: ${next_due}` : null,
    ].filter(Boolean).join('\n');

    const messages = [{
      role: 'user',
      content: `Appointment type: ${apptDesc}.
Province/region: ${province || 'unknown'}.
Route: ${route}.
Provider name on file: ${provider_name || 'none'}.
Provider phone on file: ${provider_phone || 'none'}.
Provider booking URL on file: ${provider_url || 'none'}.

Patient profile:
${patientProfile || 'No profile data available.'}

Return JSON (use null for unknown):
{
  "provider_name": "string or null",
  "provider_address": "string or null",
  "provider_hours": "string or null",
  "provider_phone": "string or null",
  "booking_url": "string or null",
  "what_to_bring": ["string — practical items to bring"],
  "what_to_mention": "string — personalised to this patient's profile and appointment type",
  "questions_to_ask": ["string — 3 to 5 questions appropriate for this appointment and patient profile"],
  "screenings_to_request": ["string — age/sex appropriate screenings to ask about at this visit, if any"],
  "prep_notes": "string or null — specific preparation required (fasting, stopping medications, etc.)",
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

    const raw = await this.send({ system, messages, maxTokens: 900, model: MODEL_RICH });
    return safeParseJSON(raw);
  },

  // ---------------------------------------------------------------------------
  // reverseGeocode — converts lat/lng to city, province, country
  // Used after geolocation succeeds to name the user's position.
  // Returns { city, province_code, province_name, country_code, valid }
  // ---------------------------------------------------------------------------

  async reverseGeocode({ lat, lng }) {
    const system = `You are a location resolver for a personal life app.
Return ONLY valid JSON. No preamble, no explanation, no markdown fences.
Given a latitude and longitude, return the city, province/state, and country.
For Canada use 2-letter province codes (BC, AB, ON, etc.).
For United States use 2-letter state codes (CA, TX, NY, etc.).
For United Kingdom use ENG, SCO, WAL, NIR.
country_code should be CA, US, UK, or the ISO 2-letter code.
Be as accurate as possible. If you cannot resolve, set valid to false.`;

    const messages = [{
      role: 'user',
      content: `Latitude: ${lat}, Longitude: ${lng}.
Return JSON: { "city": "string", "province_code": "string", "province_name": "string", "country_code": "string", "valid": boolean }`,
    }];

    const raw = await this.send({ system, messages, maxTokens: 120, model: MODEL_FAST });
    return safeParseJSON(raw);
  },

  // ---------------------------------------------------------------------------
  // resolveProvince — called during onboarding province step
  // Accepts free text (abbreviation, full name, partial, misspelled).
  // Returns { code, name, valid }
  // country: 'CA' | 'US' | 'UK' | 'other'
  // ---------------------------------------------------------------------------

  async resolveProvince({ input, country }) {
    const system = `You are a location resolver for a personal life app.
Return ONLY valid JSON. No preamble, no explanation, no markdown fences.
The user has entered a province, state, or region abbreviation or name.
Resolve it to the canonical abbreviation and full name for the given country.
For Canada: use standard 2-letter province/territory codes (BC, AB, ON, QC, MB, SK, NS, NB, PE, NL, NT, YT, NU).
For United States: use standard 2-letter state codes (CA, TX, NY, FL, etc.).
For United Kingdom: use ENG, SCO, WAL, NIR for England, Scotland, Wales, Northern Ireland.
For other countries: do your best to resolve to a standard regional abbreviation.
Be generous — resolve common misspellings, full names, and partial inputs.
If the input is empty or completely unresolvable, set valid to false.`;

    const messages = [{
      role: 'user',
      content: `Country: ${country}. User input: "${input}".
Return JSON: { "code": "string", "name": "string", "valid": boolean }`,
    }];

    const raw = await this.send({ system, messages, maxTokens: 80, model: MODEL_FAST });
    return safeParseJSON(raw);
  },

  // ---------------------------------------------------------------------------
  // resolveCity — called during location correction flow
  // User types a city name (free text, partial, casual).
  // Returns { city, province_code, province_name, country_code, lat, lng, valid }
  // country hint passed in from store if known — narrows resolution.
  // ---------------------------------------------------------------------------

  async resolveCity({ input, country }) {
    const system = `You are a location resolver for a personal life app.
Return ONLY valid JSON. No preamble, no explanation, no markdown fences.
The user has typed a city name — it may be partial, casual, or include a province hint.
Resolve it to a canonical city name, province/state, country, and approximate coordinates.
For Canada use 2-letter province codes (BC, AB, ON, etc.).
For United States use 2-letter state codes (CA, TX, NY, etc.).
For United Kingdom use ENG, SCO, WAL, NIR.
country_code should be CA, US, UK, or the ISO 2-letter code.
Be generous — "courtenay", "courtenay bc", "Courtenay British Columbia" all resolve to the same place.
lat and lng should be the approximate centre of the city (not the user's exact position).
If the input is empty or unresolvable, set valid to false.`;

    const countryHint = country ? `Country hint: ${country}.` : '';

    const messages = [{
      role: 'user',
      content: `${countryHint} User input: "${input}".
Return JSON: { "city": "string", "province_code": "string", "province_name": "string", "country_code": "string", "lat": number, "lng": number, "valid": boolean }`,
    }];

    const raw = await this.send({ system, messages, maxTokens: 120, model: MODEL_FAST });
    return safeParseJSON(raw);
  },

  // ---------------------------------------------------------------------------
  // getVehicleSchedule — called during vehicle intake after mileage is entered
  // Returns maintenance schedule, next oil change window, and upcoming items
  // for the given vehicle at current mileage.
  // AI contract: structured JSON only — no preamble, no explanation.
  // ---------------------------------------------------------------------------

  async getVehicleSchedule({ year, make, model, variant, vin, transmission, mileage, last_oil_date, last_oil_mileage, interval_km, service_history }) {
    const system = `You are a vehicle maintenance data service for a personal life app.
Return ONLY valid JSON. No preamble, no explanation, no markdown fences.

ACCURACY RULES:
1. Return your best confirmed knowledge for this exact vehicle. Be specific.
2. If a VIN is provided, use it as the primary identifier to confirm engine and trim.
3. If the user has specified a transmission type, that is authoritative — use it to constrain all transmission-related output including type, fluid spec, service intervals, and upcoming items. Do not infer or override the transmission type from the VIN or model defaults.
4. For vehicle_facts: return null only if you have conflicting information or genuinely no data. Do not return null merely because you are uncertain — return your best knowledge and note uncertainty in the notes field.
5. If service history is provided, use it to inform upcoming_items and notes. Custom repairs and modifications are relevant context.
6. Distances in km for Canadian users.
7. BELT ACCURACY — CRITICAL: Many engines have more than one accessory drive belt. You must identify and list every belt individually. The Mazda SKYACTIV-G engine (used in 2012–2018 Mazda3, CX-5, and others) has TWO belts: a serpentine belt driving the alternator and power steering pump, and a separate short belt driving only the AC compressor. These share a common pulley but are distinct parts replaced separately or together. Never collapse multiple belts into a single entry. If an engine has 2 belts, list 2 belts with individual names, part contexts, and intervals.`;

    const vehicleDesc = [year, make, model, variant].filter(Boolean).join(' ') || 'unknown vehicle';
    const today = new Date().toISOString().split('T')[0];
    const transNote = transmission ? `\nTransmission: ${transmission} — this is authoritative. Use it to constrain all transmission-related output including type, fluid spec, service intervals, and upcoming items. Do not infer or override the transmission type from the VIN or model defaults.` : '';

    let historyNote = '';
    if (service_history?.length) {
      const items = service_history.map(h => {
        const parts = [h.label || h.type];
        if (h.date) parts.push(`(${h.date})`);
        if (h.mileage) parts.push(`at ${h.mileage} km`);
        if (h.notes) parts.push(`— ${h.notes}`);
        return parts.join(' ');
      });
      historyNote = `\nKnown service history:\n${items.map(i => `- ${i}`).join('\n')}`;
    }

    const messages = [{
      role: 'user',
      content: `Vehicle: ${vehicleDesc}.${vin ? `\nVIN: ${vin}` : ''}${transNote}
Today's date: ${today}.
Current mileage: ${mileage} km.
Last oil change: ${last_oil_date || 'unknown'} at ${last_oil_mileage || 'unknown'} km.
Preferred oil change interval: ${interval_km || 8000} km.${historyNote}
If driving history is insufficient to estimate a date, assume 1,500 km/month. Calculate next_oil_change_date forward from today's date. Never return a date in the past. Never return null for next_oil_change_date if next_oil_change_km is known.

Return JSON with these fields (use null only where genuinely unknown):
{
  "next_oil_change_km": number,
  "next_oil_change_date": "Month YYYY",
  "oil_spec": "string — exact OEM grade e.g. 0W-20 full synthetic",
  "upcoming_items": [
    { "id": "string", "label": "string", "due_km": number, "urgency": "now|soon|watch" }
  ],
  "notes": "string or null — confirmed known issues or TSBs for this exact year and engine. Reference service history where relevant.",
  "vehicle_facts": {
    "timing_system": "string — confirm chain or belt. If belt include OEM replacement interval in km.",
    "serpentine_belt": "string — REQUIRED: identify every accessory drive belt on this specific engine individually. Many engines have 2 or more belts. List each belt by name (e.g. serpentine belt, AC compressor belt, power steering belt) with its OEM replacement interval. If this engine has 2 belts, your answer must name both. Never say '1 single belt drives all accessories' if that is not confirmed for this exact engine. Example for SKYACTIV-G: '2 belts — serpentine belt (alternator + power steering, ~100,000 km), AC compressor belt (separate short belt, ~100,000 km) — typically replaced together but are distinct parts'.",
    "spark_plugs": "string — exact plug type, electrode gap in mm, OEM replacement interval.",
    "transmission_fluid": "string — exact fluid spec and OEM change interval based on the user-specified transmission type. If manual: correct gear oil spec not ATF. If modified: fluid appropriate for the specified configuration.",
    "transmission_type": "string — use the user-provided transmission type as authoritative. Include specific type e.g. '6-speed manual' or '8-speed automatic'.",
    "coolant": "string — exact coolant type (OAT, HOAT, IAT) and OEM flush interval.",
    "notes": "string or null — confirmed TSBs or known issues for this exact engine and model year."
  }
}`,
    }];

    const raw = await this.send({ system, messages, maxTokens: 1200, model: MODEL_RICH });
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

  // ---------------------------------------------------------------------------
  // getPhysicalAdvice — personalised training or nutrition guidance
  // Route: 'training' | 'nutrition'
  // Calibrated to the user's activity level, goals, and any limitations.
  // Health Intelligence Boundary: broadly accepted general guidance only.
  // ---------------------------------------------------------------------------

  async getPhysicalAdvice({ route, activity_level, goals, limitations, workout_note }) {
    const system = `You are a fitness and nutrition guidance assistant inside a personal life app.
Return ONLY valid JSON. No preamble, no explanation, no markdown fences.
Provide practical, evidence-based guidance calibrated to the user's profile.
Health Intelligence Boundary: broadly accepted general guidance only. Never diagnose, prescribe, or give clinical advice.
Keep all text concise — this is displayed in a compact mobile interface. One to two sentences per field maximum.`;

    const profileParts = [
      activity_level ? `Activity level: ${activity_level.replace(/_/g, ' ')}` : null,
      goals?.length  ? `Goals: ${goals.join(', ')}` : null,
      limitations?.length ? `Limitations: ${limitations.join(', ')}` : null,
      workout_note   ? `Note: ${workout_note}` : null,
    ].filter(Boolean).join('\n');

    const trainingSchema = `{
  "summary": "string — one sentence calibrating to their current level",
  "weekly_structure": "string — how many days and what split makes sense",
  "recommended_types": ["string — 2 to 4 specific activity types suited to their goals"],
  "intensity_guidance": "string — appropriate intensity for their level",
  "limitations_note": "string or null — how to work around their limitations if any",
  "progression_tip": "string — one practical next step to improve"
}`;

    const nutritionSchema = `{
  "summary": "string — one sentence on their current picture",
  "eating_pattern": "string — broad pattern that suits their goals and activity level",
  "goal_alignment": ["string — 2 to 3 specific nutrition priorities for their goals"],
  "foods_to_prioritise": ["string — 3 to 5 practical foods or food groups"],
  "timing_note": "string or null — pre/post workout fuelling if relevant",
  "limitations_note": "string or null — nutrition considerations for their limitations if any"
}`;

    const messages = [{
      role: 'user',
      content: `Route: ${route}.
User profile:
${profileParts || 'No profile data.'}

Return JSON matching this schema:
${route === 'training' ? trainingSchema : nutritionSchema}`,
    }];

    const raw = await this.send({ system, messages, maxTokens: 600, model: MODEL_RICH });
    return safeParseJSON(raw);
  },

  // ---------------------------------------------------------------------------
  // getWellbeingSessionPrep — therapy/counselling session preparation
  // Returns themes to raise, questions to consider, what to bring.
  // Health Intelligence Boundary: never clinical, never diagnostic.
  // ---------------------------------------------------------------------------

  async getWellbeingSessionPrep({ provider_name, provider_type, last_seen, current_state }) {
    const system = `You are a session preparation assistant inside a personal life app.
Return ONLY valid JSON. No preamble, no explanation, no markdown fences.
Help the user prepare for a therapy or counselling session with practical, thoughtful prompts.
Health Intelligence Boundary: never diagnose, never clinical. Supportive and practical only.
Keep all text concise — displayed in a compact mobile interface.`;

    const profileParts = [
      provider_type  ? `Provider type: ${provider_type.replace(/_/g, ' ')}` : null,
      last_seen      ? `Last session: ${last_seen}` : null,
      current_state  ? `Current state: ${current_state.replace(/_/g, ' ')}` : null,
    ].filter(Boolean).join('\n');

    const messages = [{
      role: 'user',
      content: `Provider: ${provider_name || provider_type || 'therapist'}.
${profileParts}

Return JSON:
{
  "what_to_bring": ["string — 1 to 3 practical items if relevant, e.g. journal, notes"],
  "themes_to_raise": ["string — 2 to 4 themes worth raising based on context"],
  "questions_to_consider": ["string — 3 questions to sit with before the session"],
  "between_sessions_note": "string or null — one practical thing to do between sessions"
}`,
    }];

    const raw = await this.send({ system, messages, maxTokens: 500, model: MODEL_RICH });
    return safeParseJSON(raw);
  },

  // ---------------------------------------------------------------------------
  // getReflectingPoolResponse — soft cascade for the reflecting pool domain
  //
  // The reflecting pool is a guided conversation. The AI is a space, not a
  // performer. It receives what the user gives, reads for weight, asks the one
  // question earned by what was just said.
  //
  // Returns:
  //   { response: string, close_session: boolean, floor_triggered: boolean }
  //
  // Parameters:
  //   messages      — full exchange history (role/content pairs)
  //   shapeContext  — lightweight SHAPE handoff string
  //   world         — user's current world (tone calibration)
  //   exchangeCount — number of AI responses sent so far this session
  // ---------------------------------------------------------------------------

  async getReflectingPoolResponse({ messages, shapeContext, world, exchangeCount }) {
    const worldToneMap = {
      operator: 'Direct, unhurried, grounded. No warmth performance. Receives without managing.',
      range:    'Steady, practical, calm. Field-tested patience. No rush.',
      garden:   'Gentle, attentive, unhurried. Spacious. Lets things breathe.',
      journey:  'Open, curious, present. Meets the person wherever they are.',
      playbook: 'Clear, focused, purposeful. No unnecessary words.',
      summit:   'Measured, honest, present. Respects the difficulty.',
      practice: 'Quiet, steady, non-judgmental. Receives without agenda.',
      meadow:   'Warm, unhurried, gentle. A soft place to land.',
    };

    const tone = worldToneMap[world] || worldToneMap.operator;
    const turnCount = messages.filter(m => m.role === 'assistant').length;

    const system = `You are the reflecting pool inside a personal life app called Your Life / Unlocked.

Your role in this space: receptive, not characterful. You are a room, not a voice. The user speaks. You listen. You respond once — with one question, or with a quiet close when the session has done its work.

TONE FOR THIS USER: ${tone}

WHAT YOU KNOW WALKING IN (SHAPE context — do not surface this directly):
${shapeContext || 'No SHAPE context available this session.'}

THE RULES YOU NEVER BREAK:
1. One question per response. Never two. Never zero (unless closing).
2. The question is earned by what was just said — not by what you want to know.
3. Read for weight. The significant detail is often the aside, the clause after the comma. Return to it.
4. Never lead. Follow where the user goes. If they approach the real thing sideways, go sideways with them.
5. Never elaborate after asking. Ask. Stop.
6. Do not perform warmth. Do not reassure. Do not manage. Receive.
7. The intelligence requirement is internal. The user never feels a hand on the wheel.

WHEN TO CLOSE:
- The thing got named. There is a natural resting point.
- The user signals done (short final message, thanks, sign-off).
- The exchange has reached depth and adding more would extract rather than tend.
- You have responded ${Math.max(4, 6 - exchangeCount)} or more times and a natural resting point exists.
When closing: one warm sentence, no summary, no homework. A quiet landing.
NEVER say "I'll pass this along", "I'll note that", "this will be reflected", or imply the app will act on what was said. The pool receives. It does not promise. What the user puts here shapes the intelligence over time — but that happens invisibly, not through explicit confirmation.

THE FLOOR:
If the user discloses suicidal ideation, intent to harm others, or active criminal activity:
- Stop collecting immediately.
- Respond with genuine care, no alarm.
- Name what you heard briefly and directly.
- Point toward appropriate support: crisis line, trusted person, emergency services if urgent.
- Set floor_triggered: true.
Crisis resources (Canada): Crisis Services Canada 1-833-456-4566. Text 45645. Kids Help Phone 1-800-668-6868.
Crisis resources (US): 988 Suicide and Crisis Lifeline — call or text 988.

RESPONSE FORMAT:
Return ONLY valid JSON. No preamble, no markdown fences.
{
  "response": "your response here — the question, or the close, or the floor redirect",
  "close_session": false,
  "floor_triggered": false
}

RESPONSE LENGTH:
- Normal exchange: 1–3 sentences max, then the question. The question is the last thing.
- Close: 1 sentence. Warm. No summary.
- Floor: 2–3 sentences. Clear. Caring. Immediate.`;

    const raw = await this.send({ system, messages, maxTokens: 300, model: MODEL_RICH });

    const clean = raw.replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(clean);
    } catch {
      return {
        response: raw.trim() || 'I\'m here.',
        close_session: false,
        floor_triggered: false,
      };
    }
  },
};
