import {html} from "../../common/html.js";
import {Action} from "../actions.js";

export function StageClear() {
    return html`
        <div
            style="
                position: absolute;
                bottom: 10vmin;
                right: 10vmin;
            "
        >
            <div onclick="$(${Action.GoToTitle})">
                <b>ROAAAR!</b>
                <i>(You've found it!</i>
                <i>Play again)</i>
            </div>
        </div>
    `;
}
