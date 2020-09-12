# ROAR

A WebXR submission to js13kGames 2020, based on Goodluck.

## Changes compared to upstream Goodluck

- Assume WebGL2 and WebP support.

- AABB colliders do not take the scale and rotation into account. Their size is always defined in world units.

- Remove `LightDirectional`.
