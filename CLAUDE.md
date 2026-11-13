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

## Releases

Bump `version` in `package.json`, commit as `Release vX.Y.Z`, tag `vX.Y.Z`, push the commit and the tag, then
create a GitHub release for the tag. The package is not published to npm.
