import {create} from "../../common/mat4.js";
import {Mat4, Vec3} from "../../common/math.js";
import {Entity, Game} from "../game.js";
import {Has} from "../world.js";

export type Camera = CameraPerspective | CameraXr;
export const enum CameraKind {
    Perspective,
    Xr,
}

export interface CameraEye {
    Pv: Mat4;
    Position: Vec3;
    FogDistance: number;
}

export interface CameraPerspective extends CameraEye {
    Kind: CameraKind.Perspective;
    FovY: number;
    Near: number;
    Far: number;
    Projection: Mat4;
    CullZ: number;
}

export function camera_persp(fovy: number, near: number, far: number) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Camera;
        game.World.Camera[entity] = {
            Kind: CameraKind.Perspective,
            FovY: fovy,
            Near: near,
            Far: far,
            Projection: create(),
            Pv: create(),
            Position: [0, 0, 0],
            FogDistance: 25,
            CullZ: 1,
        };
    };
}

export interface XrEye extends CameraEye {
    Viewpoint: XRView;
}

export interface CameraXr {
    Kind: CameraKind.Xr;
    Eyes: Array<XrEye>;
    FogDistance: number;
    CullZ: number;
}

export function camera_xr() {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Camera;
        game.World.Camera[entity] = {
            Kind: CameraKind.Xr,
            Eyes: [],
            FogDistance: 10,
            CullZ: 0.95,
        };
    };
}
