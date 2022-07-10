import { ApiParameter } from './model';

const prefix = `${process.env.APP_NAME}-${process.env.STAGE}`;

export const API_PARAMETER: ApiParameter = {
  appSync: {
    id: `${prefix}-api`,
    name: `${prefix}-appsync-backend`,
    apiKeyExpireTime: 365,
    logGroup: `${prefix}-logger`,
  },
  secretManager: {
    id: `${prefix}-sm`,
    name: `${prefix}-secret-data`,
  },
  lambda: {
    prefixLayerName: `${prefix}-layer`,
  },
};
