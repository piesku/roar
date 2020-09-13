import {html} from "../../common/html.js";
import {Action, StageKind} from "../actions.js";
import {Game} from "../game.js";
import {EnterVr} from "./EnterVr.js";

export function App(game: Game) {
    if (game.CurrentStage === StageKind.Playing) {
        return EnterVr(game);
    }

    if (game.CurrentStage === StageKind.Intro) {
        return "";
    }

    return html`
        <div
            style="
                position: absolute;
                top: 20vmin;
                left: 10vmin;
            "
        >
            ${game.CurrentStage === StageKind.Title &&
            `
                <div style="font-size: 20vmin">ROAR!</div>
                Baby-zilla has been taken away!
            `}
            ${game.CurrentStage === StageKind.Clear &&
            `
                <div style="font-size: 20vmin">YOU WIN!</div>
                You've found it!
            `}
            ${game.CurrentStage === StageKind.Failed &&
            `
                <div style="font-size: 20vmin">YOU LOSE!</div>
                A missile has killed you!
            `}
        </div>
        <div
            style="
                position: absolute;
                bottom: 10vmin;
                right: 10vmin;
            "
        >
            ${game.CurrentStage === StageKind.Title
                ? `<div onclick="$(${Action.GoToStage})">Play now</div>`
                : `<div onclick="$(${Action.GoToStage})">Play again</div>`}
        </div>
    `;
}
