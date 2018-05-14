import { Rule, chain, mergeWith, Tree, SchematicContext, apply, schematic, empty } from '@angular-devkit/schematics';
import { Schema as FormOptions } from './schema';

export default function(options: FormOptions): Rule {

  return chain([
    mergeWith(
      apply(empty(), [
      ])
    ),
    (host: Tree, context: SchematicContext) => {}
  ]);
}
