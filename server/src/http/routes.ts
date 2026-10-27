import { Router, type Request } from 'express';
import { z } from 'zod';

import {
  chatRequestSchema,
  catalogQuerySchema,
  shareLinkSchema,
  simulationRequestSchema,
  type CatalogQuery
} from '@quantumnexus/shared';

import { asyncHandler, validateBody, validateQuery } from './middleware.js';
import { workspaceStore } from '../store/workspaceStore.js';
import {
  analyticsSummary,
  capabilities,
  decodeShareLink,
  encodeShareLink,
  getEntityDetail,
  listEntities,
  respondToChat,
  simulate
} from '../domain/engine.js';

export const apiRouter = Router();

function queryOf(req: Request): CatalogQuery {
  return (req as Request & { validatedQuery: CatalogQuery }).validatedQuery;
}

apiRouter.get('/v1/version', (_req, res) => {
  res.json({ name: 'QuantumNexus', version: '1.0.0', apiVersion: 'v1' });
});

apiRouter.get('/v1/capabilities', (_req, res) => {
  res.json(capabilities());
});

apiRouter.get('/v1/catalog', validateQuery(catalogQuerySchema), (req, res) => {
  res.json(listEntities(queryOf(req)));
});

apiRouter.get('/v1/catalog/:id', (req, res, next) => {
  try {
    res.json(getEntityDetail(req.params.id ?? ''));
  } catch (error) {
    next(error);
  }
});

apiRouter.get('/v1/analytics/summary', (_req, res) => {
  res.json(analyticsSummary());
});

const projectInput = z.object({
  name: z.string().trim().min(1).max(100),
  seed: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(2000).default('')
});

apiRouter.get('/v1/workspaces', asyncHandler(async (_req, res) => {
  res.json({ projects: await workspaceStore.list() });
}));

apiRouter.post('/v1/workspaces', validateBody(projectInput), asyncHandler(async (req, res) => {
  res.status(201).json({ project: await workspaceStore.create(req.body) });
}));

apiRouter.delete('/v1/workspaces/:id', asyncHandler(async (req, res) => {
  await workspaceStore.remove(req.params.id ?? '');
  res.status(204).end();
}));

const cryptoAssetInput = z.object({ system: z.string().trim().min(1).max(160), owner: z.string().trim().max(120).default(''), algorithm: z.string().trim().min(1).max(120), protocol: z.string().trim().max(120).default(''), assetType: z.enum(['TLS certificate', 'VPN', 'SSH', 'Code signing', 'PKI', 'Stored data', 'Other']), dataSensitivity: z.enum(['Public', 'Internal', 'Confidential', 'Restricted']), longLivedData: z.boolean().default(false), migrationStatus: z.enum(['Unknown', 'Not started', 'Assessing', 'Planned', 'In progress', 'Migrated', 'Exception']), targetStandard: z.enum(['Undecided', 'ML-KEM (FIPS 203)', 'ML-DSA (FIPS 204)', 'SLH-DSA (FIPS 205)', 'Hybrid / vendor-defined']), targetDate: z.string().max(10).default(''), notes: z.string().trim().max(2000).default('') });
apiRouter.get('/v1/workspaces/:id/assets', asyncHandler(async (req, res) => {
  const project = (await workspaceStore.list()).find((item) => item.id === req.params.id);
  if (!project) throw Object.assign(new Error('Project not found'), { statusCode: 404, code: 'PROJECT_NOT_FOUND' });
  res.json({ assets: project.assets });
}));
apiRouter.post('/v1/workspaces/:id/assets', validateBody(cryptoAssetInput), asyncHandler(async (req, res) => {
  res.status(201).json({ asset: await workspaceStore.addAsset(req.params.id ?? '', req.body) });
}));
apiRouter.patch('/v1/workspaces/:id/assets/:assetId', validateBody(cryptoAssetInput.partial()), asyncHandler(async (req, res) => {
  res.json({ asset: await workspaceStore.updateAsset(req.params.id ?? '', req.params.assetId ?? '', req.body) });
}));
apiRouter.delete('/v1/workspaces/:id/assets/:assetId', asyncHandler(async (req, res) => {
  await workspaceStore.removeAsset(req.params.id ?? '', req.params.assetId ?? ''); res.status(204).end();
}));

apiRouter.post('/v1/workspaces/:id/runs', validateBody(simulationRequestSchema), asyncHandler(async (req, res) => {
  const result = simulate(req.body);
  const project = await workspaceStore.addRun(req.params.id ?? '', result.actionLabel, result);
  res.status(201).json({ project, result });
}));

apiRouter.post(
  '/v1/simulate',
  validateBody(simulationRequestSchema),
  asyncHandler(async (req, res) => {
    res.status(201).json(simulate(req.body));
  })
);

apiRouter.post(
  '/v1/ai/chat',
  validateBody(chatRequestSchema),
  asyncHandler(async (req, res) => {
    res.json(respondToChat(req.body));
  })
);

apiRouter.post(
  '/v1/share-links',
  validateBody(shareLinkSchema),
  asyncHandler(async (req, res) => {
    const token = encodeShareLink(req.body);
    res.status(201).json({ token, path: `/?share=${token}` });
  })
);

apiRouter.get('/v1/share-links/:token', (req, res, next) => {
  try {
    res.json({ payload: decodeShareLink(req.params.token ?? '') });
  } catch (error) {
    next(error);
  }
});
