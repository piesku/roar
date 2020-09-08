import {html} from "../../common/html.js";
import {Action} from "../actions.js";

export function Title() {
    return html`
        <div
            style="
                position: absolute;
                bottom: 10vmin;
                right: 10vmin;
                color: #fff;
                font: 24px Arial;
            "
        >
            <button
                onclick="$(${Action.PlayNow})"
                style="
                    color: #fc0;
                    background: transparent;
                    border: none;
                    font: 5rem Impact;
                    font-weight: 800;
                "
            >
                Play Now
            </button>
        </div>
    `;
}
