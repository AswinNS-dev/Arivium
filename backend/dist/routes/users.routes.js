"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const users_controller_1 = __importDefault(require("../controllers/users.controller"));
const router = express_1.default.Router();
// All user routes require authentication
router.use(auth_middleware_1.authMiddleware);
router.get('/search', users_controller_1.default.search);
router.get('/:id', users_controller_1.default.getProfile);
router.get('/', users_controller_1.default.getAll);
exports.default = router;
