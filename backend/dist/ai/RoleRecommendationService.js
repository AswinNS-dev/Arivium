"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRecommendationService = void 0;
const FaissSearchService_1 = __importDefault(require("./FaissSearchService"));
class RoleRecommendationService {
    recommendRoles(query, topk = 5) {
        return FaissSearchService_1.default.search(query, topk);
    }
}
exports.RoleRecommendationService = RoleRecommendationService;
exports.default = new RoleRecommendationService();
