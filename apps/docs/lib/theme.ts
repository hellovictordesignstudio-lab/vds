/**
 * VDS Theme — single source of truth for runtime color values.
 * These values MUST stay in sync with packages/tokens/src/tokens.json.
 * TODO v2: generate this file automatically from tokens.json via Style Dictionary
 * so there is only one source of truth.
 */

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

/** Resolved from color.primitive.* in packages/tokens/src/tokens.json */
const T = {
  neutral: {
    0: '#FFFFFF',
    50: '#F8F9FC',
    100: '#EFF1F5',
    200: '#DDE1EA',
    300: '#C5CBDA',
    400: '#9BA5BE',
    600: '#4A5270',
    900: '#0C0D10',
  },
  navy: {
    500: '#002b49',
    600: '#001e35',
    700: '#001528',
  },
  blue: {
    200: '#85B4DC',
    300: '#5B9FD4',
    400: '#3A85C0',
    500: '#1565A8',
    600: '#0F4F85',
  },
  green400: '#0A8853',
  red400: '#D22232',
  orange400: '#F07332',
  dark: {
    textBrandHover: '#7BB8E0',
    successText: '#34C77B',
    dangerText: '#F47B85',
    warningText: '#F9A97A',
  },
} as const;

export function buildTheme(isDark: boolean): VDSTheme {
  return {
    bg: {
      surface: {
        primary: {
          default: isDark ? '#0F1117' : T.neutral[0],
          hover: isDark ? '#161B27' : T.neutral[50],
        },
        secondary: {
          default: isDark ? '#161B27' : T.neutral[50],
          hover: isDark ? '#1E2435' : T.neutral[100],
        },
        tertiary: {
          default: isDark ? '#1E2435' : T.neutral[100],
          hover: isDark ? '#242B3D' : T.neutral[200],
        },
        inverse: { default: isDark ? T.neutral[50] : T.neutral[900] },
      },
      fill: {
        primary: {
          default: isDark ? T.blue[500] : T.navy[500],
          hover: isDark ? T.blue[400] : T.navy[600],
          active: isDark ? T.blue[600] : T.navy[700],
          disabled: isDark ? '#2E3550' : T.neutral[300],
        },
        secondary: {
          default: 'transparent',
          hover: isDark ? '#1E2435' : T.neutral[50],
          disabled: 'transparent',
        },
        brandSubtle: { default: isDark ? 'rgba(91,159,212,0.10)' : 'rgba(0,43,73,0.06)' },
        brandSubtle2: { default: isDark ? 'rgba(91,159,212,0.18)' : 'rgba(0,43,73,0.12)' },
        success: { default: isDark ? 'rgba(10,136,83,0.12)' : '#E6F5EE' },
        danger: { default: isDark ? 'rgba(210,34,50,0.12)' : '#FCEAEC' },
        warning: { default: isDark ? 'rgba(240,115,50,0.12)' : '#FEF2EB' },
      },
    },
    text: {
      primary: {
        default: isDark ? 'rgba(255,255,255,0.92)' : T.neutral[900],
        disabled: isDark ? 'rgba(255,255,255,0.30)' : T.neutral[400],
      },
      secondary: {
        default: isDark ? 'rgba(255,255,255,0.55)' : T.neutral[600],
        disabled: isDark ? 'rgba(255,255,255,0.25)' : T.neutral[400],
      },
      tertiary: {
        default: isDark ? 'rgba(255,255,255,0.30)' : T.neutral[400],
        disabled: isDark ? 'rgba(255,255,255,0.15)' : T.neutral[300],
      },
      inverse: { default: isDark ? T.neutral[900] : T.neutral[0] },
      brand: {
        default: isDark ? T.blue[300] : T.navy[500],
        hover: isDark ? T.dark.textBrandHover : T.navy[600],
        disabled: isDark ? 'rgba(255,255,255,0.25)' : T.neutral[400],
      },
      success: { default: isDark ? T.dark.successText : T.green400 },
      danger: { default: isDark ? T.dark.dangerText : T.red400 },
      warning: { default: isDark ? T.dark.warningText : T.orange400 },
    },
    border: {
      default: {
        default: isDark ? 'rgba(255,255,255,0.07)' : T.neutral[200],
        hover: isDark ? 'rgba(255,255,255,0.14)' : T.neutral[300],
      },
      strong: {
        default: isDark ? 'rgba(255,255,255,0.14)' : T.neutral[300],
        hover: isDark ? 'rgba(255,255,255,0.25)' : T.neutral[400],
      },
      brand: {
        default: isDark ? T.blue[400] : T.navy[500],
        hover: isDark ? T.blue[200] : T.navy[600],
        focus: isDark ? T.blue[400] : T.navy[500],
      },
      success: { default: isDark ? T.green400 : T.green400 },
      danger: { default: isDark ? T.red400 : T.red400 },
      warning: { default: isDark ? T.orange400 : T.orange400 },
    },
    icon: {
      primary: {
        default: isDark ? 'rgba(255,255,255,0.92)' : T.neutral[900],
        disabled: isDark ? 'rgba(255,255,255,0.25)' : T.neutral[400],
      },
      secondary: {
        default: isDark ? 'rgba(255,255,255,0.55)' : T.neutral[600],
        hover: isDark ? 'rgba(255,255,255,0.92)' : T.neutral[900],
        disabled: isDark ? 'rgba(255,255,255,0.25)' : T.neutral[400],
      },
      tertiary: { default: isDark ? 'rgba(255,255,255,0.30)' : T.neutral[400] },
      inverse: { default: isDark ? T.neutral[900] : T.neutral[0] },
      brand: {
        default: isDark ? T.blue[300] : T.navy[500],
        hover: isDark ? T.dark.textBrandHover : T.navy[600],
      },
      success: { default: isDark ? T.dark.successText : T.green400 },
      danger: { default: isDark ? T.dark.dangerText : T.red400 },
      warning: { default: isDark ? T.dark.warningText : T.orange400 },
    },
    shadow: {
      card: isDark ? '0 1px 4px rgba(0,0,0,0.6)' : '0 1px 4px rgba(0,0,0,0.06)',
      md: isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.10)',
      lg: isDark ? '0 8px 24px rgba(0,0,0,0.6)' : '0 8px 24px rgba(0,0,0,0.12)',
    },
  };
}
