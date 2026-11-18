'use client';

import * as React from 'react';
import { cn, Tooltip, Card, CardContent, CardHeader, CardTitle } from '@generalstaff/ui-components';

// Color palette following dataviz reference palette
const CHART_COLORS = {
  light: {
    surface: '#fcfcfb',
    surface2: '#f9f9f7',
    textPrimary: '#0b0b0b',
    textSecondary: '#52514e',
    textMuted: '#898781',
    gridline: '#e1e0d9',
    baseline: '#c3c2b7',
    border: 'rgba(11,11,11,0.10)',
    series: [
      '#2a78d6', // blue - slot 1
      '#eb6834', // orange - slot 2
      '#1baf7a', // aqua - slot 3
      '#eda100', // yellow - slot 4
      '#e87ba4', // magenta - slot 5
      '#008300', // green - slot 6
      '#6250d6', // violet - slot 7
      '#e34948', // red - slot 8
    ],
  },
  dark: {
    surface: '#1a1a19',
    surface2: '#0d0d0d',
    textPrimary: '#f0efec',
    textSecondary: '#c3c2b7',
    textMuted: '#898781',
    gridline: '#2c2c2a',
    baseline: '#383835',
    border: 'rgba(255,255,255,0.10)',
    series: [
      '#3987e5', // blue - slot 1
      '#d95926', // orange - slot 2
      '#199e70', // aqua - slot 3
      '#c98500', // yellow - slot 4
      '#d55181', // magenta - slot 5
      '#008300', // green - slot 6
      '#9085e9', // violet - slot 7
      '#e66767', // red - slot 8
    ],
  },
};

const BAR_MAX_THICKNESS = 24;
const BAR_RADIUS = 4;
const LINE_WIDTH = 2;
const MARKER_RADIUS = 5;
const SURFACE_GAP = 2;
const SURFACE_RING = 2;

interface ChartProps {
  data: Record<string, number | string>[];
  keys: string[];
  labels?: string[];
  colors?: string[];
  title?: string;
  subtitle?: string;
  className?: string;
  width?: number;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  formatValue?: (value: number, key: string) => string;
  xKey?: string;
}

function getColors(colors?: string[], count: number = 1) {
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const palette = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  if (colors && colors.length > 0) return colors;
  return palette.series.slice(0, count);
}

function useThemeColors() {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDark ? CHART_COLORS.dark : CHART_COLORS.light;
}

function formatNumber(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
  return value.toLocaleString();
}

// ============================================
// BAR CHART
// ============================================

interface BarChartProps extends ChartProps {
  horizontal?: boolean;
  stacked?: boolean;
}

