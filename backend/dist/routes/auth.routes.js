"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const router = express_1.default.Router();
// Email/password auth (fallback)
router.post('/signup', auth_controller_1.default.signup);
router.post('/login', auth_controller_1.default.login);
// Google OAuth
router.get('/google', auth_controller_1.default.googleSignIn);
router.get('/callback', auth_controller_1.default.authCallback);
// Session management
router.get('/me', auth_controller_1.default.me);
router.post('/logout', auth_controller_1.default.logout);
exports.default = router;
