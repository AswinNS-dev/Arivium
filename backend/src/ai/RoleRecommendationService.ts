import FaissSearchService from './FaissSearchService';

export class RoleRecommendationService {
  recommendRoles(query: string, topk = 5) {
    return FaissSearchService.search(query, topk);
  }
}

export default new RoleRecommendationService();
