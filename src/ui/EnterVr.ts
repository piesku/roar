import {html} from "../../common/html.js";
import {Action} from "../actions.js";
import {Game} from "../game.js";

export function EnterVr(game: Game) {
    return html`
        <div
            style="
                position: absolute;
                bottom: 1vmin;
                right: 1vmin;
                background: #000;
                color: #fff;
                font: 13px Arial;
            "
        >
            ${game.XrFrame
                ? ExitButton()
                : game.XrSupported
                ? EnterButton()
                : `<div style="padding: 1vmin">WebXR not supported</div>`}
        </div>
    `;
}

function EnterButton() {
    return html`
        <div
            onclick="$(${Action.EnterVr})"
            style="
                background: #000;
                color: #fff;
                font: 13px Arial;
            "
        >
            Enter VR
        </div>
    `;
}

function ExitButton() {
    return html`
        <div
            onclick="$(${Action.ExitVr})"
            style="
                background: #000;
                color: #fff;
                font: 13px Arial;
            "
        >
            Exit VR
        </div>
    `;
}
