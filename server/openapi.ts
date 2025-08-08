export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'DevConnect API',
    version: '1.0.0',
    description: 'API documentation for DevConnect',
  },
  servers: [{ url: '/api' }],
  paths: {
    '/auth/google': {
      get: { summary: 'Start Google OAuth', responses: { '302': { description: 'Redirect to Google' } } },
    },
    '/auth/google/callback': {
      get: { summary: 'Google OAuth callback', responses: { '302': { description: 'Redirect to app' } } },
    },
    '/auth/user': {
      get: { summary: 'Get current user', responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } } },
    },
    '/discover/developers': {
      get: { summary: 'Discover developer profiles', parameters: [{ in: 'query', name: 'limit', schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
    },
    '/discover/tools': {
      get: { summary: 'Discover tool profiles', parameters: [{ in: 'query', name: 'limit', schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
    },
    '/tools/{toolId}': {
      get: { summary: 'Get tool details', parameters: [{ in: 'path', name: 'toolId', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Not Found' } } },
    },
    '/profile': {
      get: { summary: 'Get profile', responses: { '200': { description: 'OK' } } },
      post: { summary: 'Create or update profile', responses: { '200': { description: 'OK' } } },
    },
    '/matches': {
      get: { summary: 'Get matches', responses: { '200': { description: 'OK' } } },
    },
    '/matches/{matchId}/messages': {
      get: { summary: 'List messages', parameters: [{ in: 'path', name: 'matchId', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
      post: { summary: 'Send message', parameters: [{ in: 'path', name: 'matchId', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'OK' } } },
    },
  },
} as const;


