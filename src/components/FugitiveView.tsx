import React from 'react';
import { CheckCircle2, ShieldAlert, Play } from 'lucide-react';
import { DetectiveCase, FugitiveEntry } from '../types';
import { SKILL_META } from '../data/curriculum';

interface Props {
  fugitives: FugitiveEntry[];
  allCases: DetectiveCase[];
  onStartCase: (c: DetectiveCase) => void;
}

export const FugitiveView: React.FC<Props> = ({ fugitives, allCases, onStartCase }) => {
  const atLarge = fugitives.filter((f) => f.status === 'at_large');
  const captured = fugitives.filter((f) => f.status === 'captured');

  const getSkillName = (skillId: string) =>
    SKILL_META.find((s) => s.id === skillId)?.shortName || skillId;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div
        className="card card-warm"
        style={{
          borderColor: '#EA580C',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#FDBA74' }}>
          🕵️ 庇护所复仇通缉榜（在逃错题怪）
        </h2>
        <p style={{ margin: '6px 0 0', fontSize: 13.5, fontWeight: 600, color: 'var(--ink-muted)' }}>
          以前不小心溜走的陷阱怪都挂在通缉榜上！再次挑战【一次斩杀】即可亲手彻底净化并领取复仇星！
        </p>
      </div>

      {/* 在逃列表 */}
      <div>
        <h3 style={{ margin: '0 0 12px', fontSize: 17, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={20} color="#EA580C" /> 待抓捕的狡猾陷阱（{atLarge.length}）
        </h3>

        {atLarge.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>🏆</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#065F46' }}>
              太酷了！目前没有任何在逃陷阱！
            </div>
            <p style={{ margin: '6px 0 0', color: 'var(--ink-muted)', fontSize: 14 }}>
              去英语探案馆或数学实验室挑战新案件吧，如果遇到绊脚石，阿探会自动帮你记在这里方便复仇~
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 14 }}>
            {atLarge.map((f) => {
              const targetCase = allCases.find((c) => c.id === f.caseId);
              if (!targetCase) return null;
              return (
                <div
                  key={f.caseId}
                  className="card"
                  style={{
                    border: '2px dashed #FB923C',
                    background: '#1C141D',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: 18,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span className="pill pill-orange">WANTED · 在逃中</span>
                      <span className={`pill ${f.cause === 'careless' ? 'pill-amber' : 'pill-purple'}`}>
                        {f.cause === 'careless' ? '🔍 粗心漏线索' : '🧩 逻辑需加固'}
                      </span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>👾 {f.suspectName}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#475569', marginTop: 4 }}>
                      案件：{targetCase.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                      考点：{getSkillName(f.skill)}
                    </div>
                  </div>
                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '10px 14px', fontSize: 14 }}
                    onClick={() => onStartCase(targetCase)}
                  >
                    <Play size={15} fill="currentColor" /> 立即复仇抓捕！
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 已归案荣誉栏 */}
      {captured.length > 0 && (
        <div>
          <h3 style={{ margin: '8px 0 12px', fontSize: 17, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={20} color="#10B981" /> 已成功抓捕归案（{captured.length}）
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {captured.map((f) => {
              const targetCase = allCases.find((c) => c.id === f.caseId);
              if (!targetCase) return null;
              return (
                <div
                  key={f.caseId}
                  className="card"
                  style={{
                    padding: 16,
                    background: '#ECFDF5',
                    borderColor: '#6EE7B7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 15, color: '#065F46' }}>{f.suspectName}</div>
                    <div style={{ fontSize: 12, color: '#047857' }}>{targetCase.title}</div>
                  </div>
                  <span className="pill pill-green">已归案 ✓</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
