import {html} from "../../common/html.js";
import {Action} from "../actions.js";

export function Title() {
    return html`
        <div
            style="
                position: absolute;
                bottom: 10vmin;
                right: 10vmin;
            "
        >
            <div onclick="$(${Action.GoToStage})">
                <b>ROAAAR!</b>
                <i>(Find baby-zilla)</i>
            </div>
        </div>
    `;
}
