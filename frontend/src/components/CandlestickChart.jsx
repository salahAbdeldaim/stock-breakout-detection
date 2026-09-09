import React, { useState, useMemo, useRef } from 'react';
import { Crosshair, TrendingUp, AlertTriangle } from 'lucide-react';

export default function CandlestickChart({
  chartData,
  targetDate,
  ticker,
  name
}) {
  const containerRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  const candles = chartData?.candles || [];

  // Calculate scales and geometry
  const {
    minPrice,
    maxPrice,
    maxVolume,
    targetIndex,
    lastCandle
  } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: 0, maxPrice: 100, maxVolume: 100, targetIndex: -1, lastCandle: null };
    }

    let min = Infinity;
    let max = -Infinity;
    let maxVol = 0;
    let targetIdx = -1;

    candles.forEach((c, idx) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.resistance_30d && c.resistance_30d > max) max = c.resistance_30d;
      if (c.volume > maxVol) maxVol = c.volume;
      if (c.date === targetDate) targetIdx = idx;
    });

    const padding = (max - min) * 0.08 || 5;
    return {
      minPrice: Math.max(0, min - padding),
      maxPrice: max + padding,
      maxVolume: maxVol * 1.2 || 1000,
      targetIndex: targetIdx,
      lastCandle: candles[candles.length - 1]
    };
  }, [candles, targetDate]);

  // Dimensions
  const svgWidth = 840;
  const svgHeight = 440;
  const priceHeight = 310;
  const volTop = 330;
  const volHeight = 85;
  const margin = { top: 20, right: 65, bottom: 25, left: 15 };

  const usableWidth = svgWidth - margin.left - margin.right;
  const candleCount = candles.length;
  const candleWidth = Math.max(2, Math.min(10, (usableWidth / candleCount) * 0.65));
  const stepX = candleCount > 1 ? usableWidth / (candleCount - 1) : 0;

  const getX = (i) => margin.left + i * stepX;
  const getY = (price) => {
    if (maxPrice === minPrice) return priceHeight / 2;
    return margin.top + (priceHeight - ((price - minPrice) / (maxPrice - minPrice)) * priceHeight);
  };
  const getVolY = (vol) => {
    if (maxVolume === 0) return volTop + volHeight;
    return volTop + volHeight - (vol / maxVolume) * volHeight;
  };

  const activeCandle = hoverIndex !== null ? candles[hoverIndex] : (targetIndex !== -1 ? candles[targetIndex] : lastCandle);

  const handleMouseMove = (e) => {
    if (!containerRef.current || candleCount === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const svgMouseX = (mouseX / rect.width) * svgWidth;
    
    const relX = svgMouseX - margin.left;
    const idx = Math.round(relX / stepX);
    if (idx >= 0 && idx < candleCount) {
      setHoverIndex(idx);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  // Resistance line points
  const resistancePath = useMemo(() => {
    if (!candles || candles.length === 0) return '';
    let path = '';
    candles.forEach((c, idx) => {
      if (c.resistance_30d !== null) {
        const x = getX(idx);
        const y = getY(c.resistance_30d);
        path += (path === '' ? `M ${x} ${y}` : ` L ${x} ${y}`);
      }
    });
    return path;
  }, [candles, minPrice, maxPrice]);

  return (
    <div className="chart-panel">
      {/* Chart Header */}
      <div className="chart-header">
        <div className="stock-info-main">
          <span className="stock-symbol">{ticker}</span>
          <span className="stock-name">{name}</span>
        </div>

        {activeCandle && (
          <div className="stock-metrics-strip">
            <div className="metric-tag">
              <span className="metric-tag-label">DATE</span>
              <span className="metric-tag-val">{activeCandle.date}</span>
            </div>
            <div className="metric-tag">
              <span className="metric-tag-label">CLOSE</span>
              <span className="metric-tag-val" style={{ color: activeCandle.close >= activeCandle.open ? '#10b981' : '#ef4444' }}>
                ${activeCandle.close.toFixed(2)}
              </span>
            </div>
            <div className="metric-tag">
              <span className="metric-tag-label">30D RESISTANCE</span>
              <span className="metric-tag-val" style={{ color: '#06b6d4' }}>
                {activeCandle.resistance_30d ? `$${activeCandle.resistance_30d.toFixed(2)}` : 'N/A'}
              </span>
            </div>
            <div className="metric-tag">
              <span className="metric-tag-label">VOLUME</span>
              <span className="metric-tag-val">
                {(activeCandle.volume / 1e6).toFixed(2)}M ({activeCandle.vol_ratio}x)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Candlestick SVG Container */}
      <div
        className="chart-svg-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            <linearGradient id="volGreenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="volRedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Price Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const priceVal = minPrice + (maxPrice - minPrice) * (1 - pct);
            const y = margin.top + pct * priceHeight;
            return (
              <g key={i}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={svgWidth - margin.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={svgWidth - margin.right + 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  ${priceVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Volume Separator Line */}
          <line
            x1={margin.left}
            y1={volTop - 8}
            x2={svgWidth - margin.right}
            y2={volTop - 8}
            stroke="rgba(255, 255, 255, 0.08)"
          />
          <text
            x={margin.left}
            y={volTop + 12}
            fill="#64748b"
            fontSize="9"
            fontFamily="monospace"
          >
            VOL (SURGE REF 1.20x)
          </text>

          {/* 30-Day Resistance Line */}
          {resistancePath && (
            <path
              d={resistancePath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.8"
              strokeDasharray="6 3"
              opacity="0.85"
            />
          )}

          {/* Target Audited Candle Vertical Highlight */}
          {targetIndex !== -1 && (
            <g>
              <line
                x1={getX(targetIndex)}
                y1={margin.top}
                x2={getX(targetIndex)}
                y2={volTop + volHeight}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <circle
                cx={getX(targetIndex)}
                cy={getY(candles[targetIndex].close)}
                r="5"
                fill="#38bdf8"
                stroke="#080c14"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Candlesticks & Volume Bars */}
          {candles.map((c, idx) => {
            const x = getX(idx);
            const isUp = c.close >= c.open;
            const candleColor = isUp ? '#10b981' : '#ef4444';
            const yOpen = getY(c.open);
            const yClose = getY(c.close);
            const yHigh = getY(c.high);
            const yLow = getY(c.low);
            const topY = Math.min(yOpen, yClose);
            const bodyH = Math.max(1.5, Math.abs(yOpen - yClose));

            const volY = getVolY(c.volume);
            const volH = Math.max(1, volTop + volHeight - volY);

            return (
              <g key={c.date}>
                {/* High/Low Wick */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={candleColor}
                  strokeWidth="1.2"
                />

                {/* Candle Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={topY}
                  width={candleWidth}
                  height={bodyH}
                  fill={c.is_breakout ? '#38bdf8' : candleColor}
                  rx="1"
                />

                {/* Breakout Candle Indicator */}
                {c.is_breakout && (
                  <polygon
                    points={`${x},${yHigh - 10} ${x - 4},${yHigh - 16} ${x + 4},${yHigh - 16}`}
                    fill="#38bdf8"
                  />
                )}

                {/* Volume Bar */}
                <rect
                  x={x - candleWidth / 2}
                  y={volY}
                  width={candleWidth}
                  height={volH}
                  fill={isUp ? 'url(#volGreenGrad)' : 'url(#volRedGrad)'}
                  rx="1"
                  opacity={c.vol_ratio >= 1.2 ? 1.0 : 0.45}
                />
              </g>
            );
          })}

          {/* Interactive Hover Crosshair */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={margin.top}
                x2={getX(hoverIndex)}
                y2={volTop + volHeight}
                stroke="#f8fafc"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.7"
              />
              <line
                x1={margin.left}
                y1={getY(candles[hoverIndex].close)}
                x2={svgWidth - margin.right}
                y2={getY(candles[hoverIndex].close)}
                stroke="#f8fafc"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.7"
              />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
