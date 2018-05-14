import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getFileContent } from '@schematics/angular/utility/test';
import { join } from 'path';
import { createTestApp } from '../utils/testing';
import { Schema as NgAddOptions } from './schema';

const collectionPath = join(__dirname, '../collection.json');

xdescribe('Schematic: ng-add', () => {
  let runner: SchematicTestRunner;
  let appTree: UnitTestTree;

  beforeEach(() => {
    appTree = createTestApp();
    runner = new SchematicTestRunner('schematics', collectionPath);
  });

  xit('should dependencies @delon of an application', () => {
    const tree = runner.runSchematic('alain-shell', {}, appTree);
    const packageJson = JSON.parse(getFileContent(tree, '/package.json'));

    expect(packageJson.dependencies['@angular/material']).toBeDefined();
  });
});
