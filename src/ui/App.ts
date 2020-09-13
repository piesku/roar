import {html} from "../../common/html.js";
import {Action, StageKind} from "../actions.js";
import {Game} from "../game.js";
import {EnterVr} from "./EnterVr.js";

export function App(game: Game) {
    switch (game.CurrentStage) {
        case StageKind.Playing:
            return EnterVr(game);
        case StageKind.Intro:
            return "";
        case StageKind.Title:
            return html`
                <div
                    style="
                        position: absolute;
                        top: 20vmin;
                        left: 10vmin;
                    "
                >
                    <div style="font-size: 20vmin">ROAR!</div>
                    Baby-zilla has been taken away!
                </div>
                <div
                    style="
                        position: absolute;
                        bottom: 10vmin;
                        right: 10vmin;
                    "
                >
                    <div onclick="$(${Action.GoToStage})">Play now</div>
                </div>
            `;
        case StageKind.Clear:
            return html`
                <div
                    style="
                        position: absolute;
                        top: 20vmin;
                        left: 10vmin;
                    "
                >
                    <div style="font-size: 20vmin">YOU WIN!</div>
                    You've found it!
                </div>
                <div
                    style="
                        position: absolute;
                        bottom: 10vmin;
                        right: 10vmin;
                    "
                >
                    <div onclick="$(${Action.GoToStage})">Play again</div>
                </div>
            `;
        case StageKind.Failed:
            return html`
                <div
                    style="
                        position: absolute;
                        top: 20vmin;
                        left: 10vmin;
                    "
                >
                    <div style="font-size: 20vmin">YOU LOSE!</div>
                    A missile has killed you!
                </div>
                <div
                    style="
                        position: absolute;
                        bottom: 10vmin;
                        right: 10vmin;
                    "
                >
                    <div onclick="$(${Action.GoToStage})">Play again</div>
                </div>
            `;
    }
}
