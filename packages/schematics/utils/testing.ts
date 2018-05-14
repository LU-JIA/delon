import {join} from 'path';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';

export function createNgRunner() {
  return new SchematicTestRunner('schematics', join('./node_modules/@schematics/angular/collection.json'));
}

export function createAlainRunner() {
  return new SchematicTestRunner('schematics', join(__dirname, '../collection.json'));
}

export function createAlainApp(): UnitTestTree {
  const baseRunner = createNgRunner();
  const workspaceTree = baseRunner.runSchematic('workspace', {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '6.0.0',
  });
  const tree = baseRunner.runSchematic('application', {
    name: 'foo',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: 'css',
    skipTests: false,
    skipPackageJson: false,
  }, workspaceTree);
  return createAlainRunner().runSchematic('application', {
    skipPackageJson: false
  }, tree);
}

export function createTestApp(): UnitTestTree {
  return createNgRunner().runSchematic('ng-new', {
    name: 'foo',
    directory: '',
    version: '6.0.0',
    routing: true,
    style: 'less'
  });
}
