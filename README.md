# ROAR

A WebXR submission to [js13kGames 2020](http://2020.js13kgames.com/), based on [Goodluck](https://gdlck.com).

## The Making Of

Read [_The Making of ROAR_](https://piesku.com/roar), which includes:

- game design insights,
- architecture overview,
- technical implementation details,
- lessons learned.

## Changes compared to upstream Goodluck

- Assume WebGL2 and WebP support.

- AABB colliders do not take the scale and rotation into account. Their size is always defined in world units.

- Remove `LightDirectional`.

- (Only on the `release` branch) Remove `RenderKind` and `RenderPhase` and use `Render.Material` to distinguish between rendering phases.

- `AudioClip` can only play one track with one instrument and a single note.
