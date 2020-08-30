import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

export interface EmitParticles {
    readonly Lifespan: number;
    readonly Frequency: number;
    readonly Speed: number;
    Trigger: boolean;
    Instances: Array<number>;
    SinceLast: number;
}

/**
 * Add EmitParticles.
 *
 * @param lifespan How long particles live for.
 * @param frequency How often particles spawn.
 * @param speed How fast particles move.
 */
export function emit_particles(lifespan: number, frequency: number, speed: number) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.EmitParticles;
        game.World.EmitParticles[entity] = {
            Lifespan: lifespan,
            Frequency: frequency,
            Speed: speed,
            Trigger: false,
            Instances: [],
            SinceLast: 0,
        };
    };
}
