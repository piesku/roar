import {AudioClip} from "../components/com_audio_source.js";

export function snd_growl(is_baby: boolean): AudioClip {
    return {
        Tracks: [
            {
                Instrument: [
                    8,
                    "lowpass",
                    7,
                    2,
                    false,
                    "sine",
                    8,
                    7,
                    [["sine", 8, 7, 8, 11, 7, true, false, 0, 0, 0]],
                ],
                Notes: [is_baby ? 79 : 50],
            },
        ],
        Exit: 6,
    };
}
