'use client';

import { useEffect, useMemo, useState, useId } from 'react';
import { ChevronRight } from 'lucide-react';
import { buildTheme, type VDSTheme } from '@/lib/theme';
import { ComponentTabs } from '@/components/docs/ComponentTabs';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { chipStyleA, lineData, seriesPalette } from './charts-shared';
import {
  ChartsChangelogTab,
  ChartsCodeTab,
  ChartsContentTab,
  ChartsOverviewSections,
  ChartsUsageTab,
} from './ChartsDocsSections';

const TABS = ['Overview', 'Usage', 'Content', 'Code', 'Changelog'] as const;

const chartTooltipSnippet = [
  '// Shared tooltip used by all charts',
  'interface ChartTooltipProps {',
  '  active?: boolean',
  '  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>',
  '  label?: string',
  '  formatter?: (value: number, name: string) => string',
  '  labelFormatter?: (label: string) => string',
  '}',
  '',
  'const ChartTooltip = ({ active, payload, label, formatter, labelFormatter }: ChartTooltipProps) => {',
  '  if (!active || !payload?.length) return null',
  '  const t = buildTheme(/* isDark from context */)',
  '  return (',
  '    <div style={{ background: t.bg.surface.primary.default,',
  '      border: `1px solid ${t.border.default.default}`,',
  '      borderRadius: 10, padding: \'10px 14px\',',
  '      boxShadow: t.shadow.md, minWidth: 140 }}>',
  '      {label && (',
  '        <div style={{ fontSize: 11, fontWeight: 700,',
  '          color: t.text.tertiary.default, marginBottom: 8 }}>',
  '          {labelFormatter ? labelFormatter(label) : label}',
  '        </div>',
  '      )}',
  '      {payload.map(entry => (',
  '        <div key={entry.dataKey} style={{ display: \'flex\',',
  '          alignItems: \'center\', gap: 8, marginBottom: 4 }}>',
  '          <div style={{ width: 8, height: 8, borderRadius: \'50%\',',
  '            background: entry.color, flexShrink: 0 }} />',
  '          <span style={{ fontSize: 12, color: t.text.secondary.default, flex: 1 }}>',
  '            {entry.name}',
  '          </span>',
  '          <span style={{ fontSize: 12, fontWeight: 700, color: t.text.primary.default }}>',
  '            {formatter ? formatter(entry.value, entry.name) : entry.value.toLocaleString()}',
  '          </span>',
  '        </div>',
  '      ))}',
  '    </div>',
  '  )',
  '}',
].join('\n');

