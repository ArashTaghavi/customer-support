import blackKey1 from '../../assets/sounds/typewriter/cherry-black-key-1.wav?url';
import blackKey2 from '../../assets/sounds/typewriter/cherry-black-key-2.wav?url';
import blackKey3 from '../../assets/sounds/typewriter/cherry-black-key-3.wav?url';
import blackKey4 from '../../assets/sounds/typewriter/cherry-black-key-4.wav?url';
import blackSpace1 from '../../assets/sounds/typewriter/cherry-black-space-1.wav?url';
import blackErase1 from '../../assets/sounds/typewriter/cherry-black-erase-1.wav?url';
import topreKey1 from '../../assets/sounds/typewriter/topre-key-1.wav?url';
import topreKey2 from '../../assets/sounds/typewriter/topre-key-2.wav?url';
import topreKey3 from '../../assets/sounds/typewriter/topre-key-3.wav?url';
import topreKey4 from '../../assets/sounds/typewriter/topre-key-4.wav?url';
import topreSpace1 from '../../assets/sounds/typewriter/topre-space-1.wav?url';
import topreErase1 from '../../assets/sounds/typewriter/topre-erase-1.wav?url';
import rainyKey1 from '../../assets/sounds/typewriter/rainy75-key-1.wav?url';
import rainyKey2 from '../../assets/sounds/typewriter/rainy75-key-2.wav?url';
import rainyKey3 from '../../assets/sounds/typewriter/rainy75-key-3.wav?url';
import rainyKey4 from '../../assets/sounds/typewriter/rainy75-key-4.wav?url';
import rainySpace1 from '../../assets/sounds/typewriter/rainy75-space-1.wav?url';
import rainyErase1 from '../../assets/sounds/typewriter/rainy75-erase-1.wav?url';
import technicsKey1 from '../../assets/sounds/typewriter/technics-yellow-key-1.wav?url';
import technicsKey2 from '../../assets/sounds/typewriter/technics-yellow-key-2.wav?url';
import technicsKey3 from '../../assets/sounds/typewriter/technics-yellow-key-3.wav?url';
import technicsKey4 from '../../assets/sounds/typewriter/technics-yellow-key-4.wav?url';
import technicsSpace1 from '../../assets/sounds/typewriter/technics-yellow-space-1.wav?url';
import technicsErase1 from '../../assets/sounds/typewriter/technics-yellow-erase-1.wav?url';
import blueRecording from '../../assets/sounds/typewriter/cherry-mx-blue-typing.mp3?url';
import typewriterKey from '../../assets/sounds/typewriter/key.mp3?url';
import typewriterSpace from '../../assets/sounds/typewriter/space.mp3?url';
import brownPress from '../../assets/sounds/typewriter/cherry-mx-brown-press.mp3?url';
import brownRelease from '../../assets/sounds/typewriter/cherry-mx-brown-release.mp3?url';
import blueSpace from '../../assets/sounds/typewriter/blue-switch-spacebar-balanced.mp3?url';
import whitefoxKey1 from '../../assets/sounds/typewriter/whitefox-hako-violet-key-1.mp3?url';
import whitefoxKey2 from '../../assets/sounds/typewriter/whitefox-hako-violet-key-2.mp3?url';
import whitefoxKey3 from '../../assets/sounds/typewriter/whitefox-hako-violet-key-3.mp3?url';
import whitefoxKey4 from '../../assets/sounds/typewriter/whitefox-hako-violet-key-4.mp3?url';
import redKey1 from '../../assets/sounds/typewriter/cherry-red-key-1.wav?url';
import redKey2 from '../../assets/sounds/typewriter/cherry-red-key-2.wav?url';
import redKey3 from '../../assets/sounds/typewriter/cherry-red-key-3.wav?url';
import redKey4 from '../../assets/sounds/typewriter/cherry-red-key-4.wav?url';
import gateronKey1 from '../../assets/sounds/typewriter/gateron-red-key-1.wav?url';
import gateronKey2 from '../../assets/sounds/typewriter/gateron-red-key-2.wav?url';
import gateronKey3 from '../../assets/sounds/typewriter/gateron-red-key-3.wav?url';
import gateronKey4 from '../../assets/sounds/typewriter/gateron-red-key-4.wav?url';
import modelFKey1 from '../../assets/sounds/typewriter/ibm-model-f-key-1.wav?url';
import modelFKey2 from '../../assets/sounds/typewriter/ibm-model-f-key-2.wav?url';
import modelFKey3 from '../../assets/sounds/typewriter/ibm-model-f-key-3.wav?url';
import modelFKey4 from '../../assets/sounds/typewriter/ibm-model-f-key-4.wav?url';
import tactileKey1 from '../../assets/sounds/typewriter/tactile-1.wav?url';
import tactileKey2 from '../../assets/sounds/typewriter/tactile-2.wav?url';
import tactileKey3 from '../../assets/sounds/typewriter/tactile-3.wav?url';
import tactileKey4 from '../../assets/sounds/typewriter/tactile-4.wav?url';

