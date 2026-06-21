# TODO - Arivium Backend AI Integration

## Step 1: Fix controller/routes delegation
- [x] Update `backend/src/controllers/career.controller.ts` to correctly handle optional endpoints (disable broken ones).
- [x] Ensure `POST /api/v1/career/analyze` follows the global DTO format.


## Step 2: Replace stub Python inference with notebook-equivalent inference
- [ ] Update `backend/python/resume_parser.py` to match notebook skill extraction (no training).
- [ ] Update `backend/python/faiss_search.py` to perform real FAISS semantic search using existing `arivium_faiss.index` + `arivium_role_embeddings.npy`.
- [ ] Update `backend/python/readiness.py` to implement weighted readiness + missing-skill tiers (critical/important/advanced/other) from notebook.
- [ ] Update `backend/python/project_recommend.py` to map missing skills to project recommendations using existing logic (no regeneration).
- [ ] Update `backend/python/roadmap.py` to use prompt templates in `backend/src/prompts/*` and call Gemini/Groq at inference-time.

## Step 3: Verify AssetLoader path contract
- [ ] Confirm `backend/python/asset_loader.py` outputs all paths required by TS services.

## Step 4: Connect frontend to backend
- [ ] Verify frontend calls `/api/v1/career/analyze` (and other endpoints if used).
- [ ] Update frontend base URL / request fields if needed for multipart upload.

## Step 5: Testing
- [ ] Start backend and run a sample request.
- [ ] Start frontend and confirm UI renders results.

