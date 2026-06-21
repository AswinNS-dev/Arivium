"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeParserService = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const AssetLoader_1 = __importDefault(require("./AssetLoader"));
class ResumeParserService {
    constructor() {
        this.root = path_1.default.resolve(__dirname, '../../../');
    }
    parsePdf(filePath) {
        if (!fs_1.default.existsSync(filePath))
            throw new Error('Resume file not found: ' + filePath);
        const assets = AssetLoader_1.default.assets;
        if (!assets)
            throw new Error('Assets not initialized');
        const py = path_1.default.join(this.root, 'backend', 'python', 'resume_parser.py');
        const res = (0, child_process_1.spawnSync)('python', [py, filePath, assets.roleSkillFreqPath, assets.careerProfilesPath], { encoding: 'utf8' });
        if (res.error)
            throw res.error;
        if (res.status !== 0)
            throw new Error(res.stderr || 'resume_parser failed');
        try {
            return JSON.parse(res.stdout);
        }
        catch (err) {
            throw new Error('Failed to parse resume_parser output: ' + err);
        }
    }
}
exports.ResumeParserService = ResumeParserService;
exports.default = new ResumeParserService();
