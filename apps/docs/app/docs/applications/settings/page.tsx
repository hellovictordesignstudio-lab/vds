'use client';

import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Bell,
  Camera,
  Check,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Globe,
  Lock,
  LogOut,
  Palette,
  Plus,
  Save,
  Shield,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Button } from '@/components/vds/Button';

function getResolvedIsDark(): boolean {
  if (typeof document === 'undefined') return false;
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);

  useLayoutEffect(() => {
    setIsDark(getResolvedIsDark());
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(getResolvedIsDark());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setIsDark(getResolvedIsDark());
    mq.addEventListener('change', onChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', onChange);
    };
  }, []);

  return isDark;
}

function chipStyleA(overrides?: CSSProperties): CSSProperties {
  return {
    background: 'rgba(10,136,83,0.10)',
    color: '#0A8853',
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    ...overrides,
  };
}

const SW_DIMS = { track: [28, 16] as const, thumb: 12, offset: 14 } as const;

function SwitchControl({
  t,
  checked,
  onChange,
}: {
  t: VDSTheme;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const d = SW_DIMS;
  const [tw, th] = d.track;
  const borderColor = checked ? t.border.brand.default : t.border.strong.default;
  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      style={{
        width: tw,
        height: th,
        borderRadius: 9999,
        background: checked ? t.bg.fill.primary.default : t.bg.surface.tertiary.default,
        border: `1.5px solid ${borderColor}`,
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 200ms, border-color 200ms',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: d.thumb,
          height: d.thumb,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          position: 'absolute',
          top: '50%',
          left: 0,
          transform: `translateY(-50%) translateX(${checked ? d.offset : 2}px)`,
          transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      />
    </div>
  );
}

const INPUT_SM = { h: 32, px: '0 10px', fs: 13 } as const;

function FieldLabel({ t, children }: { t: VDSTheme; children: string }) {
  return (
    <label
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: t.text.primary.default,
        display: 'block',
        marginBottom: 6,
      }}
    >
      {children}
    </label>
  );
}

function TextInputField({
  t,
  label,
  value,
  type = 'text',
  placeholder,
  leftAddon,
}: {
  t: VDSTheme;
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  leftAddon?: string;
}) {
  const inner = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: INPUT_SM.h,
        border: `1.5px solid ${t.border.strong.default}`,
        borderRadius: 8,
        background: t.bg.surface.primary.default,
        padding: INPUT_SM.px,
        gap: 8,
        boxSizing: 'border-box',
      }}
    >
      {leftAddon ? (
        <span style={{ fontSize: INPUT_SM.fs, fontWeight: 600, color: t.text.tertiary.default }}>{leftAddon}</span>
      ) : null}
      <input
        type={type}
        value={value}
        readOnly
        placeholder={placeholder}
        style={{
          flex: 1,
          minWidth: 0,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: INPUT_SM.fs,
          color: t.text.primary.default,
          fontFamily: 'inherit',
        }}
      />
    </div>
  );

  return (
    <div>
      <FieldLabel t={t}>{label}</FieldLabel>
      {inner}
    </div>
  );
}

function TextInputControlled({
  t,
  label,
  value,
  onChange,
  placeholder,
}: {
  t: VDSTheme;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel t={t}>{label}</FieldLabel>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: INPUT_SM.h,
          border: `1.5px solid ${t.border.strong.default}`,
          borderRadius: 8,
          background: t.bg.surface.primary.default,
          padding: INPUT_SM.px,
          gap: 8,
          boxSizing: 'border-box',
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: INPUT_SM.fs,
            color: t.text.primary.default,
            fontFamily: 'inherit',
          }}
        />
      </div>
    </div>
  );
}

