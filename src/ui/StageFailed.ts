import {html} from "../../common/html.js";
import {Action} from "../actions.js";

export function StageFailed() {
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
                <i>(A missile has killed you!</i>
                <i>Try again)</i>
            </div>
        </div>
    `;
}
