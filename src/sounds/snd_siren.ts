import {AudioClip} from "../components/com_audio_source.js";

export let snd_siren: AudioClip = {
    Tracks: [
        {
            Instrument: [
                5,
                "lowpass",
                8,
                0,
                false,
                "square",
                3,
                3,
                [["square", 8, 8, 11, 12, 7, true, false, 0, 0, 0]],
            ],
            Notes: [65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76],
            Randomize: true,
        },
    ],
    Exit: 9,
};