function SelectField({
  t,
  label,
  value,
  options,
}: {
  t: VDSTheme;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <FieldLabel t={t}>{label}</FieldLabel>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          disabled
          aria-readonly="true"
          style={{
            width: '100%',
            height: INPUT_SM.h,
            borderRadius: 8,
            border: `1.5px solid ${t.border.strong.default}`,
            background: t.bg.surface.primary.default,
            padding: `0 32px 0 10px`,
            fontSize: INPUT_SM.fs,
            color: t.text.primary.default,
            fontFamily: 'inherit',
            appearance: 'none',
            cursor: 'default',
            opacity: 1,
          }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function TextAreaField({
  t,
  label,
  placeholder,
  rows,
}: {
  t: VDSTheme;
  label: string;
  placeholder: string;
  rows: number;
}) {
  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <FieldLabel t={t}>{label}</FieldLabel>
      <textarea
        placeholder={placeholder}
        rows={rows}
        readOnly
        style={{
          width: '100%',
          resize: 'vertical',
          minHeight: rows * 22,
          borderRadius: 8,
          border: `1.5px solid ${t.border.strong.default}`,
          background: t.bg.surface.primary.default,
          padding: '10px 12px',
          fontSize: 13,
          color: t.text.primary.default,
          fontFamily: 'inherit',
          lineHeight: 1.45,
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
] as const;

type FrameChip = { label: string; href: string };

const COMPONENT_GROUPS: { title: string; chips: FrameChip[] }[] = [
  {
    title: 'Navigation',
    chips: [
      { label: 'Navigation', href: '/docs/components/navigation' },
      { label: 'Badge', href: '/docs/components/badge' },
    ],
  },
  {
    title: 'Forms',
    chips: [
      { label: 'Text Input', href: '/docs/components/text-input' },
      { label: 'Select', href: '/docs/components/select' },
      { label: 'Switch', href: '/docs/components/switch' },
      { label: 'Avatar upload', href: '/docs/components/file-upload' },
    ],
  },
  {
    title: 'Overlays',
    chips: [
      { label: 'Modal', href: '/docs/components/modal' },
      { label: 'Alert', href: '/docs/components/alert' },
    ],
  },
  {
    title: 'Actions',
    chips: [
      { label: 'Button', href: '/docs/components/button' },
      { label: 'Divider', href: '/docs/components/divider' },
    ],
  },
];

const SETTINGS_NAV: {
  Icon: typeof User;
  label: string;
  badge?: string;
}[] = [
  { Icon: User, label: 'Profile', badge: undefined },
  { Icon: Lock, label: 'Security', badge: undefined },
  { Icon: Bell, label: 'Notifications', badge: '3' },
  { Icon: CreditCard, label: 'Billing', badge: undefined },
  { Icon: Users, label: 'Team', badge: undefined },
  { Icon: Globe, label: 'Language', badge: undefined },
  { Icon: Palette, label: 'Appearance', badge: undefined },
  { Icon: Shield, label: 'Privacy', badge: undefined },
];

const OVERLAY_BG = 'rgba(12,13,16,0.6)';

export default function ApplicationsSettingsPage() {
  const router = useRouter();
  const docDark = useIsDark();
  const tDoc = buildTheme(docDark);

  const [frameIsDark, setFrameIsDark] = useState(false);
  const t = buildTheme(frameIsDark);

  const [avatarHover, setAvatarHover] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const goChip = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  return (
    <>
      <p
        className="breadcrumb"
        style={{ display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none', letterSpacing: 'normal' }}
      >
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Applications</span>
        <ChevronRight size={14} aria-hidden style={{ opacity: 0.5 }} />
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Settings</span>
      </p>
      <h1 className="page-title">Settings</h1>
      <p className="page-lead">
        A complete settings page built from VDS components. Demonstrates Navigation, Forms, Toggles, Modals, and Danger zones
        composing into a real product interface.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 16 }}>
        <span style={chipStyleA()}>Application layout</span>
        <span style={{ color: tDoc.text.tertiary.default, fontSize: 12 }}>·</span>
        <span style={chipStyleA()}>Forms &amp; inputs</span>
        <span style={{ color: tDoc.text.tertiary.default, fontSize: 12 }}>·</span>
        <span style={chipStyleA()}>Light &amp; Dark</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: tDoc.text.secondary.default }}>Appearance</span>
        <div
          className="seg-control"
          style={{ width: 'auto', minWidth: 0 }}
          role="group"
          aria-label="App frame appearance"
        >
          <button
            type="button"
            className={`seg-option seg-option--compact${!frameIsDark ? ' seg-active' : ''}`}
            onClick={() => setFrameIsDark(false)}
          >
            Light
          </button>
          <button
            type="button"
            className={`seg-option seg-option--compact${frameIsDark ? ' seg-active' : ''}`}
            onClick={() => setFrameIsDark(true)}
          >
            Dark
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: 32,
          border: `1px solid ${t.border.default.default}`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: t.shadow.lg,
          height: 720,
          display: 'flex',
          flexDirection: 'column',
          background: t.bg.surface.primary.default,
          position: 'relative',
        }}
        data-theme={frameIsDark ? 'dark' : 'light'}
      >
        <div
          style={{
            height: 36,
            background: t.bg.surface.secondary.default,
            borderBottom: `1px solid ${t.border.default.default}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F57' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#FEBC2E' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28C840' }} />
          </div>
          <div
            style={{
              flex: 1,
              background: t.bg.surface.tertiary.default,
              borderRadius: 6,
              padding: '3px 12px',
              fontSize: 11,
              color: t.text.tertiary.default,
              textAlign: 'center',
            }}
          >
            app.example.com/settings
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          <aside
            style={{
              width: 220,
              flexShrink: 0,
              background: t.bg.surface.primary.default,
              borderRight: `1px solid ${t.border.default.default}`,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <div style={{ padding: '16px 14px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: t.text.primary.default, margin: '0 0 16px' }}>Settings</h3>
              <nav aria-label="Settings sections" style={{ flex: 1, overflow: 'auto' }}>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {SETTINGS_NAV.map(({ Icon, label, badge }, i) => {
                    const active = i === 0;
                    return (
                      <li key={label}>
                        <div
                          role="button"
                          tabIndex={0}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 9,
                            padding: '7px 10px',
                            margin: '0 4px',
                            borderRadius: 7,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 100ms',
                            ...(active
                              ? {
                                  background: t.bg.fill.brandSubtle.default,
                                  color: t.text.brand.default,
                                  borderLeft: `2px solid ${t.text.brand.default}`,
                                }
                              : {
                                  color: t.text.secondary.default,
                                  borderLeft: '2px solid transparent',
                                }),
                          }}
                        >
                          <Icon size={15} aria-hidden />
                          <span style={{ flex: 1 }}>{label}</span>
                          {badge ? (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: t.bg.fill.danger.default,
                                color: t.text.danger.default,
                              }}
                            >
                              {badge}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div
                style={{
                  height: 1,
                  background: t.border.default.default,
                  margin: '8px 4px',
                }}
              />
            </div>

            <div
              style={{
                marginTop: 'auto',
                borderTop: `1px solid ${t.border.default.default}`,
                padding: 8,
              }}
            >
              <div
                role="button"
                tabIndex={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  marginBottom: 4,
                }}
              >
                <ExternalLink size={13} color={t.text.tertiary.default} aria-hidden />
                <span style={{ fontSize: 11, fontWeight: 600, color: t.text.tertiary.default }}>Documentation</span>
              </div>
              <div
                role="button"
                tabIndex={0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={13} color="#D22232" aria-hidden />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#D22232' }}>Sign out</span>
              </div>
            </div>
          </aside>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: 'auto',
              background: t.bg.surface.secondary.default,
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: t.text.primary.default, margin: 0 }}>Profile</h2>
              <p style={{ fontSize: 12, color: t.text.tertiary.default, margin: '3px 0 0' }}>
                Manage your personal information and preferences
              </p>
            </div>

            {/* Profile photo */}
            <section
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 4 }}>Profile photo</div>
              <p style={{ fontSize: 12, color: t.text.tertiary.default, margin: '0 0 16px' }}>
                This will be displayed on your profile and in team views.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setAvatarHover(true)}
                  onMouseLeave={() => setAvatarHover(false)}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: t.bg.fill.primary.default,
                      color: '#FFFFFF',
                      fontSize: 18,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    VM
                  </div>
                  {avatarHover ? (
                    <div
                      role="button"
                      tabIndex={0}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Camera size={18} color="#FFFFFF" aria-hidden />
                    </div>
                  ) : null}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Button variant="secondary" size="sm" leftIcon={<Plus size={14} aria-hidden />}>
                      Upload photo
                    </Button>
                    <button
                      type="button"
                      className="vds-button vds-button--tertiary vds-button--sm"
                      style={{ color: '#D22232' }}
                    >
                      Remove
                    </button>
                  </div>
                  <div style={{ fontSize: 11, color: t.text.tertiary.default, marginTop: 6 }}>JPG, PNG or GIF. Max 2MB.</div>
                </div>
              </div>
            </section>

            {/* Personal info */}
            <section
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 16 }}>
                Personal information
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 14,
                }}
              >
                <TextInputField t={t} label="First name" value="Victor" />
                <TextInputField t={t} label="Last name" value="Cardero" />
                <div style={{ gridColumn: '1 / -1' }}>
                  <TextInputField t={t} label="Email address" value="vmcardero@gmail.com" type="email" />
                </div>
                <TextInputField t={t} label="Username" value="victor" leftAddon="@" />
                <SelectField t={t} label="Timezone" value="America/New_York" options={[...TIMEZONES]} />
                <TextAreaField
                  t={t}
                  label="Bio"
                  placeholder="Tell your team about yourself..."
                  rows={3}
                />
              </div>
              <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button variant="tertiary" size="sm">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" leftIcon={<Save size={14} aria-hidden />}>
                  Save changes
                </Button>
              </div>
            </section>

            {/* Preferences */}
            <section
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 16 }}>Preferences</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  {
                    label: 'Email notifications',
                    desc: 'Receive updates via email',
                    on: emailNotif,
                    set: setEmailNotif,
                  },
                  {
                    label: 'Push notifications',
                    desc: 'Browser and mobile alerts',
                    on: pushNotif,
                    set: setPushNotif,
                  },
                  {
                    label: 'Weekly digest',
                    desc: 'Summary of activity every Monday',
                    on: weeklyDigest,
                    set: setWeeklyDigest,
                  },
                  {
                    label: 'Marketing emails',
                    desc: 'Product updates and announcements',
                    on: marketing,
                    set: setMarketing,
                  },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '11px 0',
                      borderBottom: i < arr.length - 1 ? `1px solid ${t.border.default.default}` : 'none',
                      gap: 16,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default }}>{row.label}</div>
                      <div style={{ fontSize: 11, color: t.text.tertiary.default, marginTop: 2 }}>{row.desc}</div>
                    </div>
                    <SwitchControl t={t} checked={row.on} onChange={row.set} />
                  </div>
                ))}
              </div>
            </section>

            {/* Connected accounts */}
            <section
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default, marginBottom: 16 }}>
                Connected accounts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  {
                    name: 'GitHub',
                    initials: 'GH',
                    bg: '#24292E',
                    connected: true,
                  },
                  {
                    name: 'Google',
                    initials: 'G',
                    bg: '#4285F4',
                    connected: true,
                  },
                  {
                    name: 'Figma',
                    initials: 'F',
                    bg: '#FF7262',
                    connected: false,
                  },
                ].map((acct, i, arr) => (
                  <div
                    key={acct.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: i < arr.length - 1 ? `1px solid ${t.border.default.default}` : 'none',
                      gap: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: acct.bg,
                          color: '#FFFFFF',
                          fontSize: 10,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {acct.initials}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default }}>{acct.name}</span>
                      {acct.connected ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: 'rgba(10,136,83,0.10)',
                            color: '#0A8853',
                          }}
                        >
                          <Check size={10} strokeWidth={3} aria-hidden />
                          Connected
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: t.bg.surface.tertiary.default,
                            color: t.text.secondary.default,
                          }}
                        >
                          Not connected
                        </span>
                      )}
                    </div>
                    {acct.connected ? (
                      <Button variant="tertiary" size="sm">
                        Disconnect
                      </Button>
                    ) : (
                      <Button variant="secondary" size="sm">
                        Connect
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Danger zone */}
            <section
              style={{
                background: t.bg.surface.primary.default,
                border: '1px solid #D22232',
                borderRadius: 12,
                padding: '20px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertCircle size={16} color="#D22232" aria-hidden />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#D22232' }}>Danger zone</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default }}>Export your data</div>
                    <div style={{ fontSize: 12, color: t.text.tertiary.default, marginTop: 2 }}>
                      Download a copy of all your data in JSON format.
                    </div>
                  </div>
                  <Button variant="tertiary" size="sm">
                    Export data
                  </Button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#D22232' }}>Delete account</div>
                    <div style={{ fontSize: 12, color: t.text.tertiary.default, marginTop: 2 }}>
                      Permanently delete your account and all associated data.
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Trash2 size={14} aria-hidden />}
                    onClick={() => {
                      setDeleteConfirm('');
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete account
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {showDeleteModal ? (
          <div
            role="presentation"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              background: OVERLAY_BG,
              backdropFilter: 'blur(4px)',
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setShowDeleteModal(false);
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-settings-title"
              style={{
                width: 400,
                maxWidth: '100%',
                borderRadius: 14,
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                boxShadow: t.shadow.lg,
                overflow: 'hidden',
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderBottom: `1px solid ${t.border.default.default}`,
                }}
              >
                <h2 id="delete-settings-title" style={{ fontSize: 15, fontWeight: 800, color: t.text.primary.default, margin: 0 }}>
                  Delete account
                </h2>
                <button
                  type="button"
                  className="vds-button vds-button--tertiary vds-button--sm"
                  aria-label="Close"
                  onClick={() => setShowDeleteModal(false)}
                  style={{ padding: '0 8px', minWidth: 32 }}
                >
                  <X size={16} aria-hidden />
                </button>
              </div>
              <div style={{ padding: '20px 20px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <AlertCircle size={32} color="#D22232" aria-hidden />
                </div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: t.text.primary.default,
                    textAlign: 'center',
                    margin: '0 0 8px',
                  }}
                >
                  This action cannot be undone
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: t.text.secondary.default,
                    textAlign: 'center',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  All your data, projects, and settings will be permanently deleted. You will lose access immediately.
                </p>
                <div style={{ marginTop: 16 }}>
                  <TextInputControlled
                    t={t}
                    label='Type "DELETE" to confirm'
                    value={deleteConfirm}
                    onChange={setDeleteConfirm}
                    placeholder="DELETE"
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  padding: '12px 16px 16px',
                  borderTop: `1px solid ${t.border.default.default}`,
                }}
              >
                <Button variant="tertiary" size="sm" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <span style={{ opacity: deleteConfirm !== 'DELETE' ? 0.4 : 1 }}>
                  <Button
                    variant="danger"
                    size="sm"
                    isDisabled={deleteConfirm !== 'DELETE'}
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Delete my account
                  </Button>
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: tDoc.text.primary.default, marginBottom: 16 }}>Components used</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {COMPONENT_GROUPS.map((group) => (
            <div
              key={group.title}
              style={{
                background: tDoc.bg.surface.secondary.default,
                borderRadius: 10,
                padding: 14,
                border: `1px solid ${tDoc.border.default.default}`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  color: tDoc.text.tertiary.default,
                  fontWeight: 800,
                  marginBottom: 8,
                  letterSpacing: '0.06em',
                }}
              >
                {group.title}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {group.chips.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => goChip(c.href)}
                    style={{
                      background: tDoc.bg.surface.primary.default,
                      border: `1px solid ${tDoc.border.default.default}`,
                      fontSize: 11,
                      fontWeight: 600,
                      color: tDoc.text.secondary.default,
                      borderRadius: 5,
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = tDoc.border.brand.default;
                      e.currentTarget.style.color = tDoc.text.brand.default;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = tDoc.border.default.default;
                      e.currentTarget.style.color = tDoc.text.secondary.default;
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
