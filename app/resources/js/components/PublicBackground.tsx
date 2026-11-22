import { networkPaths, networkNodes } from './NetworkData';

export default function PublicBackground() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
        >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.25),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0c_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] bg-size-[28px_28px]" />
            <div className="absolute top-1/2 left-1/2 size-[600px] -translate-1/2 rounded-full border border-white/4" />
            <div className="absolute top-1/2 left-1/2 size-[480px] -translate-1/2 rounded-full border border-white/4" />
            <svg
                viewBox="0 0 1440 900"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
                className="absolute inset-0 size-full text-violet-300/13"
            >
                {networkPaths.map((path) => (
                    <path
                        key={path}
                        d={path}
                        stroke="currentColor"
                        strokeWidth="1.1"
                    />
                ))}
                <g
                    fill="currentColor"
                    className="animate-[pulse_5s_ease-in-out_infinite] text-violet-200/27 motion-reduce:animate-none"
                >
                    {networkNodes.map(([cx, cy]) => (
                        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" />
                    ))}
                </g>
                <g stroke="currentColor">
                    <circle cx="280" cy="390" r="10" />
                    <circle cx="1150" cy="390" r="10" />
                </g>
                {networkPaths.map((path, index) => (
                    <g
                        key={path}
                        className="text-cyan-300 motion-reduce:hidden"
                    >
                        <circle r="6" fill="currentColor" opacity="0.08" />
                        <circle r="3.5" fill="currentColor" opacity="0.16" />
                        <circle
                            r="1.5"
                            fill="currentColor"
                            className="drop-shadow-[0_0_4px_#67e8f9]"
                        />
                        <circle r="0.6" fill="#ecfeff" />
                        <animateMotion
                            path={path}
                            dur={`${12 + (index % 6) * 2.25}s`}
                            begin={`${-index * 3}s`}
                            repeatCount="indefinite"
                        />
                    </g>
                ))}
            </svg>
        </div>
    );
}
