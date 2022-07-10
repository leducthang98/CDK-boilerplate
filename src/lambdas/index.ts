import * as path from 'path';
import * as fs from 'fs';

export enum ResolverTypeName {
  Query = 'Query',
  Mutation = 'Mutation',
  Subcription = 'Subcription',
}

export type ApiDefinition = {
  name: string;
  type: ResolverTypeName;
  createdAt?: number;
};

export type LayerDefinition = {
  name: string;
  sourcePath: string;
  description?: string;
};

function getApis(type: ResolverTypeName) {
  const directory = path.join(__dirname, `/${type}`);
  const apis: ApiDefinition[] = [];

  const definitionsFolderName = fs.readdirSync(directory).filter(file => {
    return fs.statSync(directory + '/' + file).isDirectory();
  });

  for (const definition of definitionsFolderName) {
    const data = JSON.parse(fs.readFileSync(`${directory}/${definition}/setting.json`).toString()).createdAt;
    apis.push({
      name: definition,
      type,
      createdAt: data
    });
  }

  apis.sort(function (a, b) {
    return a.createdAt! - b.createdAt!
  })
  
  return apis;
}

function getLayers(): LayerDefinition[] {
  const directory = path.join(__dirname, `/Layer`);

  const layers: LayerDefinition[] = [];

  const layerFolderName = fs.readdirSync(directory).filter(file => {
    return fs.statSync(directory + '/' + file).isDirectory();
  });

  for (const layer of layerFolderName) {
    layers.push({
      name: layer,
      sourcePath: `${directory}/${layer}`,
    });
  }

  return layers;
}

export const layerDefinitions: LayerDefinition[] = getLayers();

export const apiDefinitions: { [key: string]: ApiDefinition[] } = {
  Query: getApis(ResolverTypeName.Query),
  Mutation: getApis(ResolverTypeName.Mutation),
};
