import {html} from "../../common/html.js";
import {Action, StageKind} from "../actions.js";
import {Game} from "../game.js";
import {EnterVr} from "./EnterVr.js";

export function App(game: Game) {
    if (game.CurrentStage === StageKind.Playing) {
        return EnterVr(game);
    }

    return html`
        <div
            style="
                position: absolute;
                top: 20vmin;
                left: 10vmin;
            "
        >
            <div style="font-size: 20vmin">ROAR!</div>
            ${game.CurrentStage === StageKind.Title && "Baby-zilla has been taken away!"}
            ${game.CurrentStage === StageKind.Clear && "You've found it!"}
            ${game.CurrentStage === StageKind.Failed && "A missile has killed you!"}
        </div>
        <div
            style="
                position: absolute;
                bottom: 10vmin;
                right: 10vmin;
            "
        >
            ${game.CurrentStage === StageKind.Title
                ? `<button onclick="$(${Action.GoToStage})">Play now</button>`
                : `<button onclick="$(${Action.GoToStage})">Play again</button>`}
        </div>
    `;
}
