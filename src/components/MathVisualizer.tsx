import React from 'react';
import { MathVisualSpec } from '../types';

interface Props {
  spec: MathVisualSpec;
  stage: number; // 0=初始, 1=完成第1步, 2=完成第2步...
}

export const MathVisualizer: React.FC<Props> = ({ spec, stage }) => {
  if (spec.type === 'bar_model') {
    return (
      <div
        style={{
          background: '#F8FAFC',
          border: '2px solid #CBD5E1',
          borderRadius: 18,
          padding: '16px 18px',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A', marginBottom: 12 }}>
          📐 {spec.title}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {spec.bars.map((bar, bIdx) => (
            <div key={bIdx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 74, fontWeight: 700, fontSize: 13, color: '#334155', flexShrink: 0 }}>
                {bar.label}
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                  minHeight: 42,
                }}
              >
                {bar.segments.map((seg, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      flex: seg.flex,
                      background: seg.color,
                      color: '#0F172A',
                      fontWeight: 800,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px 4px',
                      textAlign: 'center',
                      borderRight: sIdx < bar.segments.length - 1 ? '2px dashed rgba(255,255,255,0.85)' : 'none',
                      outline: seg.highlight && stage >= 1 ? '3px solid #F59E0B' : 'none',
                    }}
                  >
                    {seg.valueLabel}
                  </div>
                ))}
              </div>
              {bar.totalLabel && (
                <div
                  style={{
                    minWidth: 74,
                    textAlign: 'right',
                    fontSize: 13,
                    fontWeight: 800,
                    color: '#0369A1',
                  }}
                >
                  {bar.totalLabel}
                </div>
              )}
            </div>
          ))}
        </div>
        {spec.footnote && (
          <div style={{ marginTop: 10, fontSize: 13, color: '#475569', fontWeight: 600 }}>
            💡 {spec.footnote}
          </div>
        )}
      </div>
    );
  }

  if (spec.type === 'balance_scale') {
    const sub = spec.subtractEachSide || 0;
    const afterSub = spec.rightValue - sub;
    const div = spec.divideBy || 1;
    const finalX = afterSub / div;
    const showRemoved = stage >= 1;
    const showSolved = stage >= 2;

    return (
      <div
        style={{
          background: '#F5F3FF',
          border: '2px solid #C4B5FD',
          borderRadius: 18,
          padding: '16px 18px',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 15, color: '#4C1D95', marginBottom: 10 }}>
          ⚖️ {spec.title}
        </div>
        <svg viewBox="0 0 460 155" style={{ width: '100%', maxHeight: 170 }}>
          {/* 支点底座 */}
          <polygon points="212,145 248,145 230,104" fill="#8B5CF6" />
          <rect x="180" y="143" width="100" height="8" rx="4" fill="#6D28D9" />
          {/* 平衡横梁 */}
          <rect x="65" y="100" width="330" height="8" rx="4" fill="#F59E0B" />
          <circle cx="230" cy="104" r="7" fill="#FEF08A" stroke="#D97706" strokeWidth="3" />

          {/* 左托盘 */}
          <rect x="40" y="88" width="165" height="10" rx="5" fill="#60A5FA" />
          {/* 左托盘物品 */}
          {spec.leftItems.map((item, idx) => {
            const isExtraWeight = item.startsWith('+');
            if (isExtraWeight && showRemoved) {
              return (
                <g key={idx} opacity="0.32">
                  <rect x={48 + idx * 42} y="32" width="42" height="32" rx="8" fill="#FDBA74" stroke="#EA580C" strokeDasharray="4 2" />
                  <text x={69 + idx * 42} y="52" textAnchor="middle" fontSize="11" fontWeight="800" fill="#9A3412">已拿走</text>
                </g>
              );
            }
            return (
              <g key={idx}>
                <rect
                  x={48 + idx * 42}
                  y="52"
                  width="38"
                  height="34"
                  rx="8"
                  fill={isExtraWeight ? '#FDE68A' : '#DBEAFE'}
                  stroke={isExtraWeight ? '#D97706' : '#2563EB'}
                  strokeWidth="2"
                />
                <text x={67 + idx * 42} y="73" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1E293B">
                  {showSolved && !isExtraWeight ? `${finalX}` : item.replace('📦 ', '').replace('📘 ', '')}
                </text>
              </g>
            );
          })}

          {/* 右托盘 */}
          <rect x="265" y="88" width="155" height="10" rx="5" fill="#34D399" />
          <rect x="292" y="46" width="102" height="40" rx="10" fill="#D1FAE5" stroke="#059669" strokeWidth="2.5" />
          <text x="343" y="71" textAnchor="middle" fontSize="16" fontWeight="900" fill="#065F46">
            {showRemoved ? `${afterSub}` : `${spec.rightValue}`}
          </text>
          {showRemoved && sub > 0 && (
            <text x="343" y="36" textAnchor="middle" fontSize="12" fontWeight="800" fill="#D97706">
              两边同时拿走 {sub}！依然平衡 ✨
            </text>
          )}
        </svg>
        <div style={{ fontSize: 13, color: '#5B21B6', fontWeight: 700, textAlign: 'center' }}>
          {showSolved
            ? `🎉 天平揭秘成功：每个 ${spec.unknownLabel || 'x'} = ${finalX}！`
            : showRemoved
            ? `现在天平变成：${div} 个 ${spec.unknownLabel || 'x'} = ${afterSub}，求 1 个是多少？`
            : '天平左右一样重！提示：先让两边同时拿走多余的数字~'}
        </div>
      </div>
    );
  }

  if (spec.type === 'area_split') {
    return (
      <div
        style={{
          background: '#EFF6FF',
          border: '2px solid #93C5FD',
          borderRadius: 18,
          padding: '16px 18px',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 15, color: '#1E3A8A', marginBottom: 12 }}>
          🧱 {spec.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 15,
              color: '#1D4ED8',
              background: '#DBEAFE',
              padding: '18px 10px',
              borderRadius: 12,
              writingMode: 'horizontal-tb',
              flexShrink: 0,
            }}
          >
            {spec.heightLabel}
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            {spec.parts.map((p, idx) => (
              <div
                key={idx}
                style={{
                  flex: idx === 0 ? 3 : 1.4,
                  background: p.color,
                  borderRadius: 14,
                  padding: '12px 10px',
                  color: '#0F172A',
                  textAlign: 'center',
                  border: '2.5px solid #FFFFFF',
                  boxShadow: '0 4px 10px rgba(30, 58, 138, 0.12)',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.85 }}>{p.widthLabel}</div>
                <div style={{ fontSize: 16, fontWeight: 900, marginTop: 4 }}>{p.expr}</div>
                {stage >= 1 && (
                  <div
                    style={{
                      marginTop: 6,
                      background: 'rgba(255,255,255,0.85)',
                      borderRadius: 8,
                      padding: '2px 6px',
                      fontSize: 14,
                      fontWeight: 900,
                      color: '#0F172A',
                    }}
                  >
                    = {p.result}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            marginTop: 12,
            textAlign: 'center',
            fontWeight: 800,
            fontSize: 14,
            color: '#1E40AF',
            background: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: 10,
          }}
        >
          ✨ {spec.combinedExpr}
        </div>
      </div>
    );
  }

  if (spec.type === 'angle_triangle') {
    if (spec.shape === 'straight_line') {
      const a1 = spec.angles[0]?.value ?? 55;
      const a2 = 180 - a1;
      return (
        <div
          style={{
            background: '#ECFDF5',
            border: '2px solid #6EE7B7',
            borderRadius: 18,
            padding: '16px 18px',
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 15, color: '#065F46', marginBottom: 6 }}>
            📐 {spec.title}
          </div>
          <svg viewBox="0 0 380 140" style={{ width: '100%', maxHeight: 145 }}>
            {/* 平角底线 */}
            <line x1="35" y1="110" x2="345" y2="110" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
            {/* 射线 */}
            <line x1="190" y1="110" x2="275" y2="26" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
            <circle cx="190" cy="110" r="5" fill="#0F172A" />
            {/* 角度弧线 */}
            <path d="M232,110 A42,42 0 0,0 220,80" fill="none" stroke="#F59E0B" strokeWidth="3.5" />
            <path d="M148,110 A42,42 0 0,1 220,80" fill="none" stroke="#10B981" strokeWidth="3.5" strokeDasharray="5 3" />
            <text x="262" y="96" fontSize="14" fontWeight="900" fill="#B45309">
              ∠1 = {a1}°
            </text>
            <text x="115" y="72" fontSize="15" fontWeight="900" fill="#047857">
              {stage >= 2 ? `∠2 = ${a2}°` : '∠2 = ?'}
            </text>
            {stage >= 1 && (
              <text x="190" y="132" textAnchor="middle" fontSize="13" fontWeight="800" fill="#065F46">
                整条平角 = 180°，所以 ∠2 = 180° - {a1}°
              </text>
            )}
          </svg>
          <div style={{ fontSize: 13, color: '#065F46', fontWeight: 700, textAlign: 'center' }}>
            📏 {spec.ruleText}
          </div>
        </div>
      );
    }

    const topVal = spec.angles[0]?.value ?? 80;
    const baseVal = (180 - topVal) / 2;
    return (
      <div
        style={{
          background: '#ECFDF5',
          border: '2px solid #6EE7B7',
          borderRadius: 18,
          padding: '16px 18px',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 15, color: '#065F46', marginBottom: 6 }}>
          🔺 {spec.title}
        </div>
        <svg viewBox="0 0 380 165" style={{ width: '100%', maxHeight: 165 }}>
          <polygon
            points="190,18 75,142 305,142"
            fill="#D1FAE5"
            stroke="#059669"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* 等腰标记 */}
          <line x1="126" y1="74" x2="140" y2="85" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="254" y1="74" x2="240" y2="85" stroke="#D97706" strokeWidth="3.5" strokeLinecap="round" />
          {/* 顶角 */}
          <text x="190" y="56" textAnchor="middle" fontSize="15" fontWeight="900" fill="#B45309">
            顶角 {topVal}°
          </text>
          {/* 左底角 */}
          <text x="115" y="132" textAnchor="middle" fontSize="14" fontWeight="900" fill="#1D4ED8">
            {stage >= 2 ? `${baseVal}°` : '底角 ?'}
          </text>
          {/* 右底角 */}
          <text x="265" y="132" textAnchor="middle" fontSize="14" fontWeight="900" fill="#1D4ED8">
            {stage >= 2 ? `${baseVal}°` : '底角 ?'}
          </text>
          {stage >= 1 && (
            <text x="190" y="159" textAnchor="middle" fontSize="13" fontWeight="800" fill="#047857">
              两个底角合起来 = 180° - {topVal}° = {180 - topVal}°
            </text>
          )}
        </svg>
        <div style={{ fontSize: 13, color: '#065F46', fontWeight: 700, textAlign: 'center' }}>
          📏 {spec.ruleText}
        </div>
      </div>
    );
  }

  // decimal_align 小数点对齐格子本
  const renderDigits = (str: string, highlightDot = true) =>
    str.split('').map((ch, idx) => (
      <span
        key={idx}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: ch === '.' ? 22 : 36,
          height: 40,
          borderRadius: 8,
          background: ch === '.' && highlightDot ? '#FEF08A' : '#FFFFFF',
          border: ch === '.' && highlightDot ? '2px solid #F59E0B' : '1.5px solid #CBD5E1',
          fontWeight: 900,
          fontSize: 20,
          color: ch === '.' ? '#D97706' : '#0F172A',
        }}
      >
        {ch === ' ' ? '' : ch}
      </span>
    ));

  return (
    <div
      style={{
        background: '#FFFBEB',
        border: '2px solid #FCD34D',
        borderRadius: 18,
        padding: '16px 18px',
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 15, color: '#92400E', marginBottom: 12 }}>
        🧮 {spec.title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ width: 26 }} />
          {renderDigits(spec.numA)}
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ width: 26, fontWeight: 900, fontSize: 22, color: '#D97706', textAlign: 'center' }}>
            {spec.operator}
          </span>
          {renderDigits(spec.numB)}
        </div>
        <div style={{ width: 215, height: 3, background: '#1E293B', borderRadius: 2, margin: '2px 0' }} />
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ width: 26 }} />
          {stage >= 2
            ? renderDigits(spec.result)
            : renderDigits('??.??', true)}
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: '#B45309', textAlign: 'center' }}>
        💡 {spec.tip}
      </div>
    </div>
  );
};
