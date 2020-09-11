import {GL_CULL_FACE, GL_DEPTH_TEST, GL_ONE, GL_SRC_ALPHA} from "../common/webgl.js";
import {mat2_colored_unlit} from "../materials/mat2_colored_unlit.js";
import {mat2_particles} from "../materials/mat2_particles.js";
import {mat2_textured_diffuse} from "../materials/mat2_textured_diffuse.js";
import {mat2_wireframe} from "../materials/mat2_wireframe.js";
import {mesh_claw} from "../meshes/claw.js";
import {mesh_cube} from "../meshes/cube.js";
import {mesh_plane} from "../meshes/plane.js";
import {Camera} from "./components/com_camera.js";
import {loop_start, loop_stop} from "./core.js";
import {sys_aim} from "./systems/sys_aim.js";
import {sys_audio_listener} from "./systems/sys_audio_listener.js";
import {sys_audio_source} from "./systems/sys_audio_source.js";
import {sys_camera} from "./systems/sys_camera.js";
import {sys_collide} from "./systems/sys_collide.js";
import {sys_control_fire} from "./systems/sys_control_fire.js";
import {sys_control_move} from "./systems/sys_control_move.js";
import {sys_control_pose} from "./systems/sys_control_pose.js";
import {sys_control_spawn} from "./systems/sys_control_spawn.js";
import {sys_control_xr} from "./systems/sys_control_xr.js";
import {sys_cull} from "./systems/sys_cull.js";
import {sys_debug} from "./systems/sys_debug.js";
import {sys_framerate} from "./systems/sys_framerate.js";
import {sys_lifespan} from "./systems/sys_lifespan.js";
import {sys_light} from "./systems/sys_light.js";
import {sys_move} from "./systems/sys_move.js";
import {sys_particles} from "./systems/sys_particles.js";
import {sys_physics_damage} from "./systems/sys_physics_damage.js";
import {sys_physics_integrate} from "./systems/sys_physics_integrate.js";
import {sys_physics_kinematic} from "./systems/sys_physics_kinematic.js";
import {sys_physics_resolve} from "./systems/sys_physics_resolve.js";
import {sys_render} from "./systems/sys_render.js";
import {sys_shake} from "./systems/sys_shake.js";
import {sys_toggle} from "./systems/sys_toggle.js";
import {sys_transform} from "./systems/sys_transform.js";
import {sys_trigger} from "./systems/sys_trigger.js";
import {sys_ui} from "./systems/sys_ui.js";
import {World} from "./world.js";
import {xr_init} from "./xr.js";

export type Entity = number;

export class Game {
    World = new World();

    ViewportWidth = 0;
    ViewportHeight = 0;
    ViewportResized = false;

    Ui = document.querySelector("main")!;
    Canvas = document.querySelector("canvas")!;
    Gl = this.Canvas.getContext("webgl2", {xrCompatible: true})! as WebGL2RenderingContext;
    Audio = new (window["AudioContext"] || window.webkitAudioContext)();

    XrSupported = false;
    XrSession?: XRSession;
    XrSpace?: XRReferenceSpace;
    // XrFrame can be used to check whether we're presenting to a VR display.
    XrFrame?: XRFrame;
    XrInputs: Record<string, XRInputSource> = {};

    MaterialWireframe = mat2_wireframe(this.Gl);
    MaterialTexturedDiffuse = mat2_textured_diffuse(this.Gl);
    MaterialColoredUnlit = mat2_colored_unlit(this.Gl);
    MaterialParticles = mat2_particles(this.Gl);
    MeshCube = mesh_cube(this.Gl);
    MeshPlane = mesh_plane(this.Gl);
    MeshClaw = mesh_claw(this.Gl);
    Textures: Record<string, WebGLTexture> = {};

    Camera?: Camera;
    // The rendering pipeline supports 8 lights.
    LightPositions = new Float32Array(4 * 8);
    LightDetails = new Float32Array(4 * 8);

    CurrentScene?: Function;

    constructor() {
        document.addEventListener("visibilitychange", () =>
            document.hidden ? loop_stop(this) : loop_start(this)
        );

        this.Gl.enable(GL_DEPTH_TEST);
        this.Gl.enable(GL_CULL_FACE);
        // Additive blending for particles.
        this.Gl.blendFunc(GL_SRC_ALPHA, GL_ONE);

        if (navigator.xr) {
            xr_init(this);
        }
    }

    FrameReset() {
        this.ViewportResized = false;
    }

    FrameUpdate(delta: number) {
        let now = performance.now();

        sys_lifespan(this, delta);

        // User input and AI.
        sys_control_xr(this, delta);
        sys_control_fire(this, delta);
        sys_control_move(this, delta);
        sys_control_spawn(this, delta);

        // Game logic.
        sys_aim(this, delta);
        sys_move(this, delta);
        sys_shake(this, delta);
        sys_particles(this, delta);
        sys_toggle(this, delta);

        // Physics and collisions.
        sys_control_pose(this, delta);
        sys_physics_integrate(this, delta);
        sys_transform(this, delta);
        sys_physics_kinematic(this, delta);
        sys_collide(this, delta);
        sys_physics_resolve(this, delta);
        sys_physics_damage(this, delta);
        sys_trigger(this, delta);
        sys_transform(this, delta);

        if (false) {
            sys_debug(this, delta);
        }

        // Rendering.
        sys_audio_listener(this, delta);
        sys_audio_source(this, delta);
        sys_camera(this, delta);
        sys_cull(this, delta);
        sys_light(this, delta);
        sys_render(this, delta);
        sys_ui(this, delta);
        sys_framerate(this, delta, performance.now() - now);
    }
}
export const enum Layer {
    None = 0,
    PlayerHand = 1,
    PlayerGrip = 2,
    Ground = 4,
    BuildingShell = 8,
    BuildingBlock = 16,
    Missile = 32,
    Cage = 64,
}
