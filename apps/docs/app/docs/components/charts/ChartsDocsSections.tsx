'use client';

import { Activity, BarChart2, Circle } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { VDSTheme } from '@/lib/theme';
import { Callout } from '@/components/docs/Callout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { LivePreviewSegmentRow, LivePreviewShell } from '@/components/docs/LivePreviewLayout';
import {
  ChartTooltip,
  DonutLegend,
  IllustratedDoDont,
  Sparkline,
  barData,
  chipStyleB,
  lineData,
  mapTooltipPayload,
  variantCardShell,
} from './charts-shared';

export type ChartsOverviewProps = {
  t: VDSTheme;
  gid: string;
  lineT: VDSTheme;
  barT: VDSTheme;
  areaT: VDSTheme;
  pieT: VDSTheme;
  sLine: string[];
  sBar: string[];
  sArea: string[];
  sDoc: string[];
  tickProps: (pt: VDSTheme) => { fill: string; fontSize: number };
  lineSeries: 'single' | 'multi';
  lineGrid: 'off' | 'on';
  lineDots: 'off' | 'on';
  lineCurve: 'off' | 'on';
  lineLegend: 'off' | 'on';
  lineH: number;
  linePreviewDark: boolean;
  setLineSeries: (v: 'single' | 'multi') => void;
  setLineGrid: (v: 'off' | 'on') => void;
  setLineDots: (v: 'off' | 'on') => void;
  setLineCurve: (v: 'off' | 'on') => void;
  setLineLegend: (v: 'off' | 'on') => void;
  setLineHeight: (v: '240' | '320' | '400') => void;
  setLineAppearance: (v: 'light' | 'dark') => void;
  lineHeight: '240' | '320' | '400';
  barType: 'single' | 'grouped' | 'stacked';
  barOrient: 'vertical' | 'horizontal';
  barValues: 'off' | 'on';
  barRounded: 'off' | 'on';
  barRadius: [number, number, number, number];
  barPreviewDark: boolean;
  setBarType: (v: 'single' | 'grouped' | 'stacked') => void;
  setBarOrient: (v: 'vertical' | 'horizontal') => void;
  setBarValues: (v: 'off' | 'on') => void;
  setBarRounded: (v: 'off' | 'on') => void;
  setBarAppearance: (v: 'light' | 'dark') => void;
  areaType: 'single' | 'stacked';
  areaOpacityVal: number;
  areaGradient: 'off' | 'on';
  areaPreviewDark: boolean;
  setAreaType: (v: 'single' | 'stacked') => void;
  setAreaOpacity: (v: 'low' | 'medium' | 'high') => void;
  setAreaGradient: (v: 'off' | 'on') => void;
  setAreaAppearance: (v: 'light' | 'dark') => void;
  areaOpacity: 'low' | 'medium' | 'high';
  pieKind: 'donut' | 'pie';
  pieLegendPos: 'bottom' | 'right';
  pieCenter: 'off' | 'on';
  piePct: 'off' | 'on';
  piePreviewDark: boolean;
  setPieKind: (v: 'donut' | 'pie') => void;
  setPieLegendPos: (v: 'bottom' | 'right') => void;
  setPieCenter: (v: 'off' | 'on') => void;
  setPiePct: (v: 'off' | 'on') => void;
  setPieAppearance: (v: 'light' | 'dark') => void;
  pieHover: number | null;
  setPieHover: (v: number | null) => void;
  donutColoredPie: { name: string; value: number; color: string }[];
  donutTotal: number;
  donutBase: { name: string; value: number }[];
  revenueSpark: number[];
  usersSpark: number[];
  bounceSpark: number[];
  pieLabelStr: (p: { name?: unknown } | undefined) => string | undefined;
};

