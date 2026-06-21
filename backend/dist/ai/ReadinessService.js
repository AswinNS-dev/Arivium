"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadinessService = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const AssetLoader_1 = __importDefault(require("./AssetLoader"));
class ReadinessService {
    constructor() {
        this.root = path_1.default.resolve(__dirname, '../../../');
    }
    evaluate(skills, targetRole) {
        const assets = AssetLoader_1.default.assets;
        if (!assets)
            throw new Error('Assets not initialized');
        const py = path_1.default.join(this.root, 'backend', 'python', 'readiness.py');
        const args = [py, JSON.stringify(skills), targetRole, assets.roleSkillFreqPath, assets.careerProfilesPath];
        const res = (0, child_process_1.spawnSync)('python', args, { encoding: 'utf8' });
        if (res.error)
            throw res.error;
        if (res.status !== 0)
            throw new Error(res.stderr || 'readiness failed');
        try {
            return JSON.parse(res.stdout);
        }
        catch (err) {
            throw new Error('Failed to parse readiness output: ' + err);
        }
    }
}
exports.ReadinessService = ReadinessService;
exports.default = new ReadinessService();
