import React, { useState } from 'react';
import { ArrowLeft, Download, KeyRound, Lock, RotateCcw, Save, ShieldCheck, Upload } from 'lucide-react';
import { LearnerProfile } from '../types';
import { SKILL_META } from '../data/curriculum';
import { EXAM_PAPERS } from '../data/exams';
import { computeSkillMastery } from '../utils/storage';

interface Props {
  profile: LearnerProfile;
  onUpdateProfile: (updater: (prev: LearnerProfile) => LearnerProfile) => void;
  onResetAll: () => void;
  onBack: () => void;
}

export const ParentDashboard: React.FC<Props> = ({
  profile,
  onUpdateProfile,
  onResetAll,
  onBack,
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [gateInput, setGateInput] = useState('');
  const [gateHint, setGateHint] = useState('');

  const [nickname, setNickname] = useState(profile.nickname);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoal);
  const [apiKey, setApiKey] = useState(profile.geminiApiKey);
  const [savedToast, setSavedToast] = useState('');

  const masteryList = computeSkillMastery(
    profile.attempts,
    SKILL_META.map((s) => ({ id: s.id, subject: s.subject }))
  );

  const totalAttempts = profile.attempts.length;
  const carelessTotal = profile.attempts.filter((a) => a.errorCause === 'careless').length;
  const conceptTotal = profile.attempts.filter((a) => a.errorCause === 'concept').length;
  const perfectTotal = profile.attempts.filter((a) => a.firstTryPerfect).length;

  const weakest = [...masteryList]
    .filter((m) => m.attempts > 0)
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, 2);

  // SVG 8 维雷达图坐标计算
  const cx = 150;
  const cy = 140;
  const radius = 92;
  const count = masteryList.length;

  const getPoint = (idx: number, pct: number) => {
    const angle = (Math.PI * 2 * idx) / count - Math.PI / 2;
    const r = (radius * pct) / 100;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const radarPolygon = masteryList
    .map((m, i) => {
      const p = getPoint(i, Math.max(15, m.masteryScore));
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (gateInput.trim() === '56') {
      setUnlocked(true);
    } else {
      setGateHint('算一算 7 × 8 = 56 哦（防小朋友误触锁）');
    }
  };

  const handleSaveSettings = () => {
    onUpdateProfile((prev) => ({
      ...prev,
      nickname: nickname.trim() || '小神探',
      dailyGoal: Number(dailyGoal) || 3,
      geminiApiKey: apiKey.trim(),
    }));
    setSavedToast('设置已保存！');
    setTimeout(() => setSavedToast(''), 2500);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `detective-learning-backup-${profile.nickname}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (parsed && typeof parsed.stars === 'number') {
          onUpdateProfile((prev) => ({ ...prev, ...parsed }));
          setSavedToast('进度已成功恢复！');
          setTimeout(() => setSavedToast(''), 2500);
        }
      } catch {
        setSavedToast('文件格式不对，请检查备份文件。');
      }
    };
    reader.readAsText(file);
  };

  if (!unlocked) {
    return (
      <div className="fade-in" style={{ maxWidth: 460, margin: '28px auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, background: '#FEF3C7', color: '#B45309', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Lock size={26} />
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900 }}>家长洞察控制台</h2>
          <p style={{ margin: '0 0 18px', fontSize: 14, color: 'var(--ink-muted)' }}>
            防止小朋友误改设置，请输入答案解锁：<strong>7 × 8 = ?</strong>
          </p>
          <form onSubmit={handleUnlock} style={{ display: 'flex', gap: 10 }}>
            <input
              className="input-box"
              type="number"
              inputMode="numeric"
              value={gateInput}
              onChange={(e) => setGateInput(e.target.value)}
              placeholder="输入 56 进入"
              autoFocus
            />
            <button type="submit" className="btn-primary" style={{ flexShrink: 0 }}>
              解锁
            </button>
          </form>
          {gateHint && <div style={{ marginTop: 10, fontSize: 13, color: '#D97706', fontWeight: 700 }}>{gateHint}</div>}
          <button className="btn-soft" style={{ marginTop: 18 }} onClick={onBack}>
            <ArrowLeft size={16} /> 返回学习界面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <button className="btn-soft" onClick={onBack}>
          <ArrowLeft size={16} /> 返回孩子界面
        </button>
        <span className="pill pill-green">
          <ShieldCheck size={14} /> 家长专属诊断与配置
        </span>
      </div>

      {/* 顶部核心指标 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 700 }}>累计斩杀怪物</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#FDE68A' }}>{totalAttempts} 次</div>
          <div style={{ fontSize: 12, color: '#6EE7B7', fontWeight: 700 }}>一次完美率：{totalAttempts ? Math.round((perfectTotal / totalAttempts) * 100) : 0}%</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 700 }}>🔍 粗心型失误</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#FBBF24' }}>{carelessTotal} 次</div>
          <div style={{ fontSize: 12, color: '#FDBA74', fontWeight: 600 }}>漏看线索词或作答过快</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 700 }}>🧩 概念/逻辑卡壳</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#C084FC' }}>{conceptTotal} 次</div>
          <div style={{ fontSize: 12, color: '#D8B4FE', fontWeight: 600 }}>需借助画图与分步巩固</div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)', fontWeight: 700 }}>已攻克题库</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#60A5FA' }}>{profile.solvedCaseIds.length} / 150</div>
          <div style={{ fontSize: 12, color: '#93C5FD', fontWeight: 600 }}>连续试炼 {profile.streakDays} 天</div>
        </div>
      </div>

      {/* 能力雷达图 + 弱项处方 */}
      <div className="hero-grid">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 900, alignSelf: 'flex-start' }}>
            📊 深圳四年级 8 维能力雷达
          </h3>
          <svg viewBox="0 0 300 280" style={{ width: '100%', maxWidth: 320 }}>
            {[25, 50, 75, 100].map((lvl) => (
              <polygon
                key={lvl}
                points={Array.from({ length: count }, (_, i) => {
                  const p = getPoint(i, lvl);
                  return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                }).join(' ')}
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="1.2"
              />
            ))}
            {masteryList.map((m, i) => {
              const end = getPoint(i, 100);
              const lbl = getPoint(i, 122);
              const meta = SKILL_META.find((s) => s.id === m.skill)!;
              return (
                <g key={m.skill}>
                  <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#E2E8F0" strokeWidth="1" />
                  <text
                    x={lbl.x}
                    y={lbl.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10.5"
                    fontWeight="800"
                    fill={meta.subject === 'english' ? '#1D4ED8' : '#047857'}
                  >
                    {meta.shortName}
                  </text>
                </g>
              );
            })}
            <polygon
              points={radarPolygon}
              fill="rgba(245, 158, 11, 0.28)"
              stroke="#F59E0B"
              strokeWidth="2.5"
            />
            {masteryList.map((m, i) => {
              const p = getPoint(i, Math.max(15, m.masteryScore));
              return <circle key={m.skill} cx={p.x} cy={p.y} r="4" fill="#D97706" />;
            })}
          </svg>
          <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
            蓝色标签为英语（沪教牛津深圳版），绿色标签为数学（北师大版）
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>💛 家庭鼓励与辅导处方</h3>
          {weakest.length === 0 ? (
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-muted)' }}>
              孩子完成 1~2 宗探案后，这里会自动生成精准的薄弱项分析与“不伤自信的家庭表扬话术”。
            </p>
          ) : (
            weakest.map((w) => {
              const meta = SKILL_META.find((s) => s.id === w.skill)!;
              return (
                <div
                  key={w.skill}
                  style={{
                    background: '#FFFBEB',
                    border: '2px solid #FDE68A',
                    borderRadius: 14,
                    padding: '12px 14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14, color: '#92400E' }}>
                    <span>重点关注：{meta.name}</span>
                    <span>掌握度 {w.masteryScore}%</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#78350F', marginTop: 6, lineHeight: 1.55 }}>
                    💡 <strong>家长建议：</strong>{meta.parentTip}
                  </div>
                </div>
              );
            })
          )}

          <div
            style={{
              background: '#ECFDF5',
              border: '2px solid #A7F3D0',
              borderRadius: 14,
              padding: '12px 14px',
              fontSize: 13,
              color: '#065F46',
              lineHeight: 1.6,
            }}
          >
            <strong>🌟 克服畏难心理的“夸过程”话术示例：</strong>
            <br />
            • 不要说：“这题怎么又粗心做错了？”
            <br />
            • 试试说：“我看到你刚才用放大镜先找出了关键线索，遇到卡壳还自己用了提示一步步推出来，这个习惯比直接蒙对厉害多了！”
          </div>
        </div>
      </div>

      {/* 模拟考试成绩记录 */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>
          📝 近期模拟考成绩记录（共完成 {(profile.examHistory || []).length} 次）
        </h3>
        {(profile.examHistory || []).length === 0 ? (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-muted)' }}>
            孩子完成「神探模拟考场」中的任意 12~20 题模拟卷后，这里会自动展示每次分数、用时与薄弱考点变化！
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {(profile.examHistory || []).slice(0, 8).map((rec, i) => {
              const paper = EXAM_PAPERS.find((p) => p.id === rec.examId);
              return (
                <div
                  key={i}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: 14,
                    padding: '10px 14px',
                    border: '1.5px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: 14 }}>
                    <span>{paper?.title || rec.examId}</span>
                    <span style={{ color: rec.score >= 85 ? '#059669' : '#D97706', fontSize: 16 }}>
                      {rec.score} 分
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                    答对 {rec.correctCount}/{rec.totalCount} 题 · 用时 {Math.max(1, Math.round(rec.durationSec / 60))} 分钟
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 个性化与 AI 配置 */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>⚙️ 学习与 AI 导师配置</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
              孩子昵称（阿探会亲切呼唤他）
            </label>
            <input className="input-box" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
              每日轻目标（建议 3 宗 ≈ 5 分钟，降低畏难）
            </label>
            <select
              className="input-box"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
            >
              <option value={2}>每天 2 宗（超轻松起步）</option>
              <option value={3}>每天 3 宗（推荐 · 约 5 分钟）</option>
              <option value={5}>每天 5 宗（进阶挑战）</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
            <KeyRound size={15} /> 可选：Gemini API Key（仅保存在本机浏览器，用于开启 AI 拍题讲解与定制出题）
          </label>
          <input
            className="input-box"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="留空也能完美使用全部内置题库和本地苏格拉底引导"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={handleSaveSettings}>
            <Save size={16} /> 保存配置
          </button>
          <button className="btn-soft" onClick={handleExport}>
            <Download size={16} /> 导出学习备份
          </button>
          <label className="btn-soft" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> 导入备份
            <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
          </label>
          <button
            className="btn-soft"
            style={{ color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2' }}
            onClick={() => {
              if (window.confirm('确定要清空所有学习记录并重新开始吗？')) {
                onResetAll();
              }
            }}
          >
            <RotateCcw size={15} /> 重置进度
          </button>
          {savedToast && <span className="pill pill-green">{savedToast}</span>}
        </div>
      </div>
    </div>
  );
};