const codeExamples = [
  '// ─── Line Chart ───',
  '<ResponsiveContainer width="100%" height={320}>',
  '  <LineChart data={lineData}>',
  '    <CartesianGrid strokeDasharray="3 3"',
  '      stroke={t.border.default.default} vertical={false} />',
  '    <XAxis dataKey="month" axisLine={false} tickLine={false}',
  '      tick={{ fill: t.text.tertiary.default, fontSize: 11 }} />',
  '    <YAxis axisLine={false} tickLine={false}',
  '      tick={{ fill: t.text.tertiary.default, fontSize: 11 }}',
  '      tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`} />',
  '    <Tooltip content={<ChartTooltip',
  '      formatter={(v) => `$${v.toLocaleString()}`} />} />',
  '    <Legend />',
  '    <Line type="monotone" dataKey="revenue" name="Revenue"',
  '      stroke="#002b49" strokeWidth={2.5}',
  '      dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />',
  '    <Line type="monotone" dataKey="users" name="Users"',
  '      stroke="#7C3AED" strokeWidth={2.5}',
  '      dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />',
  '  </LineChart>',
  '</ResponsiveContainer>',
  '',
  '// ─── Bar Chart — grouped ───',
  '<ResponsiveContainer width="100%" height={320}>',
  '  <BarChart data={barData} barGap={4} barCategoryGap="30%">',
  '    <CartesianGrid strokeDasharray="3 3"',
  '      stroke={t.border.default.default} vertical={false} />',
  '    <XAxis dataKey="quarter" axisLine={false} tickLine={false}',
  '      tick={{ fill: t.text.tertiary.default, fontSize: 11 }} />',
  '    <YAxis axisLine={false} tickLine={false}',
  '      tick={{ fill: t.text.tertiary.default, fontSize: 11 }} />',
  '    <Tooltip content={<ChartTooltip />} />',
  '    <Legend />',
  '    <Bar dataKey="design"     name="Design"     fill="#002b49" radius={[4,4,0,0]} />',
  '    <Bar dataKey="code"       name="Code"       fill="#7C3AED" radius={[4,4,0,0]} />',
  '    <Bar dataKey="consulting" name="Consulting" fill="#0A8853" radius={[4,4,0,0]} />',
  '  </BarChart>',
  '</ResponsiveContainer>',
  '',
  '// ─── Area Chart — with gradient ───',
  '<ResponsiveContainer width="100%" height={320}>',
  '  <AreaChart data={areaData}>',
  '    <defs>',
  '      <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">',
  '        <stop offset="0%"   stopColor="#002b49" stopOpacity={0.20} />',
  '        <stop offset="100%" stopColor="#002b49" stopOpacity={0} />',
  '      </linearGradient>',
  '    </defs>',
  '    <CartesianGrid strokeDasharray="3 3"',
  '      stroke={t.border.default.default} vertical={false} />',
  '    <XAxis dataKey="month" axisLine={false} tickLine={false}',
  '      tick={{ fill: t.text.tertiary.default, fontSize: 11 }} />',
  '    <YAxis axisLine={false} tickLine={false}',
  '      tick={{ fill: t.text.tertiary.default, fontSize: 11 }} />',
  '    <Tooltip content={<ChartTooltip />} />',
  '    <Area type="monotone" dataKey="revenue" name="Revenue"',
  '      stroke="#002b49" strokeWidth={2}',
  '      fill="url(#gradientRevenue)" dot={false} />',
  '  </AreaChart>',
  '</ResponsiveContainer>',
  '',
  '// ─── Donut Chart ───',
  '<ResponsiveContainer width="100%" height={280}>',
  '  <PieChart>',
  '    <Pie data={donutData} cx="50%" cy="50%"',
  '      innerRadius="60%" outerRadius="80%"',
  '      paddingAngle={3} cornerRadius={4}',
  '      dataKey="value">',
  '      {donutData.map((entry, index) => (',
  '        <Cell key={index} fill={entry.color} />',
  '      ))}',
  '    </Pie>',
  '    <Tooltip content={<ChartTooltip',
  '      formatter={(v, n) => `${((v / total) * 100).toFixed(1)}%`} />} />',
  '    <Legend />',
  '  </PieChart>',
  '</ResponsiveContainer>',
  '',
  '// ─── Sparkline (SVG manual) ───',
  '// …see VDS Charts docs Sparkline implementation',
].join('\n');

