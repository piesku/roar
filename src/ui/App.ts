import {html} from "../../common/html.js";
import {Game} from "../game.js";
import {scene_title} from "../scenes/sce_title.js";
import {EnterVr} from "./EnterVr.js";
import {Title} from "./Title.js";

export function App(game: Game) {
    switch (game.CurrentScene) {
        case scene_title:
            return Title();
        default:
            return html`<div>${EnterVr(game)}</div>`;
    }
}
