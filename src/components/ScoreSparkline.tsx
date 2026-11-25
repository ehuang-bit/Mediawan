import React from 'react';
import { CertaintyLevel, MaturityStage, TrajectoryPoint } from '../types';

interface ScoreSparklineProps {
  id: string;
  trajectory: TrajectoryPoint[];
  maturity: MaturityStage;
  certainty: CertaintyLevel;
}

export const ScoreSparkline: React.FC<ScoreSparklineProps> = ({
  id,
  trajectory,
  maturity,
  certainty,
}) => {
  const values =
    trajectory.length >= 2
      ? trajectory.map((pt) => pt.socialVelocity)
      : [20, 42, 68];

  const width = 112;
  const height = 26;
  const padX = 3;
  const padY = 4;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 100);
  const span = Math.max(10, max - min);

  const coords = values.map((val, idx) => {
    const x = padX + (idx / (values.length - 1)) * plotW;
    const y = padY + plotH - ((val - min) / span) * plotH;
    return { x, y };
  });

  const linePath = coords
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  const last = coords[coords.length - 1];
  const first = coords[0];
  const areaPath = `${linePath} L ${last.x.toFixed(1)} ${height} L ${first.x.toFixed(
    1
  )} ${height} Z`;

  const strokeColor =
    maturity === 'Past Era'
      ? '#D24C44'
      : maturity === 'Early Spark' && certainty === 'High Uncertainty'
      ? '#D9822B'
      : '#55A852';

  const gradId = `spark-grad-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible block"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.85"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last.x}
        cy={last.y}
        r="2.4"
        fill={strokeColor}
        stroke="currentColor"
        className="text-white dark:text-[#302E2B]"
        strokeWidth="1"
      />
    </svg>
  );
};
