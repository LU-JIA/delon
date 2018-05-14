import { Tree } from '@angular-devkit/schematics';

/**
 * Adds a package to the package.json
 *
 * ```
 * addPackageToPackageJson(host, [ '＠delon/abc＠^1.0.0' ])
 * addPackageToPackageJson(host, [ '＠delon/abc＠^1.0.0' ], 'devDependencies')
 * ```
 */
export function addPackageToPackageJson(
  host: Tree,
  pkg: string | string[],
  type = 'dependencies',
): Tree {
  const json = getPackage(host, type);
  if (json == null) return host;

  if (!Array.isArray(pkg)) pkg = [pkg];
  pkg.forEach(p => {
    if (!json[type][p]) {
      const pos = p.lastIndexOf('@');
      json[type][p.substr(0, pos)] = p.substr(pos + 1);
    }
  });

  overwritePackage(host, json);
  return host;
}

export function getPackage(host: Tree, type?: string): any {
  if (!host.exists('package.json')) return null;

  const sourceText = host.read('package.json')!.toString('utf-8');
  const json = JSON.parse(sourceText);
  if (type && !json[type]) {
    json[type] = {};
  }
  return json;
}

export function overwritePackage(host: Tree, json: any) {
  host.overwrite('package.json', JSON.stringify(json, null, 2));
}