export function ChartsOverviewSections(p: ChartsOverviewProps) {
  const {
    t,
    gid,
    lineT,
    barT,
    areaT,
    pieT,
    sLine,
    sBar,
    sArea,
    sDoc,
    tickProps,
    lineSeries,
    lineGrid,
    lineDots,
    lineCurve,
    lineLegend,
    lineH,
    linePreviewDark,
    setLineSeries,
    setLineGrid,
    setLineDots,
    setLineCurve,
    setLineLegend,
    setLineHeight,
    setLineAppearance,
    lineHeight,
    barType,
    barOrient,
    barValues,
    barRounded,
    barRadius,
    barPreviewDark,
    setBarType,
    setBarOrient,
    setBarValues,
    setBarRounded,
    setBarAppearance,
    areaType,
    areaOpacityVal,
    areaGradient,
    areaPreviewDark,
    setAreaType,
    setAreaOpacity,
    setAreaGradient,
    setAreaAppearance,
    areaOpacity,
    pieKind,
    pieLegendPos,
    pieCenter,
    piePct,
    piePreviewDark,
    setPieKind,
    setPieLegendPos,
    setPieCenter,
    setPiePct,
    setPieAppearance,
    pieHover,
    setPieHover,
    donutColoredPie,
    donutTotal,
    donutBase,
    revenueSpark,
    usersSpark,
    bounceSpark,
    pieLabelStr,
  } = p;

  return (
    <>
      <section id="line-chart" style={{ marginTop: 32, marginBottom: 48 }}>
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          Line Chart
        </h2>
        <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 16 }}>
          Line charts show trends over time. Use them when the relationship between data points — the slope and direction — is more important than the
          individual values.
        </p>
        <LivePreviewShell
          t={t}
          canvasIsDark={linePreviewDark}
          controls={
            <>
              <LivePreviewSegmentRow t={t} label="Series" options={['single', 'multi']} value={lineSeries} onChange={(v) => setLineSeries(v as 'single' | 'multi')} />
              <LivePreviewSegmentRow t={t} label="Show grid" options={['off', 'on']} value={lineGrid} onChange={(v) => setLineGrid(v as 'off' | 'on')} />
              <LivePreviewSegmentRow t={t} label="Show dots" options={['off', 'on']} value={lineDots} onChange={(v) => setLineDots(v as 'off' | 'on')} />
              <LivePreviewSegmentRow t={t} label="Curved" options={['off', 'on']} value={lineCurve} onChange={(v) => setLineCurve(v as 'off' | 'on')} />
              <LivePreviewSegmentRow t={t} label="Show legend" options={['off', 'on']} value={lineLegend} onChange={(v) => setLineLegend(v as 'off' | 'on')} />
              <LivePreviewSegmentRow t={t} label="Height" options={['240', '320', '400']} value={lineHeight} onChange={(v) => setLineHeight(v as '240' | '320' | '400')} />
              <LivePreviewSegmentRow
                t={t}
                label="Appearance"
                options={['Light', 'Dark']}
                value={linePreviewDark ? 'Dark' : 'Light'}
                onChange={(v) => setLineAppearance(v === 'Dark' ? 'dark' : 'light')}
                showDivider={false}
              />
            </>
          }
        >
          <div style={{ width: '100%', maxWidth: 720, minHeight: 400, padding: 24, boxSizing: 'border-box' }}>
            <ResponsiveContainer width="100%" height={lineH}>
              <LineChart data={[...lineData]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                {lineGrid === 'on' ? <CartesianGrid strokeDasharray="3 3" stroke={lineT.border.default.default} vertical={false} /> : null}
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickProps(lineT)} />
                <YAxis axisLine={false} tickLine={false} tick={tickProps(lineT)} />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltip
                      t={lineT}
                      active={active}
                      label={label as string}
                      payload={mapTooltipPayload(payload as never)}
                      formatter={(v) => `$${v.toLocaleString()}`}
                    />
                  )}
                />
                {lineLegend === 'on' && lineSeries === 'multi' ? (
                  <Legend wrapperStyle={{ color: lineT.text.secondary.default, paddingTop: 8 }} />
                ) : null}
                <Line
                  type={lineCurve === 'on' ? 'monotone' : 'linear'}
                  dataKey="revenue"
                  name="Revenue"
                  stroke={sLine[0]}
                  strokeWidth={2.5}
                  dot={lineDots === 'on'}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                {lineSeries === 'multi' ? (
                  <Line
                    type={lineCurve === 'on' ? 'monotone' : 'linear'}
                    dataKey="users"
                    name="Users"
                    stroke={sLine[1]}
                    strokeWidth={2.5}
                    dot={lineDots === 'on'}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </LivePreviewShell>
        <h3 className="section-title" style={{ marginTop: 28, marginBottom: 12, fontSize: 16 }}>
          Line chart variants
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {variantCardShell(
            t,
            'Single line',
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[...lineData]}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border.default.default} vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickProps(t)} />
                <YAxis axisLine={false} tickLine={false} tick={tickProps(t)} hide />
                <Tooltip content={({ active, payload, label }) => <ChartTooltip t={t} active={active} label={label as string} payload={mapTooltipPayload(payload as never)} />} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke={sDoc[0]} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>,
          )}
          {variantCardShell(
            t,
            'Multi-line',
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[...lineData]}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border.default.default} vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickProps(t)} />
                <YAxis axisLine={false} tickLine={false} tick={tickProps(t)} />
                <Tooltip content={({ active, payload, label }) => <ChartTooltip t={t} active={active} label={label as string} payload={mapTooltipPayload(payload as never)} />} />
                <Legend wrapperStyle={{ paddingTop: 4 }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke={sDoc[0]} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="users" name="Users" stroke={sDoc[1]} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>,
          )}
          {variantCardShell(
            t,
            'With reference line',
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={[...lineData]}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border.default.default} vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickProps(t)} />
                <YAxis axisLine={false} tickLine={false} tick={tickProps(t)} />
                <Tooltip content={({ active, payload, label }) => <ChartTooltip t={t} active={active} label={label as string} payload={mapTooltipPayload(payload as never)} />} />
                <ReferenceLine y={9000} stroke={sDoc[3]} strokeDasharray="4 4" label={{ value: 'Target', fill: t.text.tertiary.default, fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke={sDoc[0]} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>,
          )}
        </div>
      </section>

      <section id="bar-chart" style={{ marginBottom: 48 }}>
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          Bar Chart
        </h2>
        <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 16 }}>
          Bar charts compare discrete categories. Use vertical bars to compare values across categories; use horizontal bars when category labels are long or
          there are many categories.
        </p>
        <LivePreviewShell
          t={t}
          canvasIsDark={barPreviewDark}
          controls={
            <>
              <LivePreviewSegmentRow t={t} label="Type" options={['single', 'grouped', 'stacked']} value={barType} onChange={(v) => setBarType(v as typeof barType)} />
              <LivePreviewSegmentRow t={t} label="Orientation" options={['vertical', 'horizontal']} value={barOrient} onChange={(v) => setBarOrient(v as typeof barOrient)} />
              <LivePreviewSegmentRow t={t} label="Show values" options={['off', 'on']} value={barValues} onChange={(v) => setBarValues(v as 'off' | 'on')} />
              <LivePreviewSegmentRow t={t} label="Rounded" options={['off', 'on']} value={barRounded} onChange={(v) => setBarRounded(v as 'off' | 'on')} />
              <LivePreviewSegmentRow
                t={t}
                label="Appearance"
                options={['Light', 'Dark']}
                value={barPreviewDark ? 'Dark' : 'Light'}
                onChange={(v) => setBarAppearance(v === 'Dark' ? 'dark' : 'light')}
                showDivider={false}
              />
            </>
          }
        >
          <div style={{ width: '100%', maxWidth: 720, minHeight: 400, padding: 24, boxSizing: 'border-box' }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                layout={barOrient === 'horizontal' ? 'vertical' : undefined}
                data={[...barData]}
                barGap={4}
                barCategoryGap="30%"
                margin={{ top: 8, right: 8, left: barOrient === 'horizontal' ? 8 : 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={barT.border.default.default} vertical={false} />
                {barOrient === 'horizontal' ? (
                  <>
                    <XAxis type="number" axisLine={false} tickLine={false} tick={tickProps(barT)} />
                    <YAxis dataKey="quarter" type="category" axisLine={false} tickLine={false} tick={tickProps(barT)} width={40} />
                  </>
                ) : (
                  <>
                    <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={tickProps(barT)} />
                    <YAxis axisLine={false} tickLine={false} tick={tickProps(barT)} />
                  </>
                )}
                <Tooltip content={({ active, payload, label }) => <ChartTooltip t={barT} active={active} label={label as string} payload={mapTooltipPayload(payload as never)} />} />
                <Legend wrapperStyle={{ color: barT.text.secondary.default, paddingTop: 4 }} />
                {barType === 'single' ? (
                  <Bar dataKey="design" name="Design" fill={sBar[0]} radius={barRadius} barSize={32}>
                    {barValues === 'on' ? (
                      <LabelList dataKey="design" position={barOrient === 'horizontal' ? 'right' : 'top'} style={{ fill: barT.text.primary.default, fontSize: 11 }} />
                    ) : null}
                  </Bar>
                ) : null}
                {barType === 'grouped' ? (
                  <>
                    <Bar dataKey="design" name="Design" fill={sBar[0]} radius={barRadius} barSize={32}>
                      {barValues === 'on' ? (
                        <LabelList dataKey="design" position={barOrient === 'horizontal' ? 'right' : 'top'} style={{ fill: barT.text.primary.default, fontSize: 11 }} />
                      ) : null}
                    </Bar>
                    <Bar dataKey="code" name="Code" fill={sBar[1]} radius={barRadius} barSize={32}>
                      {barValues === 'on' ? (
                        <LabelList dataKey="code" position={barOrient === 'horizontal' ? 'right' : 'top'} style={{ fill: barT.text.primary.default, fontSize: 11 }} />
                      ) : null}
                    </Bar>
                    <Bar dataKey="consulting" name="Consulting" fill={sBar[2]} radius={barRadius} barSize={32}>
                      {barValues === 'on' ? (
                        <LabelList dataKey="consulting" position={barOrient === 'horizontal' ? 'right' : 'top'} style={{ fill: barT.text.primary.default, fontSize: 11 }} />
                      ) : null}
                    </Bar>
                  </>
                ) : null}
                {barType === 'stacked' ? (
                  <>
                    <Bar dataKey="design" name="Design" stackId="a" fill={sBar[0]} radius={barRadius}>
                      {barValues === 'on' ? (
                        <LabelList dataKey="design" position={barOrient === 'horizontal' ? 'right' : 'top'} style={{ fill: barT.text.primary.default, fontSize: 11 }} />
                      ) : null}
                    </Bar>
                    <Bar dataKey="code" name="Code" stackId="a" fill={sBar[1]} radius={barRadius}>
                      {barValues === 'on' ? (
                        <LabelList dataKey="code" position={barOrient === 'horizontal' ? 'right' : 'top'} style={{ fill: barT.text.primary.default, fontSize: 11 }} />
                      ) : null}
                    </Bar>
                    <Bar dataKey="consulting" name="Consulting" stackId="a" fill={sBar[2]} radius={barRadius}>
                      {barValues === 'on' ? (
                        <LabelList dataKey="consulting" position={barOrient === 'horizontal' ? 'right' : 'top'} style={{ fill: barT.text.primary.default, fontSize: 11 }} />
                      ) : null}
                    </Bar>
                  </>
                ) : null}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </LivePreviewShell>
        <h3 className="section-title" style={{ marginTop: 28, marginBottom: 12, fontSize: 16 }}>
          Bar chart variants
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {variantCardShell(
            t,
            'Vertical single',
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[...barData]} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke={t.border.default.default} vertical={false} />
                <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={tickProps(t)} />
                <YAxis axisLine={false} tickLine={false} tick={tickProps(t)} />
                <Tooltip content={({ active, payload, label }) => <ChartTooltip t={t} active={active} label={label as string} payload={mapTooltipPayload(payload as never)} />} />
                <Bar dataKey="design" name="Design" fill={sDoc[0]} radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>,
          )}
          {variantCardShell(
            t,
            'Grouped',
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[...barData]} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={t.border.default.default} vertical={false} />
                <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={tickProps(t)} />
                <YAxis axisLine={false} tickLine={false} tick={tickProps(t)} />
                <Tooltip content={({ active, payload, label }) => <ChartTooltip t={t} active={active} label={label as string} payload={mapTooltipPayload(payload as never)} />} />
                <Legend />
                <Bar dataKey="design" fill={sDoc[0]} radius={[4, 4, 0, 0]} barSize={28} />
                <Bar dataKey="code" fill={sDoc[1]} radius={[4, 4, 0, 0]} barSize={28} />
                <Bar dataKey="consulting" fill={sDoc[2]} radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>,
          )}
          {variantCardShell(
            t,
            'Stacked horizontal',
            <ResponsiveContainer width="100%" height={220}>
              <BarChart layout="vertical" data={[...barData]} margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border.default.default} vertical={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={tickProps(t)} />
                <YAxis dataKey="quarter" type="category" axisLine={false} tickLine={false} tick={tickProps(t)} width={36} />
                <Tooltip content={({ active, payload, label }) => <ChartTooltip t={t} active={active} label={label as string} payload={mapTooltipPayload(payload as never)} />} />
                <Bar dataKey="design" stackId="a" fill={sDoc[0]} radius={[0, 4, 4, 0]} />
                <Bar dataKey="code" stackId="a" fill={sDoc[1]} radius={[0, 4, 4, 0]} />
                <Bar dataKey="consulting" stackId="a" fill={sDoc[2]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>,
          )}
        </div>
      </section>

      <section id="area-chart" style={{ marginBottom: 48 }}>
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          Area Chart
        </h2>
        <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 16 }}>
          Area charts are line charts with the area beneath filled. The fill emphasizes volume and magnitude — use them when the size of the area carries
          meaning, like cumulative totals or part-to-whole relationships over time.
        </p>
        <LivePreviewShell
          t={t}
          canvasIsDark={areaPreviewDark}
          controls={
            <>
              <LivePreviewSegmentRow t={t} label="Type" options={['single', 'stacked']} value={areaType} onChange={(v) => setAreaType(v as typeof areaType)} />
              <LivePreviewSegmentRow t={t} label="Fill opacity" options={['low', 'medium', 'high']} value={areaOpacity} onChange={(v) => setAreaOpacity(v as typeof areaOpacity)} />
              <LivePreviewSegmentRow t={t} label="Gradient" options={['off', 'on']} value={areaGradient} onChange={(v) => setAreaGradient(v as 'off' | 'on')} />
              <LivePreviewSegmentRow
                t={t}
                label="Appearance"
                options={['Light', 'Dark']}
                value={areaPreviewDark ? 'Dark' : 'Light'}
                onChange={(v) => setAreaAppearance(v === 'Dark' ? 'dark' : 'light')}
                showDivider={false}
              />
            </>
          }
        >
          <div style={{ width: '100%', maxWidth: 720, minHeight: 400, padding: 24, boxSizing: 'border-box' }}>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={[...lineData]} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradientBrand-${gid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sArea[0]} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={sArea[0]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`gradientPurple-${gid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sArea[1]} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={sArea[1]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={areaT.border.default.default} vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickProps(areaT)} />
                <YAxis axisLine={false} tickLine={false} tick={tickProps(areaT)} />
                <Tooltip content={({ active, payload, label }) => <ChartTooltip t={areaT} active={active} label={label as string} payload={mapTooltipPayload(payload as never)} />} />
                {areaType === 'single' ? (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={sArea[0]}
                    strokeWidth={2}
                    fill={areaGradient === 'on' ? `url(#gradientBrand-${gid})` : sArea[0]}
                    fillOpacity={areaGradient === 'on' ? 1 : areaOpacityVal}
                    dot={false}
                  />
                ) : (
                  <>
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue"
                      stackId="1"
                      stroke={sArea[0]}
                      strokeWidth={2}
                      fill={areaGradient === 'on' ? `url(#gradientBrand-${gid})` : sArea[0]}
                      fillOpacity={areaGradient === 'on' ? 0.2 : areaOpacityVal * 1.1}
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="Users"
                      stackId="1"
                      stroke={sArea[1]}
                      strokeWidth={2}
                      fill={areaGradient === 'on' ? `url(#gradientPurple-${gid})` : sArea[1]}
                      fillOpacity={areaGradient === 'on' ? 0.15 : areaOpacityVal * 0.85}
                      dot={false}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </LivePreviewShell>
        <h3 className="section-title" style={{ marginTop: 28, marginBottom: 12, fontSize: 16 }}>
          Area chart variants
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {variantCardShell(
            t,
            'Single area with gradient',
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={[...lineData]}>
                <defs>
                  <linearGradient id={`g1-${gid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sDoc[0]} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={sDoc[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border.default.default} vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickProps(t)} />
                <YAxis axisLine={false} tickLine={false} tick={tickProps(t)} hide />
                <Tooltip content={({ active, payload, label }) => <ChartTooltip t={t} active={active} label={label as string} payload={mapTooltipPayload(payload as never)} />} />
                <Area type="monotone" dataKey="revenue" stroke={sDoc[0]} strokeWidth={2} fill={`url(#g1-${gid})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>,
          )}
          {variantCardShell(
            t,
            'Stacked area',
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={[...lineData]}>
                <defs>
                  <linearGradient id={`g2-${gid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sDoc[0]} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={sDoc[0]} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={`g3-${gid}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={sDoc[1]} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={sDoc[1]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border.default.default} vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickProps(t)} />
                <YAxis axisLine={false} tickLine={false} tick={tickProps(t)} />
                <Tooltip content={({ active, payload, label }) => <ChartTooltip t={t} active={active} label={label as string} payload={mapTooltipPayload(payload as never)} />} />
                <Area type="monotone" dataKey="revenue" stackId="s" stroke={sDoc[0]} strokeWidth={2} fill={`url(#g2-${gid})`} dot={false} />
                <Area type="monotone" dataKey="users" stackId="s" stroke={sDoc[1]} strokeWidth={2} fill={`url(#g3-${gid})`} dot={false} />
              </AreaChart>
            </ResponsiveContainer>,
          )}
        </div>
      </section>

      <section id="donut-chart" style={{ marginBottom: 48 }}>
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          Donut Chart
        </h2>
        <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 16 }}>
          Donut and pie charts show part-to-whole relationships. Use them when you have 2–5 categories and the proportion between them is the primary insight.
          A donut&apos;s center can display a summary metric.
        </p>
        <LivePreviewShell
          t={t}
          canvasIsDark={piePreviewDark}
          controls={
            <>
              <LivePreviewSegmentRow t={t} label="Type" options={['donut', 'pie']} value={pieKind} onChange={(v) => setPieKind(v as typeof pieKind)} />
              <LivePreviewSegmentRow t={t} label="Legend position" options={['bottom', 'right']} value={pieLegendPos} onChange={(v) => setPieLegendPos(v as typeof pieLegendPos)} />
              <LivePreviewSegmentRow t={t} label="Center label" options={['off', 'on']} value={pieCenter} onChange={(v) => setPieCenter(v as 'off' | 'on')} />
              <LivePreviewSegmentRow t={t} label="Percentages" options={['off', 'on']} value={piePct} onChange={(v) => setPiePct(v as 'off' | 'on')} />
              <LivePreviewSegmentRow
                t={t}
                label="Appearance"
                options={['Light', 'Dark']}
                value={piePreviewDark ? 'Dark' : 'Light'}
                onChange={(v) => setPieAppearance(v === 'Dark' ? 'dark' : 'light')}
                showDivider={false}
              />
            </>
          }
        >
          <div style={{ width: '100%', maxWidth: 720, minHeight: 400, padding: 24, boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexDirection: pieLegendPos === 'right' ? 'row' : 'column', alignItems: 'center', gap: 8, position: 'relative' }}>
              <div style={{ width: pieLegendPos === 'right' ? '72%' : '100%', height: 280, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => (
                        <ChartTooltip
                          t={pieT}
                          active={active}
                          label={pieLabelStr(payload?.[0])}
                          payload={mapTooltipPayload(payload as never)}
                          formatter={(v) => (piePct === 'on' ? `${((v / donutTotal) * 100).toFixed(1)}%` : v.toLocaleString())}
                        />
                      )}
                    />
                    <Pie
                      data={donutColoredPie}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={pieKind === 'donut' ? '60%' : '0%'}
                      outerRadius="80%"
                      paddingAngle={3}
                      cornerRadius={4}
                      onMouseEnter={(_, i) => setPieHover(i)}
                      onMouseLeave={() => setPieHover(null)}
                    >
                      {donutColoredPie.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                          opacity={pieHover === null || pieHover === index ? 1 : 0.55}
                          style={{ filter: pieHover === index ? 'brightness(1.08)' : undefined, outline: 'none' }}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {pieKind === 'donut' && pieCenter === 'on' ? (
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      pointerEvents: 'none',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 600, color: pieT.text.tertiary.default }}>Total</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: pieT.text.primary.default }}>{donutTotal.toLocaleString()}</div>
                  </div>
                ) : null}
              </div>
              <DonutLegend t={pieT} items={donutColoredPie} total={donutTotal} showPct={piePct === 'on'} position={pieLegendPos} />
            </div>
          </div>
        </LivePreviewShell>
        <h3 className="section-title" style={{ marginTop: 28, marginBottom: 12, fontSize: 16 }}>
          Donut variants
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {variantCardShell(
            t,
            'Donut with center label',
            <div style={{ position: 'relative', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    content={({ active, payload }) => (
                      <ChartTooltip t={t} active={active} label={pieLabelStr(payload?.[0])} payload={mapTooltipPayload(payload as never)} />
                    )}
                  />
                  <Pie data={donutBase.map((d, i) => ({ ...d, color: sDoc[i] }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="58%" outerRadius="78%" paddingAngle={3} cornerRadius={4}>
                    {donutBase.map((_, i) => (
                      <Cell key={i} fill={sDoc[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: t.text.tertiary.default }}>Total</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: t.text.primary.default }}>{donutTotal.toLocaleString()}</div>
              </div>
            </div>,
          )}
          {variantCardShell(
            t,
            'Pie with legend right',
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0, height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => (
                        <ChartTooltip t={t} active={active} label={pieLabelStr(payload?.[0])} payload={mapTooltipPayload(payload as never)} />
                      )}
                    />
                    <Pie data={donutBase.map((d, i) => ({ ...d, color: sDoc[i] }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="0%" outerRadius="78%" paddingAngle={2} cornerRadius={4}>
                      {donutBase.map((_, i) => (
                        <Cell key={i} fill={sDoc[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <DonutLegend t={t} items={donutBase.map((d, i) => ({ ...d, color: sDoc[i] }))} total={donutTotal} showPct position="right" />
            </div>,
          )}
        </div>
      </section>

      <section id="sparkline" style={{ marginBottom: 48 }}>
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          Sparkline
        </h2>
        <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 16 }}>
          Sparklines are micro-charts — tiny, word-sized visualizations embedded inline. They show a trend at a glance without axes, labels, or interaction. Use
          them inside stat cards, table cells, and list items.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 16,
            background: t.bg.surface.secondary.default,
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 14,
            padding: 24,
          }}
        >
          {[
            { label: 'Revenue', value: '$48,295', sub: '↑ +12.5%', subColor: '#0A8853', data: revenueSpark, color: sDoc[0], fill: true },
            { label: 'Users', value: '8,492', sub: '↑ +3.2%', subColor: '#0A8853', data: usersSpark, color: sDoc[2], fill: false },
            { label: 'Bounce rate', value: '24.8%', sub: '↓ 1.4%', subColor: '#D22232', data: bounceSpark, color: sDoc[4], fill: false },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                background: t.bg.surface.primary.default,
                border: `1px solid ${t.border.default.default}`,
                borderRadius: 14,
                padding: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: t.text.tertiary.default,
                  }}
                >
                  {row.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.text.primary.default, marginTop: 4 }}>{row.value}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: row.subColor, marginTop: 4 }}>{row.sub}</div>
              </div>
              <Sparkline data={row.data} color={row.color} fill={row.fill} />
            </div>
          ))}
        </div>
        <h3 className="section-title" style={{ marginTop: 28, marginBottom: 12, fontSize: 16 }}>
          Sparkline variants
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {(['line', 'bar', 'area', 'dots'] as const).map((v) => (
            <div key={v}>
              {variantCardShell(
                t,
                v === 'line' ? 'Line' : v === 'bar' ? 'Bar' : v === 'area' ? 'Area' : 'Dots only',
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                  <Sparkline data={revenueSpark} color={sDoc[0]} variant={v} fill={v === 'area'} />
                </div>,
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="tooltip" style={{ marginBottom: 48 }}>
        <h2 className="section-title" style={{ marginBottom: 8 }}>
          Chart Tooltip
        </h2>
        <p style={{ fontSize: 15, color: t.text.secondary.default, lineHeight: 1.6, marginBottom: 16 }}>
          ChartTooltip is the shared custom tooltip used by all VDS charts. It replaces Recharts&apos; default tooltip with a styled panel that matches the VDS
          design language.
        </p>
        <div
          style={{
            position: 'relative',
            border: `1px solid ${t.border.default.default}`,
            borderRadius: 14,
            overflow: 'hidden',
            background: t.bg.surface.secondary.default,
            padding: 24,
            minHeight: 260,
          }}
        >
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[...lineData]}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.border.default.default} vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickProps(t)} />
                <YAxis axisLine={false} tickLine={false} tick={tickProps(t)} hide />
                <Line type="monotone" dataKey="revenue" stroke={sDoc[0]} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="users" stroke={sDoc[1]} strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ position: 'absolute', left: '52%', top: '18%', transform: 'translateX(-50%)' }}>
            <ChartTooltip
              t={t}
              active
              label="April"
              payload={[
                { name: 'Revenue', value: 7800, color: sDoc[0], dataKey: 'revenue' },
                { name: 'Users', value: 1290, color: sDoc[1], dataKey: 'users' },
              ]}
              formatter={(v, n) => (n === 'Revenue' ? `$${v.toLocaleString()}` : v.toLocaleString())}
            />
          </div>
        </div>
      </section>

      <section id="principles" style={{ marginBottom: 48 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>
          Chart design principles
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: 20, borderBottom: `1px solid ${t.border.default.default}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart2 size={18} color={t.text.brand.default} aria-hidden />
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Chart type must match the question</div>
            </div>
            <div style={{ padding: 20, background: t.bg.surface.secondary.default, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <svg width={100} height={56} viewBox="0 0 100 56" aria-hidden>
                  <polyline fill="none" stroke={sDoc[0]} strokeWidth="2.5" points="4,40 20,32 36,28 52,18 68,22 84,8 96,12" />
                </svg>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.text.success.default, marginTop: 4 }}>Right chart type</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <svg width={100} height={56} viewBox="0 0 100 56" aria-hidden>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                    <line key={i} x1={8 + i * 7} y1={8} x2={8 + i * 7} y2={44} stroke={sDoc[i % 5]} strokeWidth={4} />
                  ))}
                </svg>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.text.danger.default, marginTop: 4 }}>Wrong chart type</div>
              </div>
            </div>
            <p style={{ padding: 20, fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
              Line charts answer &apos;how did this change over time?&apos; Bar charts answer &apos;how do these categories compare?&apos; Donut charts answer &apos;what&apos;s the
              proportion?&apos; Choose the chart type that answers the user&apos;s actual question — not the one that looks most impressive.
            </p>
          </div>
          <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: 20, borderBottom: `1px solid ${t.border.default.default}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={18} color={t.text.brand.default} aria-hidden />
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Limit series to 5 max</div>
            </div>
            <div style={{ padding: 20, background: t.bg.surface.secondary.default, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <svg width={100} height={56} viewBox="0 0 100 56" aria-hidden>
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <polyline
                      key={i}
                      fill="none"
                      stroke={sDoc[i % 5]}
                      strokeWidth="1.5"
                      opacity={0.9}
                      points={`0,${10 + (i * 5) % 30} 100,${20 + ((i * 7) % 55)}`}
                    />
                  ))}
                </svg>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.text.danger.default, marginTop: 4 }}>8 series</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <svg width={100} height={56} viewBox="0 0 100 56" aria-hidden>
                  <polyline fill="none" stroke={sDoc[0]} strokeWidth="2.5" points="4,36 24,28 44,30 64,14 84,20 96,10" />
                  <polyline fill="none" stroke={sDoc[1]} strokeWidth="2.5" points="4,44 24,40 44,38 64,32 84,28 96,24" />
                </svg>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.text.success.default, marginTop: 4 }}>2 series</div>
              </div>
            </div>
            <p style={{ padding: 20, fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
              Each additional data series adds cognitive load. Beyond 5 series, the chart becomes a noise machine — users can&apos;t distinguish lines or bars. If
              you have more than 5 series, aggregate the smaller ones into &apos;Other&apos;, filter to the top N, or use a different visualization.
            </p>
          </div>
          <div style={{ background: t.bg.surface.primary.default, border: `1px solid ${t.border.default.default}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: 20, borderBottom: `1px solid ${t.border.default.default}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Circle size={18} color={t.text.brand.default} aria-hidden />
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text.primary.default }}>Always start the Y-axis at zero for bar charts</div>
            </div>
            <div style={{ padding: 20, background: t.bg.surface.secondary.default, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <svg width={100} height={56} viewBox="0 0 100 56" aria-hidden>
                  <line x1="8" y1="48" x2="92" y2="48" stroke={t.border.default.default} strokeWidth="1" strokeDasharray="3 3" />
                  <rect x="18" y="22" width="14" height="26" fill={sDoc[0]} rx={2} />
                  <rect x="44" y="16" width="14" height="32" fill={sDoc[0]} rx={2} />
                  <rect x="70" y="28" width="14" height="20" fill={sDoc[0]} rx={2} />
                </svg>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.text.success.default, marginTop: 4 }}>Grid + zero</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <svg width={100} height={56} viewBox="0 0 100 56" aria-hidden>
                  <rect x="18" y="8" width="14" height="40" fill={sDoc[4]} rx={2} />
                  <rect x="44" y="12" width="14" height="36" fill={sDoc[4]} rx={2} />
                  <rect x="70" y="18" width="14" height="30" fill={sDoc[4]} rx={2} />
                </svg>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.text.danger.default, marginTop: 4 }}>Truncated axis</div>
              </div>
            </div>
            <p style={{ padding: 20, fontSize: 13, color: t.text.secondary.default, lineHeight: 1.6, margin: 0 }}>
              Truncating the Y-axis in a bar chart exaggerates differences — a 5% difference looks like 500%. Line charts can start at the data range, but bar
              charts must start at zero. Grid lines should be subtle — present enough to anchor values, invisible enough to not compete with the data.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export function ChartsUsageTab({ t, sDoc }: { t: VDSTheme; sDoc: string[] }) {
  return (
    <>
      <section id="chart-guide" style={{ marginTop: 32, marginBottom: 48 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>
          Choosing a chart
        </h2>
        <div style={{ overflowX: 'auto', border: `1px solid ${t.border.default.default}`, borderRadius: 14 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: t.bg.surface.secondary.default }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.primary.default }}>Chart</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.primary.default }}>Use when</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.primary.default }}>Avoid when</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Line', 'Trend over time, continuous data', 'Comparing discrete categories'],
                ['Bar', 'Comparing categories, ranking items', 'Showing trends (use Line)'],
                ['Area', 'Volume over time, cumulative totals', 'Comparing multiple series (gets cluttered)'],
                ['Donut', 'Part-to-whole, 2–5 categories', 'More than 5 slices, precise comparison'],
                ['Sparkline', 'Micro-trend in tight space', 'Detailed analysis needed'],
              ].map((row) => (
                <tr key={row[0]}>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border.default.default}`, fontWeight: 700, color: t.text.primary.default }}>{row[0]}</td>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.secondary.default }}>{row[1]}</td>
                  <td style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border.default.default}`, color: t.text.secondary.default }}>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section id="color-usage" style={{ marginBottom: 48 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>
          Color usage
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          {[
            { n: 'brand', c: '#002b49' },
            { n: 'purple', c: '#7C3AED' },
            { n: 'green', c: '#0A8853' },
            { n: 'orange', c: '#F07332' },
            { n: 'red', c: '#D22232' },
          ].map((sw) => (
            <div key={sw.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: sw.c, border: `1px solid ${t.border.default.default}` }} />
              <span style={{ fontSize: 13, color: t.text.secondary.default }}>
                {sw.n} {sw.c}
              </span>
            </div>
          ))}
        </div>
        <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
          <li>Always use series colors in order: brand first, then purple, green, orange, red</li>
          <li>Never reuse the same color for different series in the same chart</li>
          <li>Red is semantically loaded — reserve it for negative trends or alerts</li>
          <li>In dark mode, brand automatically switches to #1565A8 for contrast</li>
        </ul>
        <Callout variant="warning" title="Color is not the only differentiator">
          Never rely on color alone to distinguish series — approximately 8% of men have color vision deficiency. Use dashed/solid line styles or different marker
          shapes as secondary differentiators in multi-series charts.
        </Callout>
      </section>
      <section id="dos-donts-ch" style={{ marginBottom: 48 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>
          Do &amp; Don&apos;t
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <IllustratedDoDont
            t={t}
            ok
            title="Y-axis origin"
            caption="DO: bar chart with Y-axis starting at 0. DON&apos;T: bar chart with a truncated Y-axis starting at 4000 — differences look far larger than they are."
          >
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              <ResponsiveContainer width={140} height={100}>
                <BarChart data={[{ q: 'A', v: 4200 }, { q: 'B', v: 4600 }]}>
                  <XAxis dataKey="q" hide />
                  <YAxis domain={[0, 5000]} hide />
                  <Bar dataKey="v" fill={sDoc[0]} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <ResponsiveContainer width={140} height={100}>
                <BarChart data={[{ q: 'A', v: 4200 }, { q: 'B', v: 4600 }]}>
                  <XAxis dataKey="q" hide />
                  <YAxis domain={[4000, 5000]} hide />
                  <Bar dataKey="v" fill={sDoc[4]} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </IllustratedDoDont>
          <IllustratedDoDont
            t={t}
            ok
            title="Series count"
            caption="DO: line chart with 2 well-differentiated series and a clear legend. DON&apos;T: line chart with 7 series in similar hues — unreadable."
          >
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              <ResponsiveContainer width={150} height={90}>
                <LineChart data={lineData.slice(0, 6)}>
                  <Line type="monotone" dataKey="revenue" stroke={sDoc[0]} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="users" stroke={sDoc[1]} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <svg width={150} height={90} viewBox="0 0 150 90" aria-hidden>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <polyline
                    key={i}
                    fill="none"
                    stroke={sDoc[i % 5]}
                    strokeWidth="1.5"
                    opacity={0.85}
                    points={`0,${70 - i * 6} 150,${12 + ((i * 11) % 55)}`}
                  />
                ))}
              </svg>
            </div>
          </IllustratedDoDont>
          <IllustratedDoDont
            t={t}
            ok
            title="Empty state"
            caption='DO: chart container with EmptyState sm — "No data available for this period". DON&apos;T: empty container or broken Recharts when data=[]'
          >
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
              <div
                style={{
                  width: 160,
                  padding: 16,
                  borderRadius: 12,
                  border: `1px dashed ${t.border.default.default}`,
                  background: t.bg.surface.primary.default,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: t.text.tertiary.default }}>NO DATA</div>
                <div style={{ fontSize: 12, color: t.text.secondary.default, marginTop: 6 }}>No data available for this period</div>
              </div>
              <div style={{ width: 160, height: 90, borderRadius: 12, border: `1px solid ${t.border.default.default}`, background: t.bg.surface.primary.default }} />
            </div>
          </IllustratedDoDont>
        </div>
      </section>
    </>
  );
}

