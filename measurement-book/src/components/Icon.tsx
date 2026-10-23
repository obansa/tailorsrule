import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'back'
  | 'edit'
  | 'plus'
  | 'search'
  | 'users'
  | 'settings'
  | 'check'
  | 'trash'
  | 'info'
  | 'share'
  | 'copy'
  | 'phone'
  | 'chat'
  | 'cloud';

interface Props {
  name: IconName;
  size?: number;
  color: string;
}

export function Icon({ name, size = 22, color }: Props) {
  const p = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'back':
      return <Svg {...p}><Path d="M15 5l-7 7 7 7" /></Svg>;
    case 'edit':
      return <Svg {...p}><Path d="M4 20h4L19 9l-4-4L4 16z" /></Svg>;
    case 'plus':
      return <Svg {...p}><Path d="M12 5v14M5 12h14" /></Svg>;
    case 'search':
      return <Svg {...p}><Circle cx="11" cy="11" r="7" /><Path d="M20 20l-4-4" /></Svg>;
    case 'users':
      return <Svg {...p}><Circle cx="9" cy="8" r="4" /><Path d="M2 21c0-4 3-6 7-6s7 2 7 6M17 4a4 4 0 010 8M22 21c0-3-2-5-4-5.5" /></Svg>;
    case 'settings':
      return <Svg {...p}><Circle cx="12" cy="12" r="3" /><Path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></Svg>;
    case 'check':
      return <Svg {...p}><Path d="M5 12l5 5 9-10" /></Svg>;
    case 'trash':
      return <Svg {...p}><Path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></Svg>;
    case 'info':
      return <Svg {...p}><Circle cx="12" cy="12" r="9" /><Path d="M12 11v5M12 8h.01" /></Svg>;
    case 'share':
      return <Svg {...p}><Path d="M12 3v12M8 7l4-4 4 4M5 13v7h14v-7" /></Svg>;
    case 'copy':
      return <Svg {...p}><Rect x="8" y="8" width="12" height="12" rx="2" /><Path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3" /></Svg>;
    case 'phone':
      return <Svg {...p}><Path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" /></Svg>;
    case 'chat':
      return <Svg {...p}><Path d="M4 5h16v11H9l-5 4z" /></Svg>;
    case 'cloud':
      return <Svg {...p}><Path d="M7 18a4 4 0 010-8 5 5 0 019.6-1A4.5 4.5 0 0117 18z" /></Svg>;
  }
}
