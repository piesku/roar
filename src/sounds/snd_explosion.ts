import {float} from "../../common/random.js";
import {AudioClip} from "../components/com_audio_source.js";

export function snd_explosion(): AudioClip {
    return {
        Instrument: [
            12,
            "lowpass",
            float(5, 8),
            4,
            false,
            false,
            0,
            0,
            [[false, 13, 0, 0, float(5, 8)]],
        ],
        Note: 77,
        Exit: 9,
    };
}
