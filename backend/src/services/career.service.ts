import AssetLoader from '../ai/AssetLoader';

export async function initCareerServices() {
  await AssetLoader.initialize();
}

export default {
  initCareerServices,
};