export const keyboardSounds = [
    {
        id: 'typewriter',
        label: 'Hermes · Typewriter',
        type: [typewriterKey],
        space: [typewriterSpace],
        erase: [typewriterSpace],
    },
    {
        id: 'brown',
        label: 'Cherry MX Brown',
        type: [brownPress],
        space: [brownPress],
        erase: [brownRelease],
    },
    {
        id: 'blue',
        label: 'Cherry MX Blue',
        type: [133.53147, 134.11515, 135.12785, 135.79134].map(
            (start) => `${blueRecording}#start=${start}&duration=0.32`,
        ),
        space: [blueSpace],
        erase: [`${blueRecording}#start=135.79134&duration=0.32`],
    },
    {
        id: 'whitefox',
        label: 'WhiteFox · Hako Violet',
        type: [whitefoxKey1, whitefoxKey2, whitefoxKey3, whitefoxKey4],
        space: [whitefoxKey2],
        erase: [whitefoxKey4],
    },
    {
        id: 'red',
        label: 'Cherry MX Red · Corsair K95',
        type: [redKey1, redKey2, redKey3, redKey4],
        space: [redKey4],
        erase: [redKey3],
    },
    {
        id: 'gateron-red',
        label: 'Gateron Red · GMMK TKL',
        type: [gateronKey1, gateronKey2, gateronKey3, gateronKey4],
        space: [gateronKey4],
        erase: [gateronKey3],
    },
    {
        id: 'model-f',
        label: 'IBM Model F · Buckling Spring',
        type: [modelFKey1, modelFKey2, modelFKey3, modelFKey4],
        space: [modelFKey4],
        erase: [modelFKey3],
    },
    {
        id: 'tactile',
        label: 'Tactile · StavSounds',
        type: [tactileKey1, tactileKey2, tactileKey3, tactileKey4],
        space: [tactileKey3],
        erase: [tactileKey4],
    },
    {
        id: 'cherry-black',
        label: 'Cherry MX Black ? Leopold FC980M',
        type: [blackKey1, blackKey2, blackKey3, blackKey4],
        space: [blackSpace1],
        erase: [blackErase1],
    },
    {
        id: 'topre',
        label: 'Topre ? HHKB Hybrid',
        type: [topreKey1, topreKey2, topreKey3, topreKey4],
        space: [topreSpace1],
        erase: [topreErase1],
    },
    {
        id: 'rainy75',
        label: 'Rainy 75',
        type: [rainyKey1, rainyKey2, rainyKey3, rainyKey4],
        space: [rainySpace1],
        erase: [rainyErase1],
    },
    {
        id: 'technics-yellow',
        label: 'Gateron Yellow ? Vintage Technics',
        type: [technicsKey1, technicsKey2, technicsKey3, technicsKey4],
        space: [technicsSpace1],
        erase: [technicsErase1],
    },
] as const;

export type KeyboardSoundId = (typeof keyboardSounds)[number]['id'];
