"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AdaptiveLearningService_1 = __importDefault(require("../intelligence/AdaptiveLearningService"));
const GroqIntelligenceService_1 = __importDefault(require("../intelligence/GroqIntelligenceService"));
function gaps(value) {
    if (Array.isArray(value))
        return value;
    return ['critical', 'important', 'advanced', 'other'].flatMap((tier) => value?.[tier] || []);
}
function context(body) {
    return {
        profileId: String(body.profileId || ''),
        role: String(body.role || ''),
        readiness: Number(body.readiness || 0),
        missingSkills: gaps(body.missingSkills),
        roadmap: body.roadmap || [],
    };
}
class IntelligenceController {
    async resources(req, res) {
        try {
            const body = req.body;
            if (!body.profileId || !body.role || !body.skill || !body.week || !body.mastery)
                return res.status(400).json({ success: false, message: 'profileId, role, skill, mastery and week are required' });
            AdaptiveLearningService_1.default.ensureProfile(context(body));
            const data = await GroqIntelligenceService_1.default.resources({ ...body, readiness: Number(body.readiness || 0), missingSkills: gaps(body.missingSkills) });
            return res.json({ success: true, data });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
    activity(req, res) {
        try {
            if (!req.body.event?.type || !req.body.event?.skill)
                return res.status(400).json({ success: false, message: 'event type and skill are required' });
            return res.json({ success: true, data: AdaptiveLearningService_1.default.record(context(req.body), req.body.event) });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }
    profile(req, res) {
        const data = AdaptiveLearningService_1.default.get(req.params.profileId);
        return data ? res.json({ success: true, data }) : res.status(404).json({ success: false, message: 'Learning profile not found' });
    }
    analytics(req, res) {
        return res.json({ success: true, data: AdaptiveLearningService_1.default.analytics(req.query.profileId) });
    }
    async challenges(req, res) {
        try {
            const profile = AdaptiveLearningService_1.default.ensureProfile(context(req.body));
            return res.json({ success: true, data: await GroqIntelligenceService_1.default.challenges({ ...req.body, profile }) });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
    async coach(req, res) {
        try {
            if (!req.body.question)
                return res.status(400).json({ success: false, message: 'question is required' });
            const profile = AdaptiveLearningService_1.default.ensureProfile(context(req.body));
            return res.json({ success: true, data: await GroqIntelligenceService_1.default.coach({ ...req.body, profile }, req.body.question) });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    }
}
exports.default = new IntelligenceController();
