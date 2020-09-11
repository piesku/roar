import {html} from "../../common/html.js";
import {StageKind} from "../actions.js";
import {Game} from "../game.js";
import {EnterVr} from "./EnterVr.js";
import {StageClear} from "./StageClear.js";
import {StageFailed} from "./StageFailed.js";
import {Title} from "./Title.js";

export function App(game: Game) {
    switch (game.CurrentStage) {
        case StageKind.Title:
            return Title();
        default:
            return html`
                ${game.CurrentStage === StageKind.Clear && StageClear()}
                ${game.CurrentStage === StageKind.Failed && StageFailed()} ${EnterVr(game)}
            `;
    }
}
