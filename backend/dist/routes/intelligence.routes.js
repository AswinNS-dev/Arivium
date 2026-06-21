"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const intelligence_controller_1 = __importDefault(require("../controllers/intelligence.controller"));
const router = express_1.default.Router();
router.post('/resources', intelligence_controller_1.default.resources);
router.post('/activity', intelligence_controller_1.default.activity);
router.get('/profiles/:profileId', intelligence_controller_1.default.profile);
router.get('/analytics', intelligence_controller_1.default.analytics);
router.post('/challenges', intelligence_controller_1.default.challenges);
router.post('/coach', intelligence_controller_1.default.coach);
exports.default = router;
