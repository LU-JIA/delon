import {
  Rule,
  chain,
  mergeWith,
  Tree,
  SchematicContext,
  apply,
  schematic,
  empty,
} from '@angular-devkit/schematics';
import { Schema as ApplicationOptions } from '../application/schema';
import { Schema as NgAddOptions } from './schema';

export default function(options: NgAddOptions): Rule {
  const rules: Rule[] = [];

  const applicationOptions: ApplicationOptions = {
    codeStyle: options.codeStyle
  };
  rules.push(schematic('application', applicationOptions));

  if (options.form) rules.push(schematic('form', {}));

  return chain(rules);
}
