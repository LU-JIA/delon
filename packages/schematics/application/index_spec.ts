import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';
import { join } from 'path';
import { Schema as NgAddOptions } from './schema';
import { createAlainApp } from '../utils/testing';

describe('Schematic: application', () => {
  let tree: UnitTestTree;
  beforeEach(() => tree = createAlainApp());

  describe(`update package.json`, () => {
    it(`should add @delon to dependencies`, () => {
      const packageJson = JSON.parse(tree.readContent('package.json'));
      expect(packageJson.dependencies['@delon/theme']).toBeDefined();
      expect(packageJson.dependencies['@delon/abc']).toBeDefined();
      expect(packageJson.dependencies['@delon/util']).toBeDefined();
      expect(packageJson.dependencies['@delon/acl']).toBeDefined();
      expect(packageJson.dependencies['@delon/auth']).toBeDefined();
      expect(packageJson.dependencies['@delon/cache']).toBeDefined();
      expect(packageJson.dependencies['@delon/mock']).toBeDefined();
    });
  });
});
