import {float, integer} from "../../common/random.js";
import {AudioClip} from "../components/com_audio_source.js";

export function snd_siren(): AudioClip {
    return {
        Tracks: [
            {
                Instrument: [
                    6,
                    "lowpass",
                    8,
                    0,
                    false,
                    "square",
                    3,
                    float(2.5, 3.5),
                    [["square", 8, 5, 18, 10, 7, true, false, 0, 0, 0]],
                ],
                Notes: [integer(65, 76)],
            },
        ],
        Exit: 9,
    };
}
