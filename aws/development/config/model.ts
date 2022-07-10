type AppSyncParameter = {
  id: string;
  name: string;
  apiKeyExpireTime: number;
  logGroup: string;
};

type SecretManagerParameter = {
  id: string;
  name: string;
};

type LambdaParameter = {
  prefixLayerName: string;
};

export type ApiParameter = {
  appSync: AppSyncParameter;
  secretManager: SecretManagerParameter;
  lambda: LambdaParameter;
};
