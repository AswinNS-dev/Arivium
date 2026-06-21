"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const career_controller_1 = __importDefault(require("../controllers/career.controller"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/analyze', upload.single('resume'), career_controller_1.default.analyze);
router.post('/roadmap', career_controller_1.default.roadmap);
router.post('/projects', career_controller_1.default.projects);
router.post('/roles', career_controller_1.default.roles);
exports.default = router;