export function BarChart({
  data,
  keys,
  labels,
  colors: customColors,
  title,
  subtitle,
  className,
  width = 600,
  height = 300,
  showLegend = true,
  showGrid = true,
  formatValue,
  xKey = 'label',
  horizontal = false,
  stacked = false,
}: BarChartProps) {
  const themeColors = useThemeColors();
  const seriesColors = getColors(customColors, keys.length);

  const margin = { top: 20, right: showLegend ? 120 : 20, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xLabels = data.map(d => String(d[xKey]));
  const maxValue = Math.max(...data.flatMap(d => keys.map(k => Number(d[k]) || 0)));
  const yDomain = [0, maxValue * 1.1];

  const xScale = horizontal
    ? (value: number) => (value / yDomain[1]) * innerWidth
    : (index: number) => (index / Math.max(data.length - 1, 1)) * innerWidth;

  const yScale = horizontal
    ? (index: number) => (index / Math.max(data.length - 1, 1)) * innerHeight
    : (value: number) => innerHeight - (value / yDomain[1]) * innerHeight;

  const barBandWidth = horizontal
    ? innerHeight / (data.length * (stacked ? 1 : keys.length + 1))
    : innerWidth / (data.length * (stacked ? 1 : keys.length + 1));

  const barThickness = Math.min(barBandWidth * 0.8, BAR_MAX_THICKNESS);
  const gap = barBandWidth - barThickness;

  const getX = (dataIndex: number, keyIndex: number) => {
    const base = horizontal ? margin.left : margin.left + xScale(dataIndex);
    if (horizontal) return margin.left;
    if (stacked) return base;
    return base + keyIndex * (barThickness + gap) + gap / 2;
  };

  const getY = (dataIndex: number, keyIndex: number) => {
    const base = horizontal ? margin.top + yScale(dataIndex) : margin.top + innerHeight;
    if (!horizontal) return base;
    if (stacked) return base;
    return base + keyIndex * (barThickness + gap) + gap / 2;
  };

  const getBarWidth = (value: number) => horizontal ? xScale(value) : barThickness;
  const getBarHeight = (value: number) => horizontal ? barThickness : innerHeight - yScale(value);

  if (!data.length) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center h-64">
          <span className="text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full overflow-visible', className)}>
      {(title || subtitle) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="relative" style={{ width, height }}>
          <svg
            width={width}
            height={height}
            className="overflow-visible"
            style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}
            role="img"
            aria-label={title || 'Bar chart'}
          >
            <defs>
              <clipPath id="chart-area">
                <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} />
              </clipPath>
            </defs>

            {/* Gridlines */}
            {showGrid && (
              <g stroke={themeColors.gridline} strokeWidth="1" opacity="0.6">
                {horizontal ? (
                  Array.from({ length: 5 }).map((_, i) => {
                    const value = (yDomain[1] * i) / 4;
                    const x = margin.left + xScale(value);
                    return (
                      <line
                        key={i}
                        x1={x}
                        y1={margin.top}
                        x2={x}
                        y2={margin.top + innerHeight}
                      />
                    );
                  })
                ) : (
                  Array.from({ length: 5 }).map((_, i) => {
                    const value = (yDomain[1] * i) / 4;
                    const y = margin.top + yScale(value);
                    return (
                      <line
                        key={i}
                        x1={margin.left}
                        y1={y}
                        x2={margin.left + innerWidth}
                        y2={y}
                      />
                    );
                  })
                )}
              </g>
            )}

            {/* Baseline */}
            <line
              x1={margin.left}
              y1={horizontal ? margin.top : margin.top + innerHeight}
              x2={horizontal ? margin.left + innerWidth : margin.left + innerWidth}
              y2={horizontal ? margin.top : margin.top + innerHeight}
              stroke={themeColors.baseline}
              strokeWidth={1.5}
            />

            {/* Bars */}
            <g clipPath="url(#chart-area)">
              {data.map((d, dataIndex) => {
                let stackedOffset = 0;
                return keys.map((key, keyIndex) => {
                  const value = Number(d[key]) || 0;
                  const color = seriesColors[keyIndex % seriesColors.length];

                  if (horizontal) {
                    const y = getY(dataIndex, keyIndex);
                    const barWidth = getBarWidth(value);
                    const barX = stacked ? margin.left + xScale(stackedOffset) : margin.left;
                    stackedOffset += value;

                    return (
                      <rect
                        key={`${dataIndex}-${key}`}
                        x={barX}
                        y={y + SURFACE_GAP / 2}
                        width={Math.max(0, barWidth - SURFACE_GAP)}
                        height={barThickness - SURFACE_GAP}
                        rx={BAR_RADIUS}
                        fill={color}
                        style={{
                          transition: 'fill 0.15s ease',
                          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
                        }}
                      />
                    );
                  } else {
                    const x = getX(dataIndex, keyIndex);
                    const barHeight = getBarHeight(value);
                    const barY = stacked ? margin.top + innerHeight - yScale(stackedOffset + value) : margin.top + yScale(value);
                    stackedOffset += value;

                    const displayValue = formatValue ? formatValue(value, key) : formatNumber(value);

                    return (
                      <Tooltip
                        key={`${dataIndex}-${key}`}
                        delayDuration={100}
                        content={
                          <div>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-medium">{labels?.[keyIndex] || key}</span>
                            </div>
                            <div className="text-right mt-1">
                              <span className="font-mono font-semibold text-lg">{displayValue}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {xLabels[dataIndex]}
                            </div>
                          </div>
                        }
                      >
                        <rect
                          x={x}
                          y={barY - SURFACE_GAP / 2}
                          width={barThickness - SURFACE_GAP}
                          height={Math.max(0, barHeight + SURFACE_GAP)}
                          rx={BAR_RADIUS}
                          fill={color}
                          style={{
                            transition: 'fill 0.15s ease',
                            cursor: 'pointer',
                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
                          }}
                        />
                      </Tooltip>
                    );
                  }
                });
              })}
            </g>

            {/* X-axis labels (for vertical bars) */}
            {!horizontal && (
              <g fontSize={11} fill={themeColors.textSecondary} textAnchor="middle">
                {xLabels.map((label, i) => (
                  <text
                    key={i}
                    x={margin.left + xScale(i) + (stacked ? 0 : barBandWidth / 2)}
                    y={margin.top + innerHeight + 18}
                  >
                    {label}
                  </text>
                ))}
              </g>
            )}

            {/* Y-axis labels (for horizontal bars) */}
            {horizontal && (
              <g fontSize={11} fill={themeColors.textSecondary} textAnchor="end" dominantBaseline="middle">
                {xLabels.map((label, i) => (
                  <text
                    key={i}
                    x={margin.left - 8}
                    y={margin.top + yScale(i) + barBandWidth / 2}
                  >
                    {label}
                  </text>
                ))}
              </g>
            )}

            {/* Value axis ticks */}
            {showGrid && (
              <g fontSize={10} fill={themeColors.textMuted} textAnchor={horizontal ? 'middle' : 'end'} dominantBaseline={horizontal ? 'hanging' : 'middle'}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = (yDomain[1] * i) / 4;
                  const formatted = formatNumber(value);
                  if (horizontal) {
                    const x = margin.left + xScale(value);
                    return (
                      <text key={i} x={x} y={margin.top - 8}>{formatted}</text>
                    );
                  } else {
                    const y = margin.top + yScale(value);
                    return (
                      <text key={i} x={margin.left - 8} y={y}>{formatted}</text>
                    );
                  }
                })}
              </g>
            )}
          </svg>

          {/* Legend */}
          {showLegend && keys.length > 1 && (
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2"
              style={{
                minWidth: 100,
                maxWidth: 140,
                fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
              }}
              role="list"
              aria-label="Chart legend"
            >
              {keys.map((key, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 py-1 px-2 text-sm"
                  role="listitem"
                  style={{ color: themeColors.textPrimary }}
                >
                  <div
                    className="w-4 h-3 rounded"
                    style={{ backgroundColor: seriesColors[i % seriesColors.length] }}
                  />
                  <span className="truncate" title={labels?.[i] || key}>
                    {labels?.[i] || key}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// RADAR CHART
// ============================================

interface RadarChartProps extends ChartProps {
  maxValue?: number;
  levels?: number;
}

export function RadarChart({
  data,
  keys,
  labels,
  colors: customColors,
  title,
  subtitle,
  className,
  width = 400,
  height = 400,
  showLegend = true,
  showGrid = true,
  formatValue,
  maxValue,
  levels = 5,
}: RadarChartProps) {
  const themeColors = useThemeColors();
  const seriesColors = getColors(customColors, data.length);

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 60;

  const angleStep = (Math.PI * 2) / keys.length;
  const maxVal = maxValue || Math.max(...data.flatMap(d => keys.map(k => Number(d[k]) || 0)));

  const getPoint = (value: number, keyIndex: number) => {
    const angle = keyIndex * angleStep - Math.PI / 2;
    const r = (value / maxVal) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle),
    };
  };

  const getPolygonPoints = (item: Record<string, number | string>) => {
    return keys.map((key, i) => {
      const value = Number(item[key]) || 0;
      const point = getPoint(value, i);
      return `${point.x},${point.y}`;
    }).join(' ');
  };

  if (!data.length) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center h-96">
          <span className="text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      {(title || subtitle) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
      )}
      <CardContent className="p-4">
        <div className="relative" style={{ width, height }}>
          <svg
            width={width}
            height={height}
            className="overflow-visible"
            style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}
            role="img"
            aria-label={title || 'Radar chart'}
          >
            {/* Grid circles */}
            {showGrid && (
              <g stroke={themeColors.gridline} strokeWidth="1" fill="none" opacity="0.5">
                {Array.from({ length: levels }).map((_, i) => {
                  const r = (radius * (i + 1)) / levels;
                  return (
                    <polygon
                      key={i}
                      points={keys.map((_, j) => {
                        const angle = j * angleStep - Math.PI / 2;
                        return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
                      }).join(' ')}
                    />
                  );
                })}
                {/* Axis lines */}
                {keys.map((_, i) => {
                  const angle = i * angleStep - Math.PI / 2;
                  return (
                    <line
                      key={i}
                      x1={centerX}
                      y1={centerY}
                      x2={centerX + radius * Math.cos(angle)}
                      y2={centerY + radius * Math.sin(angle)}
                    />
                  );
                })}
              </g>
            )}

            {/* Axis labels */}
            <g fontSize={11} fill={themeColors.textSecondary} textAnchor="middle" dominantBaseline="middle">
              {keys.map((key, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const labelRadius = radius + 25;
                const x = centerX + labelRadius * Math.cos(angle);
                const y = centerY + labelRadius * Math.sin(angle);
                return (
                  <text key={i} x={x} y={y} className="text-xs">
                    {labels?.[i] || key}
                  </text>
                );
              })}
            </g>

            {/* Level values */}
            {showGrid && (
              <g fontSize={9} fill={themeColors.textMuted} textAnchor="end" dominantBaseline="middle">
                {Array.from({ length: levels }).map((_, i) => {
                  const value = (maxVal * (i + 1)) / levels;
                  const formatted = formatValue ? formatValue(value, '') : formatNumber(value);
                  return (
                    <text
                      key={i}
                      x={centerX - 10}
                      y={centerY - (radius * (i + 1)) / levels}
                    >
                      {formatted}
                    </text>
                  );
                })}
              </g>
            )}

            {/* Data polygons */}
            <g>
              {data.map((item, dataIndex) => {
                const color = seriesColors[dataIndex % seriesColors.length];
                const points = getPolygonPoints(item);
                const displayLabel = item.label || item.name || `Series ${dataIndex + 1}`;

                return (
                  <Tooltip
                    key={dataIndex}
                    delayDuration={100}
                    content={
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-medium">{displayLabel}</span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          {keys.map((key, i) => (
                            <div key={i} className="flex justify-between gap-4">
                              <span>{labels?.[i] || key}</span>
                              <span className="font-mono font-medium">
                                {formatValue
                                  ? formatValue(Number(item[key]) || 0, key)
                                  : formatNumber(Number(item[key]) || 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    }
                  >
                    <polygon
                      points={points}
                      fill={color + '20'}
                      stroke={color}
                      strokeWidth={LINE_WIDTH}
                      strokeLinejoin="round"
                      style={{
                        transition: 'fill 0.15s ease, stroke-width 0.15s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e: React.MouseEvent<SVGPolygonElement>) => {
                        const target = e.currentTarget as SVGPolygonElement;
                        target.style.fill = color + '40';
                        target.style.strokeWidth = `${LINE_WIDTH + 1}px`;
                      }}
                      onMouseLeave={(e: React.MouseEvent<SVGPolygonElement>) => {
                        const target = e.currentTarget as SVGPolygonElement;
                        target.style.fill = color + '20';
                        target.style.strokeWidth = `${LINE_WIDTH}px`;
                      }}
                    />
                  </Tooltip>
                );
              })}
            </g>

            {/* Data points */}
            <g>
              {data.map((item, dataIndex) => {
                const color = seriesColors[dataIndex % seriesColors.length];
                return keys.map((key, keyIndex) => {
                  const value = Number(item[key]) || 0;
                  const point = getPoint(value, keyIndex);
                  return (
                    <circle
                      key={`${dataIndex}-${keyIndex}`}
                      cx={point.x}
                      cy={point.y}
                      r={MARKER_RADIUS}
                      fill={color}
                      stroke={themeColors.surface}
                      strokeWidth={SURFACE_RING}
                      style={{
                        transition: 'r 0.15s ease',
                        cursor: 'pointer',
                      }}
                    />
                  );
                });
              })}
            </g>
          </svg>

          {/* Legend */}
          {showLegend && data.length > 1 && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap gap-4 justify-center"
              style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}
              role="list"
              aria-label="Chart legend"
            >
              {data.map((item, i) => {
                const displayLabel = String(item.label || item.name || `Series ${i + 1}`);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm"
                    role="listitem"
                    style={{ color: themeColors.textPrimary }}
                  >
                    <div
                      className="w-4 h-3 rounded"
                      style={{ backgroundColor: seriesColors[i % seriesColors.length] }}
                    />
                    <span className="truncate max-w-[120px]" title={displayLabel}>
                      {displayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// LINE CHART
// ============================================

interface LineChartProps extends ChartProps {
  smooth?: boolean;
  showMarkers?: boolean;
  fillArea?: boolean;
}

export function LineChart({
  data,
  keys,
  labels,
  colors: customColors,
  title,
  subtitle,
  className,
  width = 600,
  height = 300,
  showLegend = true,
  showGrid = true,
  formatValue,
  xKey = 'label',
  smooth = true,
  showMarkers = true,
  fillArea = false,
}: LineChartProps) {
  const themeColors = useThemeColors();
  const seriesColors = getColors(customColors, keys.length);

  const margin = { top: 20, right: showLegend ? 120 : 20, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xLabels = data.map(d => String(d[xKey]));
  const allValues = data.flatMap(d => keys.map(k => Number(d[k]) || 0));
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const valueRange = maxValue - minValue || 1;
  const yDomain = [minValue - valueRange * 0.1, maxValue + valueRange * 0.1];

  const xScale = (index: number) => margin.left + (index / Math.max(data.length - 1, 1)) * innerWidth;
  const yScale = (value: number) => margin.top + innerHeight - ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * innerHeight;

  const getPath = (keyIndex: number) => {
    const points = data.map((d, i) => {
      const value = Number(d[keys[keyIndex]]) || 0;
      return { x: xScale(i), y: yScale(value) };
    });

    if (smooth && points.length > 2) {
      // Catmull-Rom spline for smooth curves
      let path = `M${points[0].x},${points[0].y}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(0, i - 1)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(points.length - 1, i + 2)];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }
      return path;
    }

    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  };

  const getAreaPath = (keyIndex: number) => {
    const points = data.map((d, i) => {
      const value = Number(d[keys[keyIndex]]) || 0;
      return { x: xScale(i), y: yScale(value) };
    });

    let path = `M${points[0].x},${margin.top + innerHeight}`;
    points.forEach(p => {
      path += ` L${p.x},${p.y}`;
    });
    path += ` L${points[points.length - 1].x},${margin.top + innerHeight} Z`;
    return path;
  };

  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [hoveredSeries, setHoveredSeries] = React.useState<number | null>(null);

  if (!data.length) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center h-64">
          <span className="text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full overflow-visible', className)}>
      {(title || subtitle) && (
        <CardHeader className="pb-2">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="relative" style={{ width, height }}>
          <svg
            width={width}
            height={height}
            className="overflow-visible"
            style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}
            role="img"
            aria-label={title || 'Line chart'}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const relativeX = (x - margin.left) / innerWidth;
              const index = Math.round(relativeX * (data.length - 1));
              setHoveredIndex(Math.max(0, Math.min(data.length - 1, index)));
            }}
            onMouseLeave={() => {
              setHoveredIndex(null);
              setHoveredSeries(null);
            }}
          >
            <defs>
              <clipPath id="line-chart-area">
                <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} />
              </clipPath>
            </defs>

            {/* Gridlines */}
            {showGrid && (
              <g stroke={themeColors.gridline} strokeWidth="1" opacity="0.5">
                {/* Horizontal gridlines */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = yDomain[0] + (yDomain[1] - yDomain[0]) * i / 4;
                  const y = yScale(value);
                  return (
                    <line
                      key={i}
                      x1={margin.left}
                      y1={y}
                      x2={margin.left + innerWidth}
                      y2={y}
                    />
                  );
                })}
                {/* Vertical gridlines */}
                {data.map((_, i) => (
                  <line
                    key={i}
                    x1={xScale(i)}
                    y1={margin.top}
                    x2={xScale(i)}
                    y2={margin.top + innerHeight}
                  />
                ))}
              </g>
            )}

            {/* Baseline if crossing zero */}
            {yDomain[0] < 0 && yDomain[1] > 0 && (
              <line
                x1={margin.left}
                y1={yScale(0)}
                x2={margin.left + innerWidth}
                y2={yScale(0)}
                stroke={themeColors.baseline}
                strokeWidth={1.5}
              />
            )}

            {/* Area fills */}
            {fillArea && (
              <g clipPath="url(#line-chart-area)">
                {keys.map((_, keyIndex) => {
                  const color = seriesColors[keyIndex % seriesColors.length];
                  return (
                    <path
                      key={keyIndex}
                      d={getAreaPath(keyIndex)}
                      fill={color + '15'}
                      stroke="none"
                    />
                  );
                })}
              </g>
            )}

            {/* Lines */}
            <g clipPath="url(#line-chart-area)" strokeWidth={LINE_WIDTH} fill="none" strokeLinecap="round" strokeLinejoin="round">
              {keys.map((_key, keyIndex) => {
                const color = seriesColors[keyIndex % seriesColors.length];
                return (
                  <path
                    key={keyIndex}
                    d={getPath(keyIndex)}
                    stroke={color}
                    style={{
                      transition: 'stroke-width 0.15s ease',
                    }}
                  />
                );
              })}
            </g>

            {/* Crosshair */}
            {hoveredIndex !== null && (
              <line
                x1={xScale(hoveredIndex)}
                y1={margin.top}
                x2={xScale(hoveredIndex)}
                y2={margin.top + innerHeight}
                stroke={themeColors.textMuted}
                strokeWidth={1}
                strokeDasharray="4,4"
                opacity="0.7"
                pointerEvents="none"
              />
            )}

            {/* Markers and tooltip triggers */}
            <g clipPath="url(#line-chart-area)">
              {keys.map((key, keyIndex) => {
                const color = seriesColors[keyIndex % seriesColors.length];
                return data.map((d, dataIndex) => {
                  const value = Number(d[key]) || 0;
                  const x = xScale(dataIndex);
                  const y = yScale(value);
                  const isHovered = hoveredIndex === dataIndex && hoveredSeries === keyIndex;
                  const displayValue = formatValue ? formatValue(value, key) : formatNumber(value);

                  return (
                    <Tooltip
                      key={`${dataIndex}-${keyIndex}`}
                      delayDuration={50}
                      content={
                        <div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-medium">{labels?.[keyIndex] || key}</span>
                          </div>
                          <div className="text-right mt-1">
                            <span className="font-mono font-semibold text-lg">{displayValue}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {xLabels[dataIndex]}
                          </div>
                        </div>
                      }
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={showMarkers ? (isHovered ? MARKER_RADIUS + 2 : MARKER_RADIUS) : (isHovered ? 8 : 0)}
                        fill={color}
                        stroke={themeColors.surface}
                        strokeWidth={SURFACE_RING}
                        style={{
                          transition: 'r 0.15s ease, fill 0.15s ease',
                          cursor: showMarkers ? 'pointer' : 'crosshair',
                          pointerEvents: showMarkers ? 'all' : 'none',
                        }}
                        onMouseEnter={() => {
                          setHoveredIndex(dataIndex);
                          setHoveredSeries(keyIndex);
                        }}
                        onMouseLeave={() => {
                          setHoveredIndex(null);
                          setHoveredSeries(null);
                        }}
                      />
                    </Tooltip>
                  );
                });
              })}
            </g>

            {/* X-axis labels */}
            <g fontSize={11} fill={themeColors.textSecondary} textAnchor="middle">
              {xLabels.map((label, i) => (
                <text
                  key={i}
                  x={xScale(i)}
                  y={margin.top + innerHeight + 18}
                >
                  {label}
                </text>
              ))}
            </g>

            {/* Y-axis labels */}
            {showGrid && (
              <g fontSize={10} fill={themeColors.textMuted} textAnchor="end" dominantBaseline="middle">
                {Array.from({ length: 5 }).map((_, i) => {
                  const value = yDomain[0] + (yDomain[1] - yDomain[0]) * i / 4;
                  const formatted = formatValue ? formatValue(value, '') : formatNumber(value);
                  return (
                    <text key={i} x={margin.left - 8} y={yScale(value)}>
                      {formatted}
                    </text>
                  );
                })}
              </g>
            )}
          </svg>

          {/* Legend */}
          {showLegend && keys.length > 1 && (
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2"
              style={{
                minWidth: 100,
                maxWidth: 140,
                fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif'
              }}
              role="list"
              aria-label="Chart legend"
            >
              {keys.map((key, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 py-1 px-2 text-sm"
                  role="listitem"
                  style={{ color: themeColors.textPrimary }}
                >
                  <div
                    className="w-6 h-1.5 rounded"
                    style={{ backgroundColor: seriesColors[i % seriesColors.length] }}
                  />
                  <span className="truncate" title={labels?.[i] || key}>
                    {labels?.[i] || key}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// STAT TABLE
// ============================================

interface ColumnDef {
  key: string;
  label: string;
  format: (value: number | string) => string;
  width?: string;
}

interface StatTableProps extends ChartProps {
  columns?: ColumnDef[];
  highlightRow?: (row: Record<string, number | string>) => boolean;
  onRowClick?: (row: Record<string, number | string>) => void;
}

export function StatTable({
  data,
  keys,
  labels,
  title,
  subtitle,
  className,
  width,
  height,
  formatValue,
  xKey = 'label',
  columns,
  highlightRow,
  onRowClick,
}: StatTableProps) {
  const themeColors = useThemeColors();

  const defaultColumns = React.useMemo((): ColumnDef[] => {
    const xLabel = labels?.[0] || xKey;
    return [
      { key: xKey, label: xLabel, width: '40%', format: (v: number | string) => String(v) },
      ...keys.map((key, i) => ({
        key,
        label: labels?.[i] || key,
        format: formatValue ? (v: number | string) => formatValue(Number(v), key) : (v: number | string) => formatNumber(Number(v)),
        width: 'auto',
      })),
    ];
  }, [keys, labels, xKey, formatValue]);

  const tableColumns = columns || defaultColumns;

  if (!data.length) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center h-64">
          <span className="text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full overflow-hidden', className)}>
      {(title || subtitle) && (
        <CardHeader className="pb-2 border-b">
          {title && <CardTitle className="text-lg">{title}</CardTitle>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="overflow-x-auto" style={{ width, height, maxHeight: height }}>
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b" style={{ borderColor: themeColors.border }}>
                {tableColumns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: themeColors.textMuted,
                      width: col.width,
                      backgroundColor: themeColors.surface2,
                    }}
                    scope="col"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => {
                const isHighlighted = highlightRow ? highlightRow(row) : false;
                return (
                  <tr
                    key={rowIndex}
                    className={cn(
                      'border-b transition-colors',
                      isHighlighted && 'bg-primary/5',
                      onRowClick && 'cursor-pointer hover:bg-accent/50'
                    )}
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: isHighlighted ? themeColors.surface : undefined,
                    }}
                    onClick={() => onRowClick?.(row)}
                  >
                    {tableColumns.map((col) => {
                      const value = row[col.key];
                      const formatted = col.format
                        ? col.format(value)
                        : typeof value === 'number'
                          ? formatNumber(value)
                          : String(value);

                      const isFirstCol = col.key === tableColumns[0].key;
                      const isNumeric = typeof value === 'number' || !isNaN(Number(value));

                      return (
                        <td
                          key={col.key}
                          className={cn(
                            'px-4 py-3 text-sm',
                            isNumeric && !isFirstCol && 'font-mono tabular-nums text-right',
                            isFirstCol && 'font-medium'
                          )}
                          style={{
                            color: isFirstCol ? themeColors.textPrimary : themeColors.textSecondary,
                            width: col.width,
                          }}
                        >
                          {formatted}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPOSITE: Comparison Dashboard
// ============================================

interface ComparisonDashboardProps {
  data: Record<string, number | string>[];
  keys: string[];
  labels?: string[];
  colors?: string[];
  title?: string;
  className?: string;
  layouts?: ('bar' | 'radar' | 'line' | 'table')[];
}

export function ComparisonDashboard({
  data,
  keys,
  labels,
  colors,
  title,
  className,
  layouts = ['bar', 'radar', 'line', 'table'],
}: ComparisonDashboardProps) {
  return (
    <div className={cn('space-y-6', className)} style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>
      {title && (
        <h2 className="text-2xl font-semibold tracking-tight">
          {title}
        </h2>
      )}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {layouts.includes('bar') && (
          <BarChart
            data={data}
            keys={keys}
            labels={labels}
            colors={colors}
            title="Bar Comparison"
            showLegend={true}
            height={350}
          />
        )}
        {layouts.includes('radar') && (
          <RadarChart
            data={data}
            keys={keys}
            labels={labels}
            colors={colors}
            title="Radar Comparison"
            showLegend={true}
            width={400}
            height={400}
          />
        )}
        {layouts.includes('line') && (
          <LineChart
            data={data}
            keys={keys}
            labels={labels}
            colors={colors}
            title="Trend Comparison"
            showLegend={true}
            height={350}
            fillArea={false}
          />
        )}
        {layouts.includes('table') && (
          <StatTable
            data={data}
            keys={keys}
            labels={labels}
            colors={colors}
            title="Detailed Stats"
            showLegend={false}
            height={350}
          />
        )}
      </div>
    </div>
  );
}

export default {
  BarChart,
  RadarChart,
  LineChart,
  StatTable,
  ComparisonDashboard,
};