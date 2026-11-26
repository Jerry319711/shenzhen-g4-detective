import React, { useState } from 'react';
import { CheckCircle2, Play, Shuffle, Sparkles, Swords } from 'lucide-react';
import { DetectiveCase, SkillCategory, Subject } from '../types';
import { SKILL_META } from '../data/curriculum';

interface Props {
  subject: Subject;
  cases: DetectiveCase[];
  solvedIds: string[];
  onStartCase: (c: DetectiveCase) => void;
}

const DIFF_LABELS: Record<1 | 2 | 3, { label: string; hp: string; color: string; emoji: string }> = {
  1: { label: '普通小怪', hp: '100 HP', color: 'pill-blue', emoji: '💀' },
  2: { label: '精英怪', hp: '200 HP', color: 'pill-amber', emoji: '👹' },
  3: { label: '暗金首领', hp: '300 HP', color: 'pill-orange', emoji: '🐉' },
};

export const CaseListView: React.FC<Props> = ({ subject, cases, solvedIds, onStartCase }) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillCategory | 'all'>('all');

  const skills = SKILL_META.filter((s) => s.subject === subject);
  const filtered = cases.filter((c) => {
    if (c.subject !== subject) return false;
    if (selectedSkill !== 'all' && c.skill !== selectedSkill) return false;
    return true;
  });

  const handleQuickPick = () => {
    const unsolved = filtered.filter((c) => !solvedIds.includes(c.id));
    const pool = unsolved.length > 0 ? unsolved : filtered;
    if (pool.length > 0) {
      onStartCase(pool[Math.floor(Math.random() * pool.length)]);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        className="card card-warm"
        style={{
          borderColor: subject === 'english' ? '#3B82F6' : '#10B981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#FDE68A' }}>
            {subject === 'english' ? '🇬🇧 英语语法魔窟（75 只怪物）' : '🧮 数学逻辑地牢（75 只怪物）'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13.5, fontWeight: 600, color: 'var(--ink-muted)' }}>
            {subject === 'english'
              ? '沪教牛津深圳版 4A/4B 全覆盖 · 每只小怪/精英自带血条与护盾，找出关键词破盾暴击！'
              : '北师大版 4上/4下 全覆盖 · 每只怪物配动态图解与多段连招，击杀随机掉落暗黑盲盒与皮肤碎片！'}
          </p>
        </div>
        <button className={subject === 'english' ? 'btn-sky' : 'btn-mint'} onClick={handleQuickPick}>
          <Shuffle size={16} /> 随机遭遇一只怪！
        </button>
      </div>

      {/* 知识点筛选 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className="btn-soft"
          style={{
            background: selectedSkill === 'all' ? '#DC2626' : '#221C2C',
            color: selectedSkill === 'all' ? '#FEF3C7' : '#D6C7B2',
            borderColor: selectedSkill === 'all' ? '#F59E0B' : '#4A3D58',
          }}
          onClick={() => setSelectedSkill('all')}
        >
          全部怪物 ({cases.filter((c) => c.subject === subject).length})
        </button>
        {skills.map((sk) => {
          const active = selectedSkill === sk.id;
          return (
            <button
              key={sk.id}
              className="btn-soft"
              style={{
                background: active ? '#DC2626' : '#221C2C',
                color: active ? '#FEF3C7' : '#D6C7B2',
                borderColor: active ? '#F59E0B' : '#4A3D58',
              }}
              onClick={() => setSelectedSkill(sk.id)}
            >
              {sk.shortName}
            </button>
          );
        })}
      </div>

      {/* 怪物卡片网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {filtered.map((c) => {
          const solved = solvedIds.includes(c.id);
          const diff = DIFF_LABELS[c.difficulty];
          return (
            <div
              key={c.id}
              className="card"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 11,
                borderColor: solved ? '#10B981' : c.difficulty === 3 ? '#EA580C' : '#3D3124',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
                  <span className={`pill ${diff.color}`}>
                    {diff.emoji} {diff.label} · {diff.hp}
                  </span>
                  {solved ? (
                    <span className="pill pill-green"><CheckCircle2 size={12} /> 已斩杀</span>
                  ) : (
                    <span className="pill pill-amber">⭐ +{c.rewardStars}</span>
                  )}
                </div>
                <div style={{ fontSize: 16.5, fontWeight: 900, color: '#FDE68A' }}>{c.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', fontWeight: 600, marginTop: 4 }}>
                  {c.textbookRef} · 怪物：{c.suspectName}
                </div>
                {c.isAiGenerated && (
                  <span className="pill pill-purple" style={{ marginTop: 6 }}>
                    <Sparkles size={11} /> AI 定制精英
                  </span>
                )}
              </div>

              <button
                className={solved ? 'btn-soft' : 'btn-primary'}
                style={{ width: '100%', padding: '9px 14px', fontSize: 14 }}
                onClick={() => onStartCase(c)}
              >
                {solved ? <><Play size={14} /> 再次刷怪掉宝</> : <><Swords size={15} /> 拔剑开战！</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