export function ChartsContentTab({ t }: { t: VDSTheme }) {
  return (
    <section style={{ marginTop: 32, marginBottom: 48 }}>
      <h2 className="section-title" style={{ marginBottom: 12 }}>
        Axis labels
      </h2>
      <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75, marginBottom: 24 }}>
        <li>X-axis: category or time label, concise — &apos;Jan&apos; not &apos;January 2026&apos;</li>
        <li>Y-axis: unit when not obvious — &apos;$&apos; prefix or &apos;K&apos; suffix for thousands</li>
        <li>Never repeat the chart title in the axis labels</li>
      </ul>
      <h2 className="section-title" style={{ marginBottom: 12 }}>
        Legend labels
      </h2>
      <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75, marginBottom: 24 }}>
        <li>Match exactly the data series name</li>
        <li>Sentence case: &apos;Monthly revenue&apos; not &apos;MONTHLY REVENUE&apos;</li>
        <li>Short: 1–3 words max</li>
      </ul>
      <h2 className="section-title" style={{ marginBottom: 12 }}>
        Tooltip values
      </h2>
      <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75, marginBottom: 24 }}>
        <li>Format numbers consistently: &apos;$4,200&apos; not &apos;4200.00&apos;</li>
        <li>Abbreviate large numbers: &apos;$4.2K&apos;, &apos;$1.2M&apos;</li>
        <li>Include units in the tooltip value: &apos;4,200 users&apos; not just &apos;4,200&apos;</li>
      </ul>
      <h2 className="section-title" style={{ marginBottom: 12 }}>
        Chart titles (when shown above)
      </h2>
      <ul style={{ paddingLeft: 20, color: t.text.secondary.default, fontSize: 14, lineHeight: 1.75 }}>
        <li>Describe the insight, not the data: &apos;Revenue grew 37% in H2&apos; not &apos;Monthly Revenue&apos;</li>
        <li>Or describe the data neutrally: &apos;Monthly revenue by product, Q1–Q4 2026&apos;</li>
      </ul>
    </section>
  );
}