export default function ChartsDocsPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [isDark, setIsDark] = useState(false);
  const gid = useId().replace(/:/g, '');

  const [lineSeries, setLineSeries] = useState<'single' | 'multi'>('multi');
  const [lineGrid, setLineGrid] = useState<'off' | 'on'>('on');
  const [lineDots, setLineDots] = useState<'off' | 'on'>('off');
  const [lineCurve, setLineCurve] = useState<'off' | 'on'>('on');
  const [lineLegend, setLineLegend] = useState<'off' | 'on'>('on');
  const [lineHeight, setLineHeight] = useState<'240' | '320' | '400'>('320');
  const [lineAppearance, setLineAppearance] = useState<'light' | 'dark'>('light');

  const [barType, setBarType] = useState<'single' | 'grouped' | 'stacked'>('grouped');
  const [barOrient, setBarOrient] = useState<'vertical' | 'horizontal'>('vertical');
  const [barValues, setBarValues] = useState<'off' | 'on'>('off');
  const [barRounded, setBarRounded] = useState<'off' | 'on'>('on');
  const [barAppearance, setBarAppearance] = useState<'light' | 'dark'>('light');

  const [areaType, setAreaType] = useState<'single' | 'stacked'>('single');
  const [areaOpacity, setAreaOpacity] = useState<'low' | 'medium' | 'high'>('medium');
  const [areaGradient, setAreaGradient] = useState<'off' | 'on'>('on');
  const [areaAppearance, setAreaAppearance] = useState<'light' | 'dark'>('light');

  const [pieKind, setPieKind] = useState<'donut' | 'pie'>('donut');
  const [pieLegendPos, setPieLegendPos] = useState<'bottom' | 'right'>('bottom');
  const [pieCenter, setPieCenter] = useState<'off' | 'on'>('on');
  const [piePct, setPiePct] = useState<'off' | 'on'>('on');
  const [pieAppearance, setPieAppearance] = useState<'light' | 'dark'>('light');
  const [pieHover, setPieHover] = useState<number | null>(null);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const t = buildTheme(isDark);
  const linePreviewDark = lineAppearance === 'dark';
  const barPreviewDark = barAppearance === 'dark';
  const areaPreviewDark = areaAppearance === 'dark';
  const piePreviewDark = pieAppearance === 'dark';

  const lineT = linePreviewDark ? buildTheme(true) : t;
  const barT = barPreviewDark ? buildTheme(true) : t;
  const areaT = areaPreviewDark ? buildTheme(true) : t;
  const pieT = piePreviewDark ? buildTheme(true) : t;

  const sLine = seriesPalette(linePreviewDark);
  const sBar = seriesPalette(barPreviewDark);
  const sArea = seriesPalette(areaPreviewDark);
  const sPie = seriesPalette(piePreviewDark);
  const sDoc = seriesPalette(isDark);

  const donutBase = useMemo(
    () => [
      { name: 'Organic', value: 4200 },
      { name: 'Paid', value: 2800 },
      { name: 'Referral', value: 1900 },
      { name: 'Direct', value: 1200 },
    ],
    [],
  );

  const donutColoredPie = useMemo(
    () => donutBase.map((d, i) => ({ ...d, color: sPie[i % sPie.length] })),
    [donutBase, sPie],
  );

  const donutTotal = donutColoredPie.reduce((a, b) => a + b.value, 0);

  const areaOpacityVal =
    areaOpacity === 'low'
      ? areaPreviewDark
        ? 0.1
        : 0.08
      : areaOpacity === 'medium'
        ? areaPreviewDark
          ? 0.15
          : 0.12
        : areaPreviewDark
          ? 0.22
          : 0.18;

  const lineH = Number(lineHeight);

  const tocItems = useMemo(() => {
    if (activeTab === 'Overview') {
      return [
        { id: 'line-chart', label: 'Line chart' },
        { id: 'bar-chart', label: 'Bar chart' },
        { id: 'area-chart', label: 'Area chart' },
        { id: 'donut-chart', label: 'Donut chart' },
        { id: 'sparkline', label: 'Sparkline' },
        { id: 'tooltip', label: 'Chart tooltip' },
        { id: 'principles', label: 'Principles' },
      ];
    }
    if (activeTab === 'Usage') {
      return [
        { id: 'chart-guide', label: 'Choosing a chart' },
        { id: 'color-usage', label: 'Color usage' },
        { id: 'dos-donts-ch', label: "Do & Don't" },
      ];
    }
    return [];
  }, [activeTab]);

  const tickProps = (pt: VDSTheme) => ({ fill: pt.text.tertiary.default, fontSize: 11 });
  const barRadius: [number, number, number, number] = barRounded === 'on' ? [4, 4, 0, 0] : [0, 0, 0, 0];

  const revenueSpark = lineData.map((d) => d.revenue);
  const usersSpark = lineData.map((d) => d.users);
  const bounceSpark = [32, 29, 31, 28, 27, 26, 25, 26, 24, 25, 24, 24.8];

  const pieLabelStr = (p: { name?: unknown } | undefined) => (p?.name != null ? String(p.name) : undefined);

  return (
    <div className="docs-page-with-toc">
      <p className="breadcrumb">
        Components <ChevronRight size={12} style={{ display: 'inline', verticalAlign: 'middle', opacity: 0.5 }} /> Charts
      </p>
      <h1 className="page-title">Charts</h1>
      <p className="page-lead">
        Charts transform raw numbers into visual patterns. VDS provides six chart types built on Recharts — Line, Bar, Area, Donut, and Sparkline — plus a
        shared ChartTooltip. All charts inherit the VDS color system and respond to light/dark mode automatically.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
        <span style={chipStyleA()}>Stable</span>
        <span style={chipStyleA()}>v1.0</span>
        <span style={chipStyleA()}>Recharts</span>
      </div>

      <ComponentTabs tabs={[...TABS]} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'Overview' ? (
        <ChartsOverviewSections
          t={t}
          gid={gid}
          lineT={lineT}
          barT={barT}
          areaT={areaT}
          pieT={pieT}
          sLine={sLine}
          sBar={sBar}
          sArea={sArea}
          sDoc={sDoc}
          tickProps={tickProps}
          lineSeries={lineSeries}
          lineGrid={lineGrid}
          lineDots={lineDots}
          lineCurve={lineCurve}
          lineLegend={lineLegend}
          lineH={lineH}
          linePreviewDark={linePreviewDark}
          setLineSeries={setLineSeries}
          setLineGrid={setLineGrid}
          setLineDots={setLineDots}
          setLineCurve={setLineCurve}
          setLineLegend={setLineLegend}
          setLineHeight={setLineHeight}
          setLineAppearance={setLineAppearance}
          lineHeight={lineHeight}
          barType={barType}
          barOrient={barOrient}
          barValues={barValues}
          barRounded={barRounded}
          barRadius={barRadius}
          barPreviewDark={barPreviewDark}
          setBarType={setBarType}
          setBarOrient={setBarOrient}
          setBarValues={setBarValues}
          setBarRounded={setBarRounded}
          setBarAppearance={setBarAppearance}
          areaType={areaType}
          areaOpacityVal={areaOpacityVal}
          areaGradient={areaGradient}
          areaPreviewDark={areaPreviewDark}
          setAreaType={setAreaType}
          setAreaOpacity={setAreaOpacity}
          setAreaGradient={setAreaGradient}
          setAreaAppearance={setAreaAppearance}
          areaOpacity={areaOpacity}
          pieKind={pieKind}
          pieLegendPos={pieLegendPos}
          pieCenter={pieCenter}
          piePct={piePct}
          piePreviewDark={piePreviewDark}
          setPieKind={setPieKind}
          setPieLegendPos={setPieLegendPos}
          setPieCenter={setPieCenter}
          setPiePct={setPiePct}
          setPieAppearance={setPieAppearance}
          pieHover={pieHover}
          setPieHover={setPieHover}
          donutColoredPie={donutColoredPie}
          donutTotal={donutTotal}
          donutBase={donutBase}
          revenueSpark={revenueSpark}
          usersSpark={usersSpark}
          bounceSpark={bounceSpark}
          pieLabelStr={pieLabelStr}
        />
      ) : null}

      {activeTab === 'Usage' ? <ChartsUsageTab t={t} sDoc={sDoc} /> : null}

      {activeTab === 'Content' ? <ChartsContentTab t={t} /> : null}

      {activeTab === 'Code' ? (
        <ChartsCodeTab t={t} chartTooltipSnippet={chartTooltipSnippet} codeExamples={codeExamples} />
      ) : null}

      {activeTab === 'Changelog' ? <ChartsChangelogTab t={t} /> : null}

      <TableOfContents items={tocItems} groupLabel="Components" />
    </div>
  );
}
