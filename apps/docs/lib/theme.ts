export interface VDSTheme {
  bg: {
    surface: {
      primary: { default: string; hover: string };
      secondary: { default: string; hover: string };
      tertiary: { default: string; hover: string };
      inverse: { default: string };
    };
    fill: {
      primary: { default: string; hover: string; active: string; disabled: string };
      secondary: { default: string; hover: string; disabled: string };
      brandSubtle: { default: string };
      /** Second-layer brand tint (legacy --color-brand-subtle-2). */
      brandSubtle2: { default: string };
      success: { default: string };
      danger: { default: string };
      warning: { default: string };
    };
  };
  text: {
    primary: { default: string; disabled: string };
    secondary: { default: string; disabled: string };
    tertiary: { default: string; disabled: string };
    inverse: { default: string };
    brand: { default: string; hover: string; disabled: string };
    success: { default: string };
    danger: { default: string };
    warning: { default: string };
  };
  border: {
    default: { default: string; hover: string };
    strong: { default: string; hover: string };
    brand: { default: string; hover: string; focus: string };
    success: { default: string };
    danger: { default: string };
    warning: { default: string };
  };
  icon: {
    primary: { default: string; disabled: string };
    secondary: { default: string; hover: string; disabled: string };
    tertiary: { default: string };
    inverse: { default: string };
    brand: { default: string; hover: string };
    success: { default: string };
    danger: { default: string };
    warning: { default: string };
  };
  shadow: {
    card: string;
    md: string;
    lg: string;
  };
}

export function buildTheme(isDark: boolean): VDSTheme {
  return {
    bg: {
      surface: {
        primary: { default: isDark ? '#0F1117' : '#FFFFFF', hover: isDark ? '#161B27' : '#F8F9FC' },
        secondary: { default: isDark ? '#161B27' : '#F8F9FC', hover: isDark ? '#1E2435' : '#EFF1F5' },
        tertiary: { default: isDark ? '#1E2435' : '#EFF1F5', hover: isDark ? '#242B3D' : '#DDE1EA' },
        inverse: { default: isDark ? '#F8F9FC' : '#0C0D10' },
      },
      fill: {
        primary: {
          default: isDark ? '#1565A8' : '#002b49',
          hover: isDark ? '#1A72BC' : '#003d69',
          active: isDark ? '#0F4F85' : '#001a33',
          disabled: isDark ? '#2E3550' : '#C5CBDA',
        },
        secondary: { default: 'transparent', hover: isDark ? '#1E2435' : '#F8F9FC', disabled: 'transparent' },
        brandSubtle: { default: isDark ? 'rgba(91,159,212,0.10)' : 'rgba(0,43,73,0.06)' },
        brandSubtle2: { default: isDark ? 'rgba(91,159,212,0.18)' : 'rgba(0,43,73,0.12)' },
        success: { default: isDark ? 'rgba(10,136,83,0.12)' : '#E6F5EE' },
        danger: { default: isDark ? 'rgba(210,34,50,0.12)' : '#FCEAEC' },
        warning: { default: isDark ? 'rgba(240,115,50,0.12)' : '#FEF2EB' },
      },
    },
    text: {
      primary: {
        default: isDark ? 'rgba(255,255,255,0.92)' : '#0C0D10',
        disabled: isDark ? 'rgba(255,255,255,0.30)' : '#9BA5BE',
      },
      secondary: {
        default: isDark ? 'rgba(255,255,255,0.55)' : '#4A5270',
        disabled: isDark ? 'rgba(255,255,255,0.25)' : '#9BA5BE',
      },
      tertiary: {
        default: isDark ? 'rgba(255,255,255,0.30)' : '#9BA5BE',
        disabled: isDark ? 'rgba(255,255,255,0.15)' : '#C5CBDA',
      },
      inverse: { default: isDark ? '#0C0D10' : '#FFFFFF' },
      brand: {
        default: isDark ? '#5B9FD4' : '#002b49',
        hover: isDark ? '#7BB8E0' : '#003d69',
        disabled: isDark ? 'rgba(255,255,255,0.25)' : '#9BA5BE',
      },
      success: { default: isDark ? '#34C77B' : '#0A8853' },
      danger: { default: isDark ? '#F47B85' : '#D22232' },
      warning: { default: isDark ? '#F9A97A' : '#F07332' },
    },
    border: {
      default: {
        default: isDark ? 'rgba(255,255,255,0.07)' : '#DDE1EA',
        hover: isDark ? 'rgba(255,255,255,0.14)' : '#C5CBDA',
      },
      strong: {
        default: isDark ? 'rgba(255,255,255,0.14)' : '#C5CBDA',
        hover: isDark ? 'rgba(255,255,255,0.25)' : '#9BA5BE',
      },
      brand: {
        default: isDark ? '#3A7DAE' : '#002b49',
        hover: isDark ? '#4D8FBE' : '#003d69',
        focus: isDark ? '#3A7DAE' : '#002b49',
      },
      success: { default: isDark ? '#0A8853' : '#0A8853' },
      danger: { default: isDark ? '#D22232' : '#D22232' },
      warning: { default: isDark ? '#F07332' : '#F07332' },
    },
    icon: {
      primary: {
        default: isDark ? 'rgba(255,255,255,0.92)' : '#0C0D10',
        disabled: isDark ? 'rgba(255,255,255,0.25)' : '#9BA5BE',
      },
      secondary: {
        default: isDark ? 'rgba(255,255,255,0.55)' : '#4A5270',
        hover: isDark ? 'rgba(255,255,255,0.92)' : '#0C0D10',
        disabled: isDark ? 'rgba(255,255,255,0.25)' : '#9BA5BE',
      },
      tertiary: { default: isDark ? 'rgba(255,255,255,0.30)' : '#9BA5BE' },
      inverse: { default: isDark ? '#0C0D10' : '#FFFFFF' },
      brand: { default: isDark ? '#5B9FD4' : '#002b49', hover: isDark ? '#7BB8E0' : '#003d69' },
      success: { default: isDark ? '#34C77B' : '#0A8853' },
      danger: { default: isDark ? '#F47B85' : '#D22232' },
      warning: { default: isDark ? '#F9A97A' : '#F07332' },
    },
    shadow: {
      card: isDark ? '0 1px 4px rgba(0,0,0,0.6)' : '0 1px 4px rgba(0,0,0,0.06)',
      md: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.10)',
      lg: isDark ? '0 8px 24px rgba(0,0,0,0.6)' : '0 8px 24px rgba(0,0,0,0.12)',
    },
  };
}
