import React, { useState } from 'react';
import { CheckCircle2, Play, Shuffle, Sparkles } from 'lucide-react';
import { DetectiveCase, SkillCategory, Subject } from '../types';
import { SKILL_META } from '../data/curriculum';

interface Props {
  subject: Subject;
  cases: DetectiveCase[];
  solvedIds: string[];
  onStartCase: (c: DetectiveCase) => void;
}

const DIFF_LABELS: Record<1 | 2 | 3, { label: string; color: string }> = {
  1: { label: '⭐ 热身小案', color: 'pill-green' },
  2: { label: '⭐⭐ 进阶密案', color: 'pill-amber' },
  3: { label: '⭐⭐⭐ 王牌悬案', color: 'pill-orange' },
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
        className="card"
        style={{
          background:
            subject === 'english'
              ? 'linear-gradient(135deg, #EFF6FF, #DBEAFE)'
              : 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
          borderColor: subject === 'english' ? '#93C5FD' : '#6EE7B7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: subject === 'english' ? '#1E3A8A' : '#064E3B' }}>
            {subject === 'english' ? '🇬🇧 英语语法探案馆' : '🧮 数学逻辑实验室'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600, color: subject === 'english' ? '#1E40AF' : '#065F46' }}>
            {subject === 'english'
              ? '沪教牛津深圳版四年级重难点 · 先用放大镜找线索，彻底告别语法粗心！'
              : '北师大版四年级核心思维 · 动态画图 + 天平积木，把大题切成轻松小步！'}
          </p>
        </div>
        <button className={subject === 'english' ? 'btn-sky' : 'btn-mint'} onClick={handleQuickPick}>
          <Shuffle size={17} /> 随机挑一宗案子
        </button>
      </div>

      {/* 知识点筛选胶囊 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className="btn-soft"
          style={{
            background: selectedSkill === 'all' ? '#F59E0B' : '#FFFFFF',
            color: selectedSkill === 'all' ? '#FFFFFF' : '#475569',
            borderColor: selectedSkill === 'all' ? '#D97706' : '#E2E8F0',
          }}
          onClick={() => setSelectedSkill('all')}
        >
          全部案件 ({cases.filter((c) => c.subject === subject).length})
        </button>
        {skills.map((sk) => {
          const active = selectedSkill === sk.id;
          return (
            <button
              key={sk.id}
              className="btn-soft"
              style={{
                background: active ? '#F59E0B' : '#FFFFFF',
                color: active ? '#FFFFFF' : '#475569',
                borderColor: active ? '#D97706' : '#E2E8F0',
              }}
              onClick={() => setSelectedSkill(sk.id)}
            >
              {sk.shortName}
            </button>
          );
        })}
      </div>

      {/* 案件卡片列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {filtered.map((c) => {
          const solved = solvedIds.includes(c.id);
          const diff = DIFF_LABELS[c.difficulty];
          return (
            <div
              key={c.id}
              className="card"
              style={{
                padding: 18,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
                borderColor: solved ? '#6EE7B7' : 'var(--border-soft)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
                  <span className={`pill ${diff.color}`}>{diff.label}</span>
                  {solved ? (
                    <span className="pill pill-green">
                      <CheckCircle2 size={13} /> 已破案
                    </span>
                  ) : (
                    <span className="pill pill-amber">⭐ +{c.rewardStars}</span>
                  )}
                </div>
                <div style={{ fontSize: 17, fontWeight: 900, color: '#0F172A' }}>{c.title}</div>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 700, marginTop: 4 }}>
                  {c.textbookRef} · 嫌疑人：{c.suspectName}
                </div>
                {c.isAiGenerated && (
                  <span className="pill pill-purple" style={{ marginTop: 6 }}>
                    <Sparkles size={12} /> AI 专属定制案
                  </span>
                )}
              </div>

              <button
                className={solved ? 'btn-soft' : 'btn-primary'}
                style={{ width: '100%', padding: '10px 14px', fontSize: 14 }}
                onClick={() => onStartCase(c)}
              >
                <Play size={15} fill="currentColor" /> {solved ? '再次回味演练' : '开始侦查'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
