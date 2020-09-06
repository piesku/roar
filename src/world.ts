import {Aim} from "./components/com_aim.js";
import {AudioSource} from "./components/com_audio_source.js";
import {Camera} from "./components/com_camera.js";
import {Collide} from "./components/com_collide.js";
import {ControlFire} from "./components/com_control_fire.js";
import {ControlMove} from "./components/com_control_move.js";
import {ControlSpawn} from "./components/com_control_spawn.js";
import {ControlXr} from "./components/com_control_xr.js";
import {Cull} from "./components/com_cull.js";
import {EmitParticles} from "./components/com_emit_particles.js";
import {Lifespan} from "./components/com_lifespan.js";
import {Light} from "./components/com_light.js";
import {Move} from "./components/com_move.js";
import {Render} from "./components/com_render.js";
import {RigidBody} from "./components/com_rigid_body.js";
import {Shake} from "./components/com_shake.js";
import {Toggle} from "./components/com_toggle.js";
import {Transform} from "./components/com_transform.js";
import {Trigger} from "./components/com_trigger.js";

const enum Component {
    Aim,
    AudioListener,
    AudioSource,
    Camera,
    Collide,
    ControlFire,
    ControlRotate,
    ControlSpawn,
    ControlXr,
    Cull,
    EmitParticles,
    Lifespan,
    Light,
    Move,
    Render,
    RigidBody,
    Shake,
    Toggle,
    Transform,
    Trigger,
}

export const enum Has {
    Aim = 1 << Component.Aim,
    AudioListener = 1 << Component.AudioListener,
    AudioSource = 1 << Component.AudioSource,
    Camera = 1 << Component.Camera,
    Collide = 1 << Component.Collide,
    ControlFire = 1 << Component.ControlFire,
    ControlMove = 1 << Component.ControlRotate,
    ControlSpawn = 1 << Component.ControlSpawn,
    ControlXr = 1 << Component.ControlXr,
    Cull = 1 << Component.Cull,
    EmitParticles = 1 << Component.EmitParticles,
    Lifespan = 1 << Component.Lifespan,
    Light = 1 << Component.Light,
    Move = 1 << Component.Move,
    Render = 1 << Component.Render,
    RigidBody = 1 << Component.RigidBody,
    Shake = 1 << Component.Shake,
    Toggle = 1 << Component.Toggle,
    Transform = 1 << Component.Transform,
    Trigger = 1 << Component.Trigger,
}

export class World {
    // Component flags
    Signature: Array<number> = [];
    // Component data
    Aim: Array<Aim> = [];
    AudioSource: Array<AudioSource> = [];
    Camera: Array<Camera> = [];
    Collide: Array<Collide> = [];
    ControlFire: Array<ControlFire> = [];
    ControlMove: Array<ControlMove> = [];
    ControlSpawn: Array<ControlSpawn> = [];
    ControlXr: Array<ControlXr> = [];
    Cull: Array<Cull> = [];
    EmitParticles: Array<EmitParticles> = [];
    Lifespan: Array<Lifespan> = [];
    Light: Array<Light> = [];
    Move: Array<Move> = [];
    Render: Array<Render> = [];
    RigidBody: Array<RigidBody> = [];
    Shake: Array<Shake> = [];
    Toggle: Array<Toggle> = [];
    Transform: Array<Transform> = [];
    Trigger: Array<Trigger> = [];
}
