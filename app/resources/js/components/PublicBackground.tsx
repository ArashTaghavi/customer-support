import { networkPaths, networkNodes } from './NetworkData';

export default function PublicBackground() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
        >
            <div className="neural-ambient absolute inset-0" />
            <div className="neural-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] bg-size-[28px_28px]" />
            <div className="absolute top-1/2 left-1/2 size-[600px] -translate-1/2 rounded-full border border-border/20" />
            <div className="absolute top-1/2 left-1/2 size-[480px] -translate-1/2 rounded-full border border-border/20" />
            <svg
                viewBox="0 0 1440 900"
                preserveAspectRatio="xMidYMid slice"
                fill="none"
                className="neural-network absolute inset-0 size-full"
            >
                {networkPaths.map((path) => (
                    <path
                        key={path}
                        d={path}
                        stroke="currentColor"
                        strokeWidth="1.1"
                    />
                ))}
                <g fill="currentColor" className="neural-nodes">
                    {networkNodes.map(([cx, cy]) => (
                        <circle
                            key={`${cx}-${cy}`}
                            cx={cx}
                            cy={cy}
                            r="2"
                            className="motion-safe:animate-pulse"
                            style={{
                                animationDuration: `${4 + (cx % 5)}s`,
                                animationDelay: `${-(cy % 7)}s`,
                            }}
                        />
                    ))}
                </g>
                <g stroke="currentColor">
                    <circle cx="280" cy="390" r="10" />
                    <circle cx="1150" cy="390" r="10" />
                </g>
                {networkPaths.map((path, index) => (
                    <g key={path} className="neural-pulse motion-reduce:hidden">
                        <circle r="6" fill="currentColor" opacity="0.08" />
                        <circle r="3.5" fill="currentColor" opacity="0.16" />
                        <circle
                            r="1.5"
                            fill="currentColor"
                            className="neural-light"
                        />
                        <circle r="0.6" className="neural-core" />
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
