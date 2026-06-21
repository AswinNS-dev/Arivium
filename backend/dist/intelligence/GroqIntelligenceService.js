"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RoleDomainRegistry_1 = require("../ai/domain/RoleDomainRegistry");
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
function parseJson(content) {
    const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    return JSON.parse(cleaned);
}
class GroqIntelligenceService {
    async complete(system, prompt, json = false) {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey)
            throw Object.assign(new Error('GROQ_API_KEY is not configured'), { statusCode: 503 });
        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
                temperature: 0.25,
                messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
                ...(json ? { response_format: { type: 'json_object' } } : {}),
            }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok)
            throw Object.assign(new Error(payload?.error?.message || `Groq request failed (${response.status})`), { statusCode: 502 });
        const content = payload?.choices?.[0]?.message?.content;
        if (!content)
            throw Object.assign(new Error('Groq returned an empty response'), { statusCode: 502 });
        return content;
    }
    async resources(input) {
        const domain = (0, RoleDomainRegistry_1.getRoleDomain)(input.role);
        const allowed = domain?.requiredSkills || input.missingSkills || [input.skill];
        const system = 'You are Arivium Resource Intelligence. Return valid JSON only. Recommend current, reputable, directly relevant learning URLs. Never invent URLs. Do not use a fixed response or generic career advice.';
        const prompt = `Generate five personalized resources for this learner:\n${JSON.stringify(input)}\nRole-approved skill domain: ${allowed.join(', ')}.\nReturn {"skill":"${input.skill}","resources":[{"type":"Documentation|Course|YouTube|Project|Practice","title":"...","url":"https://...","reason":"why this fits this learner now"}]}. Include exactly one of each type. Prefer official documentation, reputable free courses, strong YouTube educators, project learning, and established practice platforms. Every resource must teach ${input.skill} at ${input.mastery} level during ${input.week}. Do not recommend resources for unrelated domains.`;
        const result = parseJson(await this.complete(system, prompt, true));
        const expected = new Set(['Documentation', 'Course', 'YouTube', 'Project', 'Practice']);
        if (result?.skill !== input.skill || !Array.isArray(result?.resources) || result.resources.length !== 5) {
            throw Object.assign(new Error('Groq returned an invalid resource set'), { statusCode: 502 });
        }
        const resources = result.resources.map((item) => {
            if (!expected.has(item.type) || typeof item.title !== 'string' || typeof item.url !== 'string')
                throw new Error('Invalid resource item');
            const url = new URL(item.url);
            if (url.protocol !== 'https:')
                throw new Error('Resource URLs must use HTTPS');
            expected.delete(item.type);
            return { type: item.type, title: item.title, url: url.toString(), reason: String(item.reason || '') };
        });
        if (expected.size)
            throw Object.assign(new Error('Groq omitted a required resource type'), { statusCode: 502 });
        return { skill: input.skill, resources, personalizedFor: { role: input.role, readiness: input.readiness, mastery: input.mastery, week: input.week } };
    }
    async challenges(context) {
        const domain = (0, RoleDomainRegistry_1.getRoleDomain)(context.role);
        const system = 'You generate role-specific portfolio challenges. Return valid JSON only and never cross into unrelated career domains.';
        const prompt = `Create three adaptive challenges from this actual learner context: ${JSON.stringify(context)}. Allowed role skills: ${(domain?.requiredSkills || context.missingSkills || []).join(', ')}. Return {"challenges":[{"title":"...","skill":"...","difficulty":"Beginner|Intermediate|Advanced","brief":"...","deliverables":["..."],"successCriteria":["..."],"estimatedHours":8}]}. Tie difficulty to readiness and mastery.`;
        const result = parseJson(await this.complete(system, prompt, true));
        if (!Array.isArray(result?.challenges) || !result.challenges.length)
            throw Object.assign(new Error('Groq returned invalid challenges'), { statusCode: 502 });
        return result;
    }
    async coach(context, question) {
        const system = 'You are the Arivium career coach. Answer only from the supplied student profile. Be specific, concise, and action-oriented. Explicitly connect advice to their evidence, gaps, roadmap, assessments, and projects. Never give generic internet advice.';
        return { answer: await this.complete(system, `Student profile: ${JSON.stringify(context)}\nStudent question: ${question}`) };
    }
}
exports.default = new GroqIntelligenceService();
