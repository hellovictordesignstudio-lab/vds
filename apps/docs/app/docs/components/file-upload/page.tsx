'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Film,
  Image,
  Music,
  Paperclip,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import { PropsTable } from '@/components/docs/PropsTable';
import { TableOfContents } from '@/components/docs/TableOfContents';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

type FuVariant = 'dropzone' | 'button' | 'inline';
type MockState = 'idle' | 'uploading' | 'success' | 'error';

type MockFile = {
  id: string;
  name: string;
  size: number;
  state: MockState;
  progress: number;
  error?: string;
};

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

function chipStyleB(t: VDSTheme, overrides?: CSSProperties): CSSProperties {
  return {
    background: t.bg.surface.tertiary.default,
    color: t.text.primary.default,
    fontFamily: 'var(--font-mono), monospace',
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: 5,
    border: `1px solid ${t.border.default.default}`,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    width: 'fit-content',
    ...overrides,
  };
}

function dottedZone(t: VDSTheme, height: number, canvasDark?: boolean): CSSProperties {
  return {
    backgroundColor: canvasDark ? '#0F1117' : t.bg.surface.secondary.default,
    backgroundImage: `radial-gradient(circle, ${canvasDark ? 'rgba(255,255,255,0.06)' : t.border.default.default} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    minHeight: height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  };
}

function AnnotationDot({ letter }: { letter: string }) {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#E8186D',
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {letter}
    </div>
  );
}

function IllustratedDoDont({
  t,
  ok,
  title,
  caption,
  children,
}: {
  t: VDSTheme;
  ok: boolean;
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: t.bg.surface.primary.default,
        border: `1px solid ${t.border.default.default}`,
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          background: t.bg.surface.secondary.default,
          padding: 24,
          minHeight: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
      <div style={{ padding: '12px 16px 0', fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>{title}</div>
      <div style={{ height: 3, background: ok ? '#0A8853' : '#E8186D' }} />
      <p style={{ padding: '16px 20px', fontSize: 13, color: t.text.secondary.default, lineHeight: 1.5, margin: 0 }}>{caption}</p>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIconForName(name: string) {
  const lower = name.toLowerCase();
  const ext = lower.includes('.') ? lower.slice(lower.lastIndexOf('.') + 1) : '';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) return Image;
  if (['mp4', 'mov', 'webm', 'mkv'].includes(ext)) return Film;
  if (['mp3', 'wav', 'm4a', 'aac', 'flac'].includes(ext)) return Music;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return Archive;
  return FileText;
}

function SpinnerXs({ t }: { t: VDSTheme }) {
  return (
    <svg width={16} height={16} viewBox="0 0 100 100" aria-hidden style={{ display: 'block', flexShrink: 0 }}>
      <circle cx={50} cy={50} r={46} fill="none" stroke={t.border.default.default} strokeWidth={2.5} />
      <g
        style={{
          transformBox: 'fill-box',
          transformOrigin: '50px 50px',
          animation: 'docsSpinnerRotate 800ms linear infinite',
        }}
      >
        <circle
          cx={50}
          cy={50}
          r={46}
          fill="none"
          stroke={t.bg.fill.primary.default}
          strokeWidth={2.5}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="75 25"
        />
      </g>
    </svg>
  );
}

function FileItemRow({
  t,
  file,
  onRemove,
}: {
  t: VDSTheme;
  file: MockFile;
  onRemove: () => void;
}) {
  const Icon = fileIconForName(file.name);
  const err = file.state === 'error';
  const ok = file.state === 'success';
  return (
    <div
      style={{
        background: t.bg.surface.primary.default,
        border: `1px solid ${err ? t.border.danger.default : ok ? 'rgba(10,136,83,0.35)' : t.border.default.default}`,
        borderRadius: 10,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        opacity: file.state === 'idle' && file.progress === 0 ? 1 : 1,
      }}
    >
      <Icon size={20} color={t.icon.secondary.default} aria-hidden style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.text.primary.default, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {file.name}
        </div>
        <div style={{ fontSize: 11, color: t.text.tertiary.default }}>
          {formatBytes(file.size)}
          {file.state === 'uploading' ? ` · ${file.progress}%` : null}
          {file.state === 'success' ? ' · Uploaded' : null}
        </div>
        {file.state === 'uploading' ? (
          <div
            style={{
              width: '100%',
              height: 3,
              borderRadius: 2,
              marginTop: 6,
              background: t.border.default.default,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${file.progress}%`,
                borderRadius: 2,
                background: t.bg.fill.primary.default,
              }}
            />
          </div>
        ) : null}
        {err && file.error ? (
          <div style={{ fontSize: 11, color: t.text.danger.default, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            {file.error}
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                color: t.text.brand.default,
                cursor: 'default',
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <RefreshCw size={12} aria-hidden />
              Retry
            </button>
          </div>
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {file.state === 'uploading' ? <SpinnerXs t={t} /> : null}
        {file.state === 'success' ? <CheckCircle2 size={16} color="#0A8853" aria-hidden /> : null}
        {err ? <AlertCircle size={16} color="#D22232" aria-hidden /> : null}
        <button
          type="button"
          aria-label={`Remove ${file.name}`}
          onClick={onRemove}
          style={{
            width: 20,
            height: 20,
            border: 'none',
            padding: 0,
            borderRadius: 4,
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = t.bg.surface.secondary.default;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X size={14} color={t.text.secondary.default} />
        </button>
      </div>
    </div>
  );
}

const DEMO_FILES: MockFile[] = [
  { id: 'd1', name: 'design-system.pdf', size: 2.4 * 1024 * 1024, state: 'success', progress: 100 },
  { id: 'd2', name: 'prototype.fig', size: 8.1 * 1024 * 1024, state: 'uploading', progress: 65 },
  { id: 'd3', name: 'video-demo.mp4', size: 45 * 1024 * 1024, state: 'error', progress: 0, error: 'File too large' },
];

function FileUploadLive({
  t,
  variant,
  multiple,
  disabled,
  maxMb,
  showFileList,
  isDragging,
  setIsDragging,
  userFiles,
  setUserFiles,
  removedDemoIds,
  setRemovedDemoIds,
  inlineSelection,
  setInlineSelection,
  uploadIntervalRef,
}: {
  t: VDSTheme;
  variant: FuVariant;
  multiple: boolean;
  disabled: boolean;
  maxMb: 5 | 10 | 50;
  showFileList: boolean;
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  userFiles: MockFile[];
  setUserFiles: (f: MockFile[] | ((p: MockFile[]) => MockFile[])) => void;
  removedDemoIds: Set<string>;
  setRemovedDemoIds: (s: Set<string> | ((p: Set<string>) => Set<string>)) => void;
  inlineSelection: string | null;
  setInlineSelection: (s: string | null) => void;
  uploadIntervalRef: MutableRefObject<number | null>;
}) {
  const hint = `PNG, JPG, PDF up to ${maxMb}MB`;

  const addMockFile = useCallback(() => {
    if (disabled) return;
    const name = `report-${Math.floor(Math.random() * 900 + 100)}.pdf`;
    const nf: MockFile = {
      id: `u-${Date.now()}`,
      name,
      size: 420 * 1024,
      state: 'uploading',
      progress: 0,
    };
    setUserFiles((prev) => (multiple ? [...prev, nf] : [nf]));
    if (variant === 'inline') setInlineSelection(name);
    if (uploadIntervalRef.current) window.clearInterval(uploadIntervalRef.current);
    let p = 0;
    uploadIntervalRef.current = window.setInterval(() => {
      p += 2;
      setUserFiles((prev) =>
        prev.map((f) => (f.id === nf.id ? { ...f, progress: Math.min(p, 100), state: p >= 100 ? 'success' : 'uploading' } : f)),
      );
      if (p >= 100) {
        if (uploadIntervalRef.current) window.clearInterval(uploadIntervalRef.current);
        uploadIntervalRef.current = null;
      }
    }, 40);
  }, [disabled, multiple, setUserFiles, setInlineSelection, variant, uploadIntervalRef]);

  const dropzoneDefault = !isDragging;
  const dropBorder = dropzoneDefault ? t.border.default.default : t.border.brand.default;
  const dropBg = dropzoneDefault ? t.bg.surface.secondary.default : t.bg.fill.brandSubtle.default;
  const iconColor = dropzoneDefault ? t.text.tertiary.default : t.text.brand.default;
  const titleColor = dropzoneDefault ? t.text.primary.default : t.text.brand.default;

  const visibleDemos = DEMO_FILES.filter((d) => !removedDemoIds.has(d.id));
  const list = [...visibleDemos, ...userFiles];

  const onZoneClick = () => {
    if (disabled) return;
    addMockFile();
  };

  const dropHandlers =
    variant === 'dropzone'
      ? {
          onDragEnter: (e: DragEvent) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          },
          onDragOver: (e: DragEvent) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          },
          onDragLeave: () => setIsDragging(false),
          onDrop: (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (!disabled) addMockFile();
          },
        }
      : {};

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div role="status" aria-live="polite" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {list.length > 0 ? `${list.length} file(s) in list` : ''}
      </div>
      {variant === 'dropzone' ? (
        <button
          type="button"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={onZoneClick}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onZoneClick();
            }
          }}
          {...dropHandlers}
          style={{
            width: '100%',
            maxWidth: 480,
            border: `2px dashed ${dropBorder}`,
            borderRadius: 12,
            background: dropBg,
            padding: '40px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            textAlign: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            fontFamily: 'inherit',
          }}
        >
          <Upload size={40} color={iconColor} aria-hidden />
          <div style={{ fontSize: 15, fontWeight: 700, color: titleColor }}>Drop files here</div>
          <div style={{ fontSize: 13, color: t.text.tertiary.default }}>or click to browse</div>
          <div style={{ fontSize: 12, color: t.text.tertiary.default }}>{hint}</div>
        </button>
      ) : null}

      {variant === 'button' ? (
        <button
          type="button"
          onClick={onZoneClick}
          disabled={disabled}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 8,
            border: `1px solid ${t.border.default.default}`,
            background: t.bg.surface.secondary.default,
            color: t.text.primary.default,
            fontSize: 14,
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            fontFamily: 'inherit',
          }}
        >
          <Paperclip size={18} color={t.icon.secondary.default} aria-hidden />
          Attach files
        </button>
      ) : null}

      {variant === 'inline' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: 480,
            height: 40,
            background: t.bg.surface.primary.default,
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 8,
            padding: '0 12px',
            gap: 8,
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? 'none' : 'auto',
          }}
        >
          <span style={{ flex: 1, fontSize: 13, color: inlineSelection ? t.text.primary.default : t.text.tertiary.default, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {inlineSelection ?? 'No file chosen'}
          </span>
          <button
            type="button"
            onClick={onZoneClick}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              border: `1px solid ${t.border.default.default}`,
              background: t.bg.surface.secondary.default,
              color: t.text.primary.default,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Browse
          </button>
        </div>
      ) : null}

      {showFileList && list.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16, width: '100%', maxWidth: 480 }}>
          {list.map((f) => (
            <FileItemRow
              key={f.id}
              t={t}
              file={f}
              onRemove={() => {
                if (f.id.startsWith('d')) setRemovedDemoIds((prev) => new Set(prev).add(f.id));
                else setUserFiles((prev) => prev.filter((x) => x.id !== f.id));
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DropzoneAtSize({
  t,
  size,
  label,
  caption,
}: {
  t: VDSTheme;
  size: 'sm' | 'md' | 'lg';
  label: string;
  caption: string;
}) {
  const pad = size === 'sm' ? '24px' : size === 'md' ? '40px' : '56px';
  const ic = size === 'sm' ? 28 : size === 'md' ? 40 : 52;
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          border: `2px dashed ${t.border.default.default}`,
          borderRadius: 12,
          background: t.bg.surface.secondary.default,
          padding: pad,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Upload size={ic} color={t.text.tertiary.default} aria-hidden />
        <div style={{ fontSize: 13, fontWeight: 700, color: t.text.primary.default }}>Drop files here</div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default, marginTop: 10 }}>{label}</div>
      <div style={{ fontSize: 11, color: t.text.tertiary.default, marginTop: 4, maxWidth: 200, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.45 }}>{caption}</div>
    </div>
  );
}

export default function FileUploadDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');
  const [variant, setVariant] = useState<FuVariant>('dropzone');
  const [multiple, setMultiple] = useState<'off' | 'on'>('off');
  const [disabled, setDisabled] = useState<'off' | 'on'>('off');
  const [maxMb, setMaxMb] = useState<5 | 10 | 50>(10);
  const [showFileList, setShowFileList] = useState<'off' | 'on'>('on');
  const [isDragging, setIsDragging] = useState(false);
  const [userFiles, setUserFiles] = useState<MockFile[]>([]);
  const [removedDemoIds, setRemovedDemoIds] = useState<Set<string>>(new Set());
  const [inlineSelection, setInlineSelection] = useState<string | null>(null);
  const uploadIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (uploadIntervalRef.current) window.clearInterval(uploadIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const t = buildTheme(isDark);
  const previewDark = appearance === 'dark';
  const previewT = previewDark ? buildTheme(true) : t;

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'live-preview', label: 'Live preview' },
        { id: 'principles-fu', label: 'Principles' },
        { id: 'anatomy-fu', label: 'Anatomy' },
        { id: 'variants-fu', label: 'Variants' },
        { id: 'file-states', label: 'File states' },
        { id: 'sizes-fu', label: 'Sizes' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'when-to-use-fu', label: 'When to use' },
        { id: 'validation-fu', label: 'Validation patterns' },
        { id: 'dos-donts-fu', label: "Do & Don't" },
      ];
    }
    return [];
  }, [activeTab]);

  const fileUploadPropsRows = [
    { name: 'variant', type: "'dropzone' | 'button' | 'inline'", default: "'dropzone'", description: 'Visual style' },
    { name: 'accept', type: 'string', default: "'*'", description: 'Accepted MIME types or extensions' },
    { name: 'maxSize', type: 'number', default: '—', description: 'Max file size in bytes' },
    { name: 'maxFiles', type: 'number', default: '1', description: 'Max number of files' },
    { name: 'maxTotalSize', type: 'number', default: '—', description: 'Max total size in bytes' },
    { name: 'multiple', type: 'boolean', default: 'false', description: 'Allow multiple files' },
    { name: 'autoUpload', type: 'boolean', default: 'false', description: 'Upload immediately on select' },
    {
      name: 'uploadFn',
      type: '(file: File) => Promise<string>',
      default: '—',
      description: 'Upload handler → returns URL',
    },
    {
      name: 'onFilesChange',
      type: '(files: UploadedFile[]) => void',
      default: '—',
      description: 'Called when file list changes',
    },
    { name: 'isDisabled', type: 'boolean', default: 'false', description: 'Disabled state' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Dropzone size' },
    { name: 'label', type: 'string', default: '—', description: 'Button label (variant button)' },
    { name: 'hint', type: 'string', default: '—', description: 'Custom hint text' },
    { name: 'className', type: 'string', default: '—', description: 'Additional classes' },
  ];

  const codeBasic = `// Basic single file dropzone
<FileUpload
  accept=".pdf,.doc,.docx"
  maxSize={10 * 1024 * 1024} // 10MB
  onFilesChange={(files) => setAttachment(files[0])}
/>`;

  const codeMulti = `// Multiple files with auto-upload
<FileUpload
  multiple
  maxFiles={5}
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  autoUpload
  uploadFn={async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const { url } = await res.json()
    return url
  }}
  onFilesChange={setUploadedImages}
/>`;

  const codeButton = `// Button variant — attach to comment
<FileUpload
  variant="button"
  multiple
  maxFiles={3}
  maxTotalSize={20 * 1024 * 1024}
  label="Attach files"
  onFilesChange={setAttachments}
/>`;

  const codeInline = `// Inline variant — inside a form
<form onSubmit={handleSubmit}>
  <TextInput label="Full name" />
  <FileUpload
    variant="inline"
    accept=".pdf"
    maxSize={5 * 1024 * 1024}
    label="Resume"
    hint="PDF only, max 5MB"
    onFilesChange={(files) => setResume(files[0])}
  />
  <Button type="submit" variant="primary">Submit application</Button>
</form>`;

  const codeLarge = `// Large dropzone — asset library
<FileUpload
  size="lg"
  multiple
  maxFiles={20}
  accept="image/*,video/*"
  maxSize={100 * 1024 * 1024}
  autoUpload
  uploadFn={uploadAsset}
  hint="PNG, JPG, GIF, MP4 up to 100MB"
  onFilesChange={setAssets}
/>`;

  const codeUploadedType = `interface UploadedFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  state: 'idle' | 'uploading' | 'success' | 'error'
  progress: number      // 0–100
  url?: string          // after successful upload
  error?: string        // error message
}`;

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components{' '}
        <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> File Upload
      </p>
      <h1 className="page-title">File Upload</h1>
      <p className="page-lead">
        File Upload lets users attach files to a form or workflow. It handles the full lifecycle — selection, validation, progress, and error states — so
        users always know what&apos;s happening with their files. A good file upload feels effortless: drag, drop, done.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <span style={chipStyleA()}>Stable</span>
        <span style={chipStyleA()}>v1.0</span>
        <span style={chipStyleA()}>Accessible</span>
      </div>

      <ComponentTabs tabs={[...TABS]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'Overview' ? (
        <>
          <section id="live-preview" style={{ marginTop: 32, marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Live preview
            </h2>
            <LivePreviewShell
              t={t}
              canvasIsDark={previewDark}
              controls={
                <>
                  <LivePreviewSegmentRow
                    t={t}
                    label="Variant"
                    options={['dropzone', 'button', 'inline']}
                    value={variant}
                    onChange={(v) => setVariant(v as FuVariant)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Multiple"
                    options={['off', 'on']}
                    value={multiple}
                    onChange={(v) => setMultiple(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Disabled"
                    options={['off', 'on']}
                    value={disabled}
                    onChange={(v) => setDisabled(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Max size"
                    options={['5MB', '10MB', '50MB']}
                    value={maxMb === 5 ? '5MB' : maxMb === 10 ? '10MB' : '50MB'}
                    onChange={(v) => setMaxMb(v === '5MB' ? 5 : v === '10MB' ? 10 : 50)}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Show file list"
                    options={['off', 'on']}
                    value={showFileList}
                    onChange={(v) => setShowFileList(v as 'off' | 'on')}
                  />
                  <LivePreviewSegmentRow
                    t={t}
                    label="Appearance"
                    options={['Light', 'Dark']}
                    value={previewDark ? 'Dark' : 'Light'}
                    onChange={(v) => setAppearance(v === 'Dark' ? 'dark' : 'light')}
                    showDivider={false}
                  />
                </>
              }
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: 420,
                  padding: 32,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileUploadLive
                  t={previewT}
                  variant={variant}
                  multiple={multiple === 'on'}
                  disabled={disabled === 'on'}
                  maxMb={maxMb}
                  showFileList={showFileList === 'on'}
                  isDragging={isDragging}
                  setIsDragging={setIsDragging}
                  userFiles={userFiles}
                  setUserFiles={setUserFiles}
                  removedDemoIds={removedDemoIds}
                  setRemovedDemoIds={setRemovedDemoIds}
                  inlineSelection={inlineSelection}
                  setInlineSelection={setInlineSelection}
                  uploadIntervalRef={uploadIntervalRef}
                />
              </div>
            </LivePreviewShell>
          </section>

          <section id="principles-fu" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Principles
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 220), flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Default</div>
                      <div
                        style={{
                          border: `2px dashed ${t.border.default.default}`,
                          borderRadius: 10,
                          padding: '12px 16px',
                          background: t.bg.surface.secondary.default,
                        }}
                      >
                        <Upload size={22} color={t.text.tertiary.default} />
                      </div>
                    </div>
                    <span style={{ color: t.text.tertiary.default, fontSize: 16 }}>→</span>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Drag-over</div>
                      <div
                        style={{
                          border: `2px dashed ${t.border.brand.default}`,
                          borderRadius: 10,
                          padding: '12px 16px',
                          background: t.bg.fill.brandSubtle.default,
                        }}
                      >
                        <Upload size={22} color={t.text.brand.default} style={{ animation: 'docsSpinnerRotate 2s linear infinite' }} />
                      </div>
                    </div>
                    <span style={{ color: t.text.tertiary.default, fontSize: 16 }}>→</span>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Dropped</div>
                      <div
                        style={{
                          border: `1px solid ${t.border.default.default}`,
                          borderRadius: 8,
                          padding: '6px 8px',
                          fontSize: 9,
                          background: t.bg.surface.primary.default,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <FileText size={12} />
                        resume.pdf
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Upload size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Drag and drop reduces friction</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    Drag and drop is the fastest way to upload a file — the user doesn&apos;t need to navigate a file picker. Always support both drag-and-drop
                    and click-to-browse. Never make one the only option. On mobile, drag-and-drop doesn&apos;t exist — the click trigger is the primary
                    interaction.
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 220), flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', maxWidth: 200 }}>
                    <div style={{ fontSize: 9, padding: '6px 8px', border: `1px solid ${t.border.default.default}`, borderRadius: 8, background: t.bg.surface.primary.default }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
                        <span>deck.pdf</span>
                        <SpinnerXs t={t} />
                      </div>
                      <div style={{ height: 2, background: t.border.default.default, borderRadius: 1, marginTop: 4 }}>
                        <div style={{ width: '60%', height: '100%', background: t.bg.fill.primary.default, borderRadius: 1 }} />
                      </div>
                      <div style={{ fontSize: 8, color: t.text.tertiary.default, marginTop: 2 }}>60%</div>
                    </div>
                    <div style={{ fontSize: 9, padding: '6px 8px', border: `1px solid rgba(10,136,83,0.35)`, borderRadius: 8, background: t.bg.surface.primary.default, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>logo.png</span>
                      <CheckCircle2 size={12} color="#0A8853" />
                    </div>
                    <div style={{ fontSize: 9, padding: '6px 8px', border: `1px solid ${t.border.danger.default}`, borderRadius: 8, background: t.bg.surface.primary.default }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>clip.mp4</span>
                        <AlertCircle size={12} color="#D22232" />
                      </div>
                      <div style={{ fontSize: 8, color: t.text.danger.default, marginTop: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
                        <RefreshCw size={10} /> Retry
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <CheckCircle2 size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Show progress, not silence</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    A file upload without progress feedback creates anxiety — did it work? Always show upload progress for files larger than 1MB. For smaller
                    files, show a brief success state before settling. Never let the user wonder if their file was received.
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 220), flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Vague</div>
                    <div style={{ padding: 10, borderRadius: 8, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default, fontSize: 10, maxWidth: 120 }}>
                      Upload failed
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: t.text.tertiary.default, marginBottom: 6 }}>Specific + actionable</div>
                    <div style={{ padding: 10, borderRadius: 8, border: `1px solid ${t.border.danger.default}`, background: t.bg.surface.primary.default, fontSize: 9, maxWidth: 140, textAlign: 'left' }}>
                      <div style={{ fontWeight: 600 }}>video.mp4</div>
                      <div style={{ color: t.text.danger.default, marginTop: 4 }}>File too large (45MB, max 10MB)</div>
                      <button type="button" style={{ marginTop: 6, background: 'none', border: 'none', padding: 0, color: t.text.brand.default, fontSize: 9, fontWeight: 600, cursor: 'default', fontFamily: 'inherit' }}>
                        Retry
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 20, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <AlertCircle size={18} color={t.text.brand.default} style={{ opacity: 0.45 }} aria-hidden />
                    <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Errors must be specific and recoverable</div>
                  </div>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
                    File errors need two things: what went wrong (specific to this file) and how to fix it. &apos;Upload failed&apos; is not enough.
                    &apos;File too large — max 10MB&apos; tells the user exactly what to do next. Always offer a retry or remove option.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="anatomy-fu" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Anatomy
            </h2>
            <div
              style={{
                position: 'relative',
                height: 360,
                borderRadius: 14,
                border: `1px solid ${t.border.default.default}`,
                ...dottedZone(t, 360),
                padding: 16,
              }}
            >
              <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 6, zIndex: 1 }}>
                <AnnotationDot letter="A" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>Dropzone container</span>
              </div>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 24 }}>
                <div style={{ width: 'min(380px, 100%)' }}>
                  <div style={{ position: 'absolute', left: '50%', top: 36, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AnnotationDot letter="B" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#E8186D' }}>Upload icon</span>
                  </div>
                  <div
                    style={{
                      border: `2px dashed ${t.border.default.default}`,
                      borderRadius: 12,
                      background: t.bg.surface.secondary.default,
                      padding: '28px 20px 32px',
                      textAlign: 'center',
                    }}
                  >
                    <Upload size={36} color={t.text.tertiary.default} aria-hidden style={{ display: 'block', margin: '0 auto 8px' }} />
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', right: -8, top: -18, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#E8186D' }}>C</span>
                        <AnnotationDot letter="C" />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default }}>Drop files here</div>
                    </div>
                    <div style={{ position: 'relative', marginTop: 4 }}>
                      <div style={{ position: 'absolute', left: -28, top: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <AnnotationDot letter="D" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#E8186D' }}>Subtitle</span>
                      </div>
                      <div style={{ fontSize: 12, color: t.text.tertiary.default }}>or click to browse</div>
                    </div>
                    <div style={{ position: 'relative', marginTop: 6 }}>
                      <div style={{ position: 'absolute', right: -36, bottom: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#E8186D' }}>E</span>
                        <AnnotationDot letter="E" />
                      </div>
                      <div style={{ fontSize: 11, color: t.text.tertiary.default }}>PNG, JPG, PDF up to 10MB</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: -28, top: 8, display: 'flex', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <AnnotationDot letter="F" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#E8186D' }}>File item</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '8px 12px',
                          borderRadius: 10,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                          fontSize: 11,
                        }}
                      >
                        <FileText size={16} color={t.icon.secondary.default} />
                        <span style={{ flex: 1 }}>design-system.pdf</span>
                        <span style={{ color: t.text.tertiary.default }}>2.4 MB</span>
                        <CheckCircle2 size={14} color="#0A8853" />
                      </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', right: -32, top: 10, display: 'flex', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#E8186D' }}>G</span>
                        <AnnotationDot letter="G" />
                      </div>
                      <div
                        style={{
                          padding: '8px 12px',
                          borderRadius: 10,
                          border: `1px solid ${t.border.default.default}`,
                          background: t.bg.surface.primary.default,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11 }}>
                          <FileText size={16} color={t.icon.secondary.default} />
                          <span style={{ flex: 1 }}>prototype.fig</span>
                          <SpinnerXs t={t} />
                        </div>
                        <div style={{ height: 3, borderRadius: 2, background: t.border.default.default, marginTop: 6 }}>
                          <div style={{ width: '55%', height: '100%', borderRadius: 2, background: t.text.brand.default }} />
                        </div>
                      </div>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: -28, bottom: 8, display: 'flex', alignItems: 'center', gap: 4, zIndex: 1 }}>
                        <AnnotationDot letter="H" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#E8186D' }}>Error</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '8px 12px',
                          borderRadius: 10,
                          border: `1px solid ${t.border.danger.default}`,
                          background: t.bg.surface.primary.default,
                          fontSize: 11,
                        }}
                      >
                        <Film size={16} color={t.icon.secondary.default} style={{ marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>video-demo.mp4</div>
                          <div style={{ color: t.text.danger.default, marginTop: 2 }}>File too large</div>
                        </div>
                        <AlertCircle size={14} color="#D22232" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 6 }}>
                      <AnnotationDot letter="I" />
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#E8186D' }}>Remove</span>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 4,
                          border: `1px solid ${t.border.default.default}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <X size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="variants-fu" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Variants
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 180) }}>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 200,
                      border: `2px dashed ${t.border.default.default}`,
                      borderRadius: 12,
                      background: t.bg.surface.secondary.default,
                      padding: '20px 16px',
                      textAlign: 'center',
                    }}
                  >
                    <Upload size={28} color={t.text.tertiary.default} aria-hidden style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 11, fontWeight: 700, color: t.text.primary.default }}>Drop files here</div>
                    <div style={{ fontSize: 10, color: t.text.tertiary.default, marginTop: 4 }}>or click to browse</div>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Dropzone</div>
                  <span style={chipStyleB(t, { marginBottom: 10 })}>variant: dropzone</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>
                    Default. Prominent drop target ideal for workflows where uploading is a primary action — form submissions, asset libraries, import flows.
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 180), flexDirection: 'column', gap: 10 }}>
                  <button
                    type="button"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: `1px solid ${t.border.default.default}`,
                      background: t.bg.surface.secondary.default,
                      fontSize: 12,
                      fontWeight: 600,
                      color: t.text.primary.default,
                      fontFamily: 'inherit',
                      cursor: 'default',
                    }}
                  >
                    <Paperclip size={14} aria-hidden />
                    Attach files
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 200 }}>
                    {['notes.pdf', 'spec.docx'].map((n) => (
                      <div
                        key={n}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 10,
                          padding: '6px 8px',
                          border: `1px solid ${t.border.default.default}`,
                          borderRadius: 8,
                          background: t.bg.surface.primary.default,
                        }}
                      >
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n}</span>
                        <CheckCircle2 size={12} color="#0A8853" />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Button</div>
                  <span style={chipStyleB(t, { marginBottom: 10 })}>variant: button</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>
                    Minimal. Use when uploading is a secondary action — attaching files to a comment, adding an avatar, uploading a document in a sidebar.
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: t.bg.surface.primary.default,
                  border: `1px solid ${t.border.default.default}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                }}
              >
                <div style={{ ...dottedZone(t, 180) }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      maxWidth: 220,
                      height: 36,
                      background: t.bg.surface.primary.default,
                      border: `1px solid ${t.border.default.default}`,
                      borderRadius: 8,
                      padding: '0 10px',
                      gap: 8,
                    }}
                  >
                    <span style={{ flex: 1, fontSize: 11, color: t.text.tertiary.default }}>No file chosen</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '4px 8px', borderRadius: 6, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.secondary.default }}>
                      Browse
                    </span>
                  </div>
                </div>
                <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>Inline</div>
                  <span style={chipStyleB(t, { marginBottom: 10 })}>variant: inline</span>
                  <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>
                    Form-native style. Replaces the browser&apos;s default file input. Use inside dense forms where a full dropzone would dominate the layout.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="file-states" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              File states
            </h2>
            <p className="page-lead" style={{ marginBottom: 20, fontSize: 15 }}>
              Each file in the list goes through a state lifecycle. States are shown inline in the file item.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {[
                {
                  title: 'Idle (queued)',
                  chip: 'state: idle',
                  desc: 'File selected but not yet uploading. Shown when upload is manual (triggered by a submit button).',
                  node: (
                    <div style={{ width: '100%', maxWidth: 200 }}>
                      <FileItemRow
                        t={t}
                        file={{ id: 's1', name: 'contract.pdf', size: 900 * 1024, state: 'idle', progress: 0 }}
                        onRemove={() => {}}
                      />
                    </div>
                  ),
                },
                {
                  title: 'Uploading',
                  chip: 'state: uploading',
                  desc: 'Upload in progress. Progress bar shows completion percentage. Spinner confirms activity.',
                  node: (
                    <div style={{ width: '100%', maxWidth: 200 }}>
                      <FileItemRow
                        t={t}
                        file={{ id: 's2', name: 'dataset.csv', size: 4 * 1024 * 1024, state: 'uploading', progress: 60 }}
                        onRemove={() => {}}
                      />
                    </div>
                  ),
                },
                {
                  title: 'Success',
                  chip: 'state: success',
                  desc: 'Upload complete. CheckCircle confirms success. File item may fade slightly to indicate completion.',
                  node: (
                    <div style={{ width: '100%', maxWidth: 200 }}>
                      <FileItemRow
                        t={t}
                        file={{ id: 's3', name: 'avatar.png', size: 400 * 1024, state: 'success', progress: 100 }}
                        onRemove={() => {}}
                      />
                    </div>
                  ),
                },
                {
                  title: 'Error',
                  chip: 'state: error',
                  desc: 'Upload failed or validation error. Show the specific error message. Always offer retry or remove.',
                  node: (
                    <div style={{ width: '100%', maxWidth: 200 }}>
                      <FileItemRow
                        t={t}
                        file={{
                          id: 's4',
                          name: 'long-video.mp4',
                          size: 200 * 1024 * 1024,
                          state: 'error',
                          progress: 0,
                          error: 'File too large',
                        }}
                        onRemove={() => {}}
                      />
                    </div>
                  ),
                },
                {
                  title: 'Removed',
                  chip: 'state: removed',
                  desc: 'User clicked X. File item fades out and is removed from the list. No confirmation needed.',
                  node: (
                    <div style={{ width: '100%', maxWidth: 200, opacity: 0.45, transition: 'opacity 0.4s ease' }}>
                      <FileItemRow
                        t={t}
                        file={{ id: 's5', name: 'draft.txt', size: 12 * 1024, state: 'success', progress: 100 }}
                        onRemove={() => {}}
                      />
                      <div style={{ fontSize: 9, color: t.text.tertiary.default, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trash2 size={12} aria-hidden />
                        Fading out…
                      </div>
                    </div>
                  ),
                },
              ].map((s) => (
                <div
                  key={s.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 14,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ ...dottedZone(t, 120), padding: 12 }}>{s.node}</div>
                  <div style={{ padding: 16, borderTop: `1px solid ${t.border.default.default}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.text.primary.default, marginBottom: 8 }}>{s.title}</div>
                    <span style={chipStyleB(t, { marginBottom: 10 })}>{s.chip}</span>
                    <p style={{ fontSize: 13, color: t.text.secondary.default, lineHeight: 1.55, margin: '10px 0 0' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="sizes-fu" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Sizes
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, alignItems: 'start' }}>
              <DropzoneAtSize t={t} size="sm" label="sm" caption="Compact panels, sidebars, inline forms" />
              <DropzoneAtSize t={t} size="md" label="md" caption="Default — forms, import flows" />
              <DropzoneAtSize t={t} size="lg" label="lg" caption="Full-page upload, primary action, asset libraries" />
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Usage' ? (
        <>
          <section id="when-to-use-fu" style={{ marginTop: 32, marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              When to use
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: t.text.tertiary.default, marginBottom: 12 }}>DO</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                  <li>Attach files to forms (contracts, CVs, profile images)</li>
                  <li>Import data (CSV, JSON, XLSX)</li>
                  <li>Upload assets to a library</li>
                  <li>Attach evidence or support documents</li>
                </ul>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: t.text.tertiary.default, marginBottom: 12 }}>DON&apos;T</div>
                <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                  <li>To pick a file used only locally without uploading (use a native file input)</li>
                  <li>When the user only needs to paste a URL (use TextInput)</li>
                  <li>When the device camera is the primary source (use a native capture pattern on mobile)</li>
                </ul>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Callout variant="warning" title="Always validate on the server too">
                Client-side validation (file type, size) improves UX but is not a security boundary. Always validate file type and size on the server.
                Never trust client-side validation alone for security-sensitive uploads.
              </Callout>
            </div>
          </section>

          <section id="validation-fu" style={{ marginBottom: 32 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Validation patterns
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {[
                {
                  title: 'File type',
                  hint: 'PDF, DOC, DOCX only',
                  err: 'Invalid file type — only PDF, DOC, and DOCX are accepted',
                  impl: 'accept prop + validation in onChange',
                },
                {
                  title: 'File size',
                  hint: 'Max 10MB per file',
                  err: 'design-video.mp4 is too large (45MB). Maximum size is 10MB.',
                  impl: 'maxSize prop in bytes',
                },
                {
                  title: 'File count',
                  hint: 'Up to 5 files',
                  err: 'You can upload a maximum of 5 files at a time.',
                  impl: 'maxFiles prop',
                },
                {
                  title: 'Total size',
                  hint: 'Total upload limit: 50MB',
                  err: 'Total file size exceeds 50MB. Remove some files to continue.',
                  impl: 'maxTotalSize prop',
                },
              ].map((r) => (
                <div
                  key={r.title}
                  style={{
                    background: t.bg.surface.primary.default,
                    border: `1px solid ${t.border.default.default}`,
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: t.text.primary.default, margin: '0 0 12px' }}>{r.title}</h3>
                  <div style={{ fontSize: 12, color: t.text.tertiary.default, marginBottom: 6 }}>
                    <strong style={{ color: t.text.secondary.default }}>Hint text:</strong> {r.hint}
                  </div>
                  <div style={{ fontSize: 12, color: t.text.danger.default, marginBottom: 6 }}>
                    <strong style={{ color: t.text.secondary.default }}>Error:</strong> {r.err}
                  </div>
                  <div style={{ fontSize: 12, color: t.text.secondary.default }}>
                    <strong>Implementation:</strong> {r.impl}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="dos-donts-fu" style={{ marginBottom: 48 }}>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Do &amp; Don&apos;t
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — show accepted types upfront"
                  caption='Dropzone with hint "PNG, JPG, SVG up to 5MB" visible before the user interacts.'
                >
                  <div
                    style={{
                      border: `2px dashed ${t.border.default.default}`,
                      borderRadius: 10,
                      padding: '14px 18px',
                      textAlign: 'center',
                      background: t.bg.surface.secondary.default,
                      maxWidth: 200,
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 700 }}>Drop files here</div>
                    <div style={{ fontSize: 9, color: t.text.tertiary.default, marginTop: 4 }}>PNG, JPG, SVG up to 5MB</div>
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — hide constraints"
                  caption="Dropzone with no hints — the user only discovers restrictions after an error."
                >
                  <div
                    style={{
                      border: `2px dashed ${t.border.default.default}`,
                      borderRadius: 10,
                      padding: '14px 18px',
                      textAlign: 'center',
                      background: t.bg.surface.secondary.default,
                      maxWidth: 200,
                    }}
                  >
                    <div style={{ fontSize: 10, fontWeight: 700 }}>Drop files here</div>
                  </div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — keep files after error"
                  caption="Error on one file — that row shows error + retry; other files stay intact."
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 180 }}>
                    <FileItemRow t={t} file={{ id: 'a', name: 'ok.pdf', size: 1000, state: 'success', progress: 100 }} onRemove={() => {}} />
                    <FileItemRow
                      t={t}
                      file={{ id: 'b', name: 'bad.png', size: 1000, state: 'error', progress: 0, error: 'Invalid type' }}
                      onRemove={() => {}}
                    />
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — clear everything"
                  caption="Error on one file — the entire list is wiped and the user must re-select all files."
                >
                  <div style={{ fontSize: 11, color: t.text.danger.default, padding: 12, border: `1px dashed ${t.border.danger.default}`, borderRadius: 8 }}>
                    Upload failed — all files removed
                  </div>
                </IllustratedDoDont>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <IllustratedDoDont
                  t={t}
                  ok
                  title="DO — upload on submit"
                  caption="Files upload when the user submits the form, together with the rest of the fields."
                >
                  <div style={{ fontSize: 10, padding: 10, borderRadius: 8, background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}` }}>
                    <Plus size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} aria-hidden />
                    On Submit → upload
                  </div>
                </IllustratedDoDont>
                <IllustratedDoDont
                  t={t}
                  ok={false}
                  title="DON'T — auto-upload in forms"
                  caption="Files upload immediately on select — the user may cancel before sending the whole form."
                >
                  <div style={{ fontSize: 10, padding: 10, borderRadius: 8, background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}` }}>
                    <Eye size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} aria-hidden />
                    On select → upload immediately
                  </div>
                </IllustratedDoDont>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {activeTab === 'Content' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            Content
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Dropzone copy
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Title:</strong> action-oriented — &apos;Drop files here&apos;, &apos;Upload your resume&apos;,
                  &apos;Add images&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Subtitle:</strong> &apos;or click to browse&apos; — always include the click alternative
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Hint:</strong> list accepted types + max size — &apos;PDF, DOCX up to 10MB&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Never:</strong> &apos;Drag and drop or click to select files from your computer&apos; — too long
                </li>
              </ul>
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Error messages
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>
                  <strong style={{ color: t.text.primary.default }}>File type:</strong> &apos;[filename] is not supported. Accepted: [types]&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>File size:</strong> &apos;[filename] is too large ([actual]). Max: [limit]&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Count limit:</strong> &apos;Maximum [n] files allowed. Remove [x] files to continue.&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Network error:</strong> &apos;Upload failed. Check your connection and try again.&apos;
                </li>
              </ul>
            </div>
            <div>
              <h3 className="section-title" style={{ fontSize: 16, marginBottom: 10 }}>
                Button label
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, color: t.text.secondary.default, fontSize: 15, lineHeight: 1.7 }}>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Primary upload:</strong> &apos;Upload files&apos;, &apos;Upload document&apos;, &apos;Add images&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Secondary attach:</strong> &apos;Attach files&apos;, &apos;Add attachment&apos;
                </li>
                <li>
                  <strong style={{ color: t.text.primary.default }}>Avatar/profile:</strong> &apos;Change photo&apos;, &apos;Upload photo&apos;
                </li>
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === 'Code' ? (
        <>
          <section style={{ marginTop: 32, marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              FileUpload props
            </h3>
            <PropsTable props={fileUploadPropsRows} />
          </section>
          <section style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              UploadedFile type
            </h3>
            <CodeBlock code={codeUploadedType} filename="UploadedFile" language="tsx" />
          </section>
          <section style={{ marginBottom: 24 }}>
            <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
              Examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <CodeBlock code={codeBasic} filename="Basic single file" language="tsx" />
              <CodeBlock code={codeMulti} filename="Multiple + auto-upload" language="tsx" />
              <CodeBlock code={codeButton} filename="Button variant" language="tsx" />
              <CodeBlock code={codeInline} filename="Inline in a form" language="tsx" />
              <CodeBlock code={codeLarge} filename="Large dropzone" language="tsx" />
            </div>
          </section>
          <section style={{ marginBottom: 48 }}>
            <Callout variant="info" title="Accessibility">
              FileUpload renders a visually hidden &lt;input type=&apos;file&apos;&gt; that receives focus and keyboard events. The dropzone has
              role=&apos;button&apos;, tabIndex=0, and responds to Enter/Space to open the file picker. Drag events are handled on the visible zone. File items
              include an aria-label with the filename for the remove button. Upload state changes are announced via a role=&apos;status&apos; live region.
            </Callout>
          </section>
        </>
      ) : null}

      {activeTab === 'Changelog' ? (
        <section style={{ marginTop: 32, marginBottom: 48 }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>
            Changelog
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                gap: 16,
                padding: '20px 0',
                borderBottom: `1px solid ${t.border.default.default}`,
                alignItems: 'flex-start',
              }}
            >
              <span style={chipStyleB(t)}>v1.0.0</span>
              <span style={{ fontSize: 13, color: t.text.tertiary.default, width: 100, flexShrink: 0 }}>April 2026</span>
              <p style={{ fontSize: 13, color: t.text.secondary.default, flex: 1, margin: 0 }}>
                Initial release. FileUpload with dropzone/button/inline variants, drag-and-drop, file type/size/count validation, upload progress, 5 file
                states (idle/uploading/success/error/removed), auto-upload mode, 3 sizes, full accessibility with hidden input + live region.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
