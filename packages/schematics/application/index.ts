import {
  Rule,
  Tree,
  SchematicContext,
  chain,
  noop,
  mergeWith,
  apply,
  url,
  template,
  move,
} from '@angular-devkit/schematics';
import { strings, join } from '@angular-devkit/core';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import * as path from 'path';

import { Schema as ApplicationOptions } from './schema';
import {
  addPackageToPackageJson,
  getPackage,
  overwritePackage,
} from '../utils/package';
import { VERSION, ZORROVERSION } from '../utils/lib-versions';
import { overwriteFiles, addFiles } from '../utils/file';
import {
  getWorkspace,
  getProjectFromWorkspace,
} from '../utils/devkit-utils/config';
import { addHeadStyle, addHtmlToBody } from '../utils/html';

const _files = path.join(__dirname, '_files');

function addDependenciesToPackageJson() {
  return (host: Tree, context: SchematicContext) => {
    // allow ignore ng-zorro-antd becauce of @delon/theme dependency
    addPackageToPackageJson(host, `ng-zorro-antd@${ZORROVERSION}`);
    // @delon/*
    addPackageToPackageJson(
      host,
      ['abc', 'acl', 'auth', 'cache', 'form', 'mock', 'theme', 'util'].map(
        pkg => `@delon/${pkg}@${VERSION}`,
      ),
    );
    context.addTask(new NodePackageInstallTask());
    return host;
  };
}

function addRunScriptToPackageJson() {
  return (host: Tree, context: SchematicContext) => {
    const json = getPackage(host, 'scripts');
    if (json == null) return host;
    json.scripts['start'] = `ng serve -o`;
    json.scripts['build'] = `ng build --prod --build-optimizer`;
    json.scripts['analyze'] = `ng build --prod --build-optimizer --stats-json`;
    json.scripts['test-coverage'] = `ng test --code-coverage --watch=false`;
    json.scripts['fix-v6'] = `node fix-v6`;
    overwritePackage(host, json);
    return host;
  };
}

function addCodeStylesToPackageJson() {
  return (host: Tree, context: SchematicContext) => {
    const json = getPackage(host);
    if (json == null) return host;
    json.scripts['precommit'] = `npm run lint-staged`;
    json.scripts['lint'] = `npm run lint:ts && npm run lint:style`;
    json.scripts['lint:ts'] = `ng lint`;
    json.scripts['lint:style'] = `stylelint \"{src}/**/*.less\" --syntax less`;
    json.scripts['lint-staged'] = `lint-staged`;
    json.scripts['tslint-check'] = `tslint-config-prettier-check ./tslint.json`;
    json['lint-staged'] = {
      '*.{cmd,html,json,md,sh,txt,xml,yml}': [
        'editorconfig-tools fix',
        'git add',
      ],
      '*.ts': ['npm run lint:ts', 'prettier --write', 'git add'],
      '*.less': ['npm run lint:style', 'prettier --write', 'git add'],
    };
    overwritePackage(host, json);
    // dependencies
    addPackageToPackageJson(host, [
      `tslint-config-prettier@^1.12.0`,
      `tslint-language-service@^0.9.9`,
      `editorconfig-tools@^0.1.1`,
      `husky@^0.14.3`,
      `prettier@^1.12.1`,
      `prettier-stylelint@^0.4.2`,
      `stylelint@^9.2.0`,
      `stylelint-config-standard@^18.2.0`,
    ]);
    context.addTask(new NodePackageInstallTask());
    return host;
  };
}

function addStyle(options: ApplicationOptions) {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    addHeadStyle(
      host,
      project,
      `  <style type="text/css">.preloader{position:fixed;top:0;left:0;width:100%;height:100%;overflow:hidden;background:#49a9ee;z-index:9999;transition:opacity .65s}.preloader-hidden-add{opacity:1;display:block}.preloader-hidden-add-active{opacity:0}.preloader-hidden{display:none}.cs-loader{position:absolute;top:0;left:0;height:100%;width:100%}.cs-loader-inner{transform:translateY(-50%);top:50%;position:absolute;width:100%;color:#fff;text-align:center}.cs-loader-inner label{font-size:20px;opacity:0;display:inline-block}@keyframes lol{0%{opacity:0;transform:translateX(-300px)}33%{opacity:1;transform:translateX(0)}66%{opacity:1;transform:translateX(0)}100%{opacity:0;transform:translateX(300px)}}.cs-loader-inner label:nth-child(6){animation:lol 3s infinite ease-in-out}.cs-loader-inner label:nth-child(5){animation:lol 3s .1s infinite ease-in-out}.cs-loader-inner label:nth-child(4){animation:lol 3s .2s infinite ease-in-out}.cs-loader-inner label:nth-child(3){animation:lol 3s .3s infinite ease-in-out}.cs-loader-inner label:nth-child(2){animation:lol 3s .4s infinite ease-in-out}.cs-loader-inner label:nth-child(1){animation:lol 3s .5s infinite ease-in-out}</style>`,
    );
    addHtmlToBody(
      host,
      project,
      `  <div class="preloader"><div class="cs-loader"><div class="cs-loader-inner"><label>	●</label><label>	●</label><label>	●</label><label>	●</label><label>	●</label><label>	●</label></div></div>\n`,
    );
    // add styles
    addFiles(host, ['src/styles/index.less', 'src/styles/theme.less'], _files);

    return host;
  };
}

export default function(options: ApplicationOptions): Rule {
  return (host: Tree, context: SchematicContext) => {
    overwriteFiles(
      host,
      [
        'README.md',
        'src/main.ts',
        'src/environments/environment.prod.ts',
        'src/environments/environment.ts',
        'src/styles.less',
      ],
      _files,
    );

    return chain([
      // @delon/* dependencies
      options.skipPackageJson ? noop() : addDependenciesToPackageJson(),
      // ci
      addRunScriptToPackageJson(),
      // code style
      options.codeStyle ? addCodeStylesToPackageJson() : noop(),
      // files
      mergeWith(
        apply(url('./files'), [
          template({
            utils: strings,
            ...options,
            dot: '.',
            VERSION,
            ZORROVERSION,
          }),
        ]),
      ),
      // src
      addStyle(options),
    ])(host, context);
  };
}
