import {Quat, Vec3} from "../common/math.js";
import {transform} from "./components/com_transform.js";
import {Err} from "./errors.js";
import {Entity, Game} from "./game.js";
import {Has, World} from "./world.js";

const MAX_ENTITIES = 10000;

let raf = 0;

export function loop_start(game: Game) {
    let last = performance.now();

    function tick(now: number, frame?: XRFrame) {
        let delta = (now - last) / 1000;
        last = now;

        if (frame) {
            game.XrFrame = frame;
            raf = game.XrFrame.session.requestAnimationFrame(tick);
        } else {
            game.XrFrame = undefined;
            raf = requestAnimationFrame(tick);
        }

        game.FrameUpdate(delta);
        game.FrameReset();
    }

    if (game.XrSession) {
        raf = game.XrSession.requestAnimationFrame(tick);
    } else {
        raf = requestAnimationFrame(tick);
    }
}

export function loop_stop(game: Game) {
    if (game.XrSession) {
        game.XrSession.cancelAnimationFrame(raf);
    } else {
        cancelAnimationFrame(raf);
    }
}

export function create(world: World, offset = 0) {
    for (let i = offset; i < MAX_ENTITIES; i++) {
        if (i >= world.Signature.length) {
            world.Signature[i] = 0;
            return i;
        }
        if (!world.Signature[i]) {
            return i;
        }
    }
    return Err.NoMoreEntities;
}

type Mixin = (game: Game, entity: Entity) => void;
export interface Blueprint {
    Offset?: number;
    Translation?: Vec3;
    Rotation?: Quat;
    Scale?: Vec3;
    Using?: Array<Mixin>;
    Disable?: Has;
    Children?: Array<Blueprint>;
}

export function instantiate(
    game: Game,
    {Offset = 0, Translation, Rotation, Scale, Using = [], Disable = 0, Children = []}: Blueprint
) {
    let entity = create(game.World, Offset);
    transform(Translation, Rotation, Scale)(game, entity);
    for (let mixin of Using) {
        mixin(game, entity);
    }
    if (Disable) {
        game.World.Signature[entity] &= ~Disable;
    }
    let entity_transform = game.World.Transform[entity];
    for (let subtree of Children) {
        let child = instantiate(game, subtree);
        let child_transform = game.World.Transform[child];
        child_transform.Parent = entity;
        entity_transform.Children.push(child);
    }
    return entity;
}

export function destroy(world: World, entity: Entity, with_children = true) {
    if (world.Signature[entity] & Has.Transform) {
        for (let child of world.Transform[entity].Children) {
            if (with_children) {
                destroy(world, child, with_children);
            } else {
                world.Transform[child].Parent = undefined;
            }
        }
    }
    world.Signature[entity] = 0;
}