export function ChartsCodeTab({ t, chartTooltipSnippet, codeExamples }: { t: VDSTheme; chartTooltipSnippet: string; codeExamples: string }) {
  return (
    <>
      <section style={{ marginTop: 32, marginBottom: 24 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>
          ChartTooltip
        </h2>
        <CodeBlock code={chartTooltipSnippet} language="tsx" />
      </section>
      <section style={{ marginBottom: 24 }}>
        <h2 className="section-title" style={{ marginBottom: 16 }}>
          Examples
        </h2>
        <CodeBlock code={codeExamples} language="tsx" />
      </section>
      <Callout variant="info" title="Recharts dependency">
        All VDS charts (except Sparkline) are built on Recharts. Install it with: pnpm add recharts. Sparkline uses a hand-crafted SVG implementation for maximum
        flexibility and minimal bundle size — it has zero dependencies.
      </Callout>
      <Callout variant="tip" title="Responsive containers">
        Always wrap charts in ResponsiveContainer with width=&apos;100%&apos;. Set height as a fixed pixel value or use a percentage of a known parent height. Never use
        percentage heights directly — Recharts requires a parent with explicit dimensions.
      </Callout>
    </>
  );
}

export function ChartsChangelogTab({ t }: { t: VDSTheme }) {
  return (
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
            Initial release. Charts: LineChart (single/multi-series), BarChart (vertical/horizontal, single/grouped/stacked), AreaChart (single/stacked with
            gradient), DonutChart (donut/pie with center label), Sparkline (SVG manual, line/bar/area/dots), ChartTooltip (shared custom tooltip). All charts use
            the VDS 5-color series palette and respond to light/dark mode.
          </p>
        </div>
      </div>
    </section>
  );
}
