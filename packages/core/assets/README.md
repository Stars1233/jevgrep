# Parser assets

The build copies the Python grammar WASM from its exact-version official
Tree-sitter package into `tree-sitter/`. The generated asset and its license
notice ship in the CLI archive; searches never download a grammar. The external
`web-tree-sitter` runtime supplies its own WASM and license.

[Asset preparation](../../../scripts/parser-assets.mjs) owns the copy and license
provenance. It also prepares the canonical grammar used by release validation;
a clean validation checkout must install the locked development dependencies first.
