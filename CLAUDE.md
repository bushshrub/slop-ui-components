# slop-ui-components

## Commit attribution

End every commit message an AI agent writes with a `Co-Authored-By` trailer naming the exact model that did the
work, including its version:

```
Co-Authored-By: Claude Fable 5.2 <noreply@anthropic.com>
```

Derive the name from the model ID the session is actually running on (`claude-fable-5-2` is "Claude Fable 5.2").
Do not use a bare "Claude", a family name without the version, or a name copied from this example or an older
commit. If you cannot tell which model you are, ask instead of guessing.

## Components stay generic

This is a shared library: components must work in any app, not the one that asked for them.

- No product, domain or app names in component code, props or default text. App-specific wording belongs in
  `src/examples/` and stories only, and nothing from `src/examples/` is exported.
- Text the components write themselves goes in `defaultStrings` (`src/lib/strings.tsx`) so `UIStringsProvider`
  can replace it. Colours, radii and spacing come from the tokens, not literal values.
- When another app requests a component, build the general pattern (a list-detail split view, not "the Spools
  page"), and name it and its props after what it does.

## Releases

Bump `version` in `package.json`, commit as `Release vX.Y.Z`, tag `vX.Y.Z`, and push the commit and the tag.
`.github/workflows/release.yml` then runs typecheck, lint and the tests, and creates the GitHub release for the
tag if they pass. Do not create the release by hand. The package is not published to npm.
