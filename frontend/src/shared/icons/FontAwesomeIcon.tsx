import React from 'react';

export interface IconDefinition {
  prefix: string;
  iconName: string;
  icon: [number, number, string[], string, string | string[]];
}

export type IconProp = IconDefinition;

export interface FontAwesomeIconProps extends React.SVGAttributes<SVGSVGElement> {
  icon: IconProp;
  size?: '2xs' | 'xs' | 'sm' | 'lg' | 'xl' | '2xl' | '1x' | '2x' | '3x';
  color?: string;
  spin?: boolean;
  pulse?: boolean;
  fixedWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

const SIZE_MAP: Record<string, string> = {
  '2xs': '0.625em',
  xs: '0.75em',
  sm: '0.875em',
  lg: '1.25em',
  xl: '1.5em',
  '2xl': '2em',
  '1x': '1em',
  '2x': '2em',
  '3x': '3em',
};

/**
 * Frontend/src/shared/icons/FontAwesomeIcon.tsx
 *
 * Chuẩn Icon FleetMonitor Enterprise (AGENTS.md Rule 7.1):
 * - Render chuẩn SVG vector của FontAwesome với viewBox và path chính xác.
 * - Hỗ trợ đầy đủ size, spin, color, fixedWidth và className.
 */
export const FontAwesomeIcon: React.FC<FontAwesomeIconProps> = ({
  icon,
  size,
  color,
  spin = false,
  pulse = false,
  fixedWidth = false,
  className = '',
  style = {},
  title,
  ...rest
}) => {
  if (!icon || !icon.icon) return null;

  const [width, height, , , svgPathData] = icon.icon;
  const paths = Array.isArray(svgPathData) ? svgPathData : [svgPathData];

  const calculatedSize = size ? SIZE_MAP[size] || size : undefined;

  const svgStyle: React.CSSProperties = {
    display: 'inline-block',
    height: calculatedSize || '1em',
    width: fixedWidth ? '1.25em' : calculatedSize || `${width / height}em`,
    verticalAlign: '-0.125em',
    fill: color || 'currentColor',
    overflow: 'visible',
    ...(spin ? { animation: 'fa-spin 2s infinite linear' } : {}),
    ...(pulse ? { animation: 'fa-spin 1s infinite steps(8)' } : {}),
    ...style,
  };

  return (
    <svg
      aria-hidden={title ? undefined : 'true'}
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      className={`svg-inline--fa fa-${icon.iconName} ${className}`}
      style={svgStyle}
      {...rest}
    >
      {title && <title>{title}</title>}
      {paths.map((d, index) => (
        <path key={index} fill={color || 'currentColor'} d={d} />
      ))}
    </svg>
  );
};

export default FontAwesomeIcon;

