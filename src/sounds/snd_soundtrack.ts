import {float, integer} from "../../common/random.js";
import {AudioClip} from "../components/com_audio_source.js";

export function snd_soundtrack(): AudioClip {
    return {
        Instrument: [
            5,
            "bandpass",
            10,
            3,
            true,
            "sine",
            8,
            13,
            [["triangle", 8, 4, 5, 8, 8, false, false, 8, 8, 8]],
        ],
        Notes: [integer(48, 60)],
        Exit: float(1, 3),
        Next: snd_soundtrack,
    };
}
