"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CareerAnalysisService_1 = __importDefault(require("../ai/CareerAnalysisService"));
const path_1 = __importDefault(require("path"));
class CareerController {
    async analyze(req, res) {
        try {
            const file = req.file;
            const targetRole = (req.body.targetRole || req.body.targetrole || req.body.role);
            if (!file)
                return res.status(400).json({ success: false, message: 'resume file required' });
            const result = await CareerAnalysisService_1.default.analyzeStudent(path_1.default.resolve(file.path), targetRole || '');
            return res.json({ success: true, message: 'Career analysis completed', data: result, meta: {} });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message || 'error', data: null });
        }
    }
    // These endpoints are optional for the current frontend.
    // The canonical pipeline is POST /api/v1/career/analyze.
    async roadmap(req, res) {
        try {
            const { targetRole } = req.body;
            return res.status(501).json({
                success: false,
                message: 'Not implemented. Use POST /api/v1/career/analyze instead.',
                data: null,
                meta: {},
            });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message || 'error', data: null });
        }
    }
    async projects(req, res) {
        try {
            return res.status(501).json({
                success: false,
                message: 'Not implemented. Use POST /api/v1/career/analyze instead.',
                data: null,
                meta: {},
            });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message || 'error', data: null });
        }
    }
    async roles(req, res) {
        try {
            return res.status(501).json({
                success: false,
                message: 'Not implemented. Use POST /api/v1/career/analyze instead.',
                data: null,
                meta: {},
            });
        }
        catch (err) {
            return res.status(500).json({ success: false, message: err.message || 'error', data: null });
        }
    }
}
exports.default = new CareerController();
