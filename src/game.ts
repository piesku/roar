import {GL_CULL_FACE, GL_DEPTH_TEST, GL_ONE, GL_ONE_MINUS_SRC_ALPHA} from "../common/webgl.js";
import {mat2_particles} from "../materials/mat2_particles.js";
import {mat2_textured_diffuse} from "../materials/mat2_textured_diffuse.js";
import {mat2_textured_unlit} from "../materials/mat2_textured_unlit.js";
import {mesh_claws} from "../meshes/claws.js";
import {mesh_cube} from "../meshes/cube.js";
import {mesh_plane} from "../meshes/plane.js";
import {Camera} from "./components/com_camera.js";
import {loop_start, loop_stop, xr_init} from "./core.js";
import {sys_camera} from "./systems/sys_camera.js";
import {sys_collide} from "./systems/sys_collide.js";
import {sys_control_rotate} from "./systems/sys_control_rotate.js";
import {sys_control_xr} from "./systems/sys_control_xr.js";
import {sys_framerate} from "./systems/sys_framerate.js";
import {sys_kinematic} from "./systems/sys_kinematic.js";
import {sys_light} from "./systems/sys_light.js";
import {sys_move} from "./systems/sys_move.js";
import {sys_particles} from "./systems/sys_particles.js";
import {sys_physics} from "./systems/sys_physics.js";
import {sys_render} from "./systems/sys_render.js";
import {sys_resolution} from "./systems/sys_resolution.js";
import {sys_shake} from "./systems/sys_shake.js";
import {sys_transform} from "./systems/sys_transform.js";
import {sys_ui} from "./systems/sys_ui.js";
import {World} from "./world.js";

export type Entity = number;

export class Game {
    World = new World();

    ViewportWidth = 0;
    ViewportHeight = 0;
    ViewportResized = false;

    Ui = document.querySelector("main")!;
    Canvas = document.querySelector("canvas")!;
    Gl = this.Canvas.getContext("webgl2", {xrCompatible: true})! as WebGL2RenderingContext;

    XrSupported = false;
    XrSession?: XRSession;
    XrSpace?: XRReferenceSpace;
    // XrFrame can be used to check whether we're presenting to a VR display.
    XrFrame?: XRFrame;

    MaterialTexturedDiffuse = mat2_textured_diffuse(this.Gl);
    MaterialTexturedUnlit = mat2_textured_unlit(this.Gl);
    MaterialParticles = mat2_particles(this.Gl);
    MeshCube = mesh_cube(this.Gl);
    MeshPlane = mesh_plane(this.Gl);
    MeshHand = mesh_claws(this.Gl);
    Textures: Record<string, WebGLTexture> = {};

    Camera?: Camera;
    // The rendering pipeline supports 8 lights.
    LightPositions = new Float32Array(4 * 8);
    LightDetails = new Float32Array(4 * 8);

    constructor() {
        document.addEventListener("visibilitychange", () =>
            document.hidden ? loop_stop(this) : loop_start(this)
        );

        this.Gl.enable(GL_DEPTH_TEST);
        this.Gl.enable(GL_CULL_FACE);
        this.Gl.blendFunc(GL_ONE, GL_ONE_MINUS_SRC_ALPHA);

        if (navigator.xr) {
            xr_init(this);
        }
    }

    FrameReset() {
        this.ViewportResized = false;
    }

    FrameUpdate(delta: number) {
        let now = performance.now();

        // User input and AI.
        sys_control_xr(this, delta);
        sys_control_rotate(this, delta);

        // Game logic.
        sys_move(this, delta);
        sys_shake(this, delta);
        sys_particles(this, delta);

        // Physics and collisions.
        sys_physics(this, delta);
        sys_transform(this, delta);
        sys_kinematic(this, delta);
        sys_collide(this, delta);
        sys_resolution(this, delta);
        sys_transform(this, delta);

        // Rendering.
        sys_camera(this, delta);
        sys_light(this, delta);
        sys_render(this, delta);
        sys_ui(this, delta);
        sys_framerate(this, delta, performance.now() - now);
    }
}
export const enum Layer {
    None = 0,
    Player = 1,
    Terrain = 2,
}
