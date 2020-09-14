import {loop_start, loop_stop} from "./core.js";
import {Game} from "./game.js";

export async function xr_init(game: Game) {
    game.XrSupported = await navigator.xr.isSessionSupported("immersive-vr");
}

export async function xr_enter(game: Game) {
    let session = await navigator.xr.requestSession("immersive-vr", {
        requiredFeatures: ["local-floor"],
    });

    game.XrSpace = await session.requestReferenceSpace("local-floor");

    session.updateRenderState({
        baseLayer: new XRWebGLLayer(session, game.Gl),
        depthFar: 25,
    });

    loop_stop(game);
    game.XrSession = session;
    loop_start(game);

    game.XrSession.addEventListener("end", () => {
        loop_stop(game);
        game.XrSession = undefined;
        game.XrSpace = undefined;
        game.XrFrame = undefined;
        game.ViewportResized = true;
        loop_start(game);
    });
}
