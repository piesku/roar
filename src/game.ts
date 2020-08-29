import {GL_CULL_FACE, GL_DEPTH_TEST} from "../common/webgl.js";
import {mat2_diffuse_gouraud} from "../materials/mat2_diffuse_gouraud.js";
import {mat2_diffuse_toon} from "../materials/mat2_diffuse_toon.js";
import {mat2_textured_diffuse} from "../materials/mat2_textured_diffuse.js";
import {mat2_textured_unlit} from "../materials/mat2_textured_unlit.js";
import {mesh_claws} from "../meshes/claws.js";
import {mesh_cube} from "../meshes/cube.js";
import {Camera} from "./components/com_camera.js";
import {loop_start, loop_stop, xr_init} from "./core.js";
import {sys_camera} from "./systems/sys_camera.js";
import {sys_collide} from "./systems/sys_collide.js";
import {sys_control_xr} from "./systems/sys_control_xr.js";
import {sys_framerate} from "./systems/sys_framerate.js";
import {sys_kinematic} from "./systems/sys_kinematic.js";
import {sys_light} from "./systems/sys_light.js";
import {sys_physics} from "./systems/sys_physics.js";
import {sys_render} from "./systems/sys_render.js";
import {sys_resolution} from "./systems/sys_resolution.js";
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

    MaterialDiffuseGouraud = mat2_diffuse_gouraud(this.Gl);
    MaterialDiffuseToon = mat2_diffuse_toon(this.Gl);
    MaterialTexturedDiffuse = mat2_textured_diffuse(this.Gl);
    MaterialTexturedUnlit = mat2_textured_unlit(this.Gl);
    MeshCube = mesh_cube(this.Gl);
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

        if (navigator.xr) {
            xr_init(this);
        }
    }

    FrameReset() {
        this.ViewportResized = false;
    }

    FrameUpdate(delta: number) {
        let now = performance.now();

        // User input.
        sys_control_xr(this, delta);

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
