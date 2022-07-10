const fs = require('fs-extra');
const path = require('path');
const glob = require('glob')


const prismaClientBuildPath = 'src/lambdas/Layer/dblayer';

export const copyPrismaEngines = async (): Promise<void> => {
  fs.removeSync(`${prismaClientBuildPath}/node_modules`);
  fs.copySync(
    'node_modules/.prisma/client',
    `${prismaClientBuildPath}/nodejs/node_modules/.prisma/client`,
    { dereference: true },
  );
  fs.copySync(
    'node_modules/@prisma',
    `${prismaClientBuildPath}/nodejs/node_modules/@prisma`,
    { dereference: true },
  );

  glob
    .sync('node_modules/.prisma/client/libquery_engine-linux-arm64-*')
    .forEach(async (file) => {
      const filename = path.basename(file);
      fs.copySync(file, `/tmp/${filename}`);
    });

  glob
    .sync(
      `${prismaClientBuildPath}/nodejs/node_modules/.prisma/client/libquery_engine-*`,
    )
    .forEach(async (file) => {
      fs.removeSync(file);
    });
  glob
    .sync(
      `${prismaClientBuildPath}/nodejs/node_modules/prisma/libquery_engine-*`,
    )
    .forEach(async (file) => {
      fs.removeSync(file);
    });

  fs.removeSync(`${prismaClientBuildPath}/nodejs/node_modules/@prisma/engines`);

  glob.sync('/tmp/libquery_engine-linux-arm64-*').forEach(async (file) => {
    const filename = path.basename(file);
    fs.copySync(
      file,
      `${prismaClientBuildPath}/nodejs/node_modules/.prisma/client/${filename}`,
    );
  });
};
