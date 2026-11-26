import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Calculator,
  ClipboardCheck,
  Flame,
  Home,
  Settings,
  Star,
  Target,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react';
import { DetectiveCase, EquipmentItem, ExamPaper, ExamRecord, LearnerProfile } from './types';
import { BUILTIN_CASES } from './data/curriculum';
import { createDefaultProfile, loadProfile, recordCaseCompletion, saveProfile } from './utils/storage';
import { sound } from './utils/sound';
import { HomeView } from './components/HomeView';
import { CaseListView } from './components/CaseListView';
import { CasePlayView } from './components/CasePlayView';
import { FugitiveView } from './components/FugitiveView';
import { WardrobeView } from './components/WardrobeView';
import { AiTutorView } from './components/AiTutorView';
import { ExamView } from './components/ExamView';
import { ParentDashboard } from './components/ParentDashboard';

type Tab = 'home' | 'english' | 'math' | 'exams' | 'fugitive' | 'wardrobe' | 'tutor' | 'parent';

export function App() {
  const [profile, setProfile] = useState<LearnerProfile>(() => loadProfile());
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activeCase, setActiveCase] = useState<DetectiveCase | null>(null);

  useEffect(() => {
    sound.enabled = profile.soundEnabled;
    saveProfile(profile);
  }, [profile]);

  const allCases = useMemo(
    () => [...profile.customCases, ...BUILTIN_CASES],
    [profile.customCases]
  );

  const atLargeCount = useMemo(
    () => profile.fugitives.filter((f) => f.status === 'at_large').length,
    [profile.fugitives]
  );

  const handleToggleSound = () => {
    setProfile((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleCaseComplete = (
    detectiveCase: DetectiveCase,
    stats: {
      wrongAttempts: number;
      hintsUsed: number;
      cluesFoundBeforeAnswer: boolean;
      durationSec: number;
      bonusStars: number;
    }
  ) => {
    const { updated, earnedStars } = recordCaseCompletion(profile, detectiveCase, stats);
    setProfile(updated);
    return { earnedStars };
  };

  const handleNextCase = () => {
    if (!activeCase) return;
    const sameSubjectUnsolved = allCases.filter(
      (c) =>
        c.subject === activeCase.subject &&
        c.id !== activeCase.id &&
        !profile.solvedCaseIds.includes(c.id)
    );
    const pool =
      sameSubjectUnsolved.length > 0
        ? sameSubjectUnsolved
        : allCases.filter((c) => c.id !== activeCase.id);
    if (pool.length > 0) {
      setActiveCase(pool[0]);
    } else {
      setActiveCase(null);
    }
  };

  const handleUnlockGear = (item: EquipmentItem) => {
    setProfile((prev) => {
      if (prev.stars < item.cost || prev.unlockedGearIds.includes(item.id)) return prev;
      return {
        ...prev,
        stars: prev.stars - item.cost,
        unlockedGearIds: [...prev.unlockedGearIds, item.id],
        equippedGear: { ...prev.equippedGear, [item.slot]: item.id },
      };
    });
  };

  const handleEquipGear = (item: EquipmentItem) => {
    setProfile((prev) => {
      const currentlyEquipped = prev.equippedGear[item.slot] === item.id;
      const nextGear = { ...prev.equippedGear };
      if (currentlyEquipped) {
        delete nextGear[item.slot];
      } else {
        nextGear[item.slot] = item.id;
      }
      return { ...prev, equippedGear: nextGear };
    });
  };

  const handleAddCustomCase = (newCase: DetectiveCase) => {
    setProfile((prev) => ({
      ...prev,
      customCases: [newCase, ...prev.customCases].slice(0, 20),
    }));
  };

  const handleFinishExam = ({
    record,
    missedCases,
    earnedStars,
  }: {
    paper: ExamPaper;
    record: ExamRecord;
    missedCases: DetectiveCase[];
    earnedStars: number;
  }) => {
    setProfile((prev) => {
      const nextFugitives = [...prev.fugitives];
      missedCases.forEach((mc) => {
        const idx = nextFugitives.findIndex((f) => f.caseId === mc.id);
        if (idx >= 0) {
          nextFugitives[idx] = { ...nextFugitives[idx], status: 'at_large', addedAt: Date.now() };
        } else {
          nextFugitives.unshift({
            caseId: mc.id,
            suspectName: mc.suspectName,
            skill: mc.skill,
            subject: mc.subject,
            cause: 'concept',
            addedAt: Date.now(),
            capturedCount: 0,
            status: 'at_large',
          });
        }
      });

      return {
        ...prev,
        stars: prev.stars + earnedStars,
        totalStarsEarned: prev.totalStarsEarned + earnedStars,
        fugitives: nextFugitives,
        examHistory: [record, ...(prev.examHistory || [])].slice(0, 50),
      };
    });
  };

  return (
    <div className="app-shell">
      {/* 顶部栏 */}
      <header className="top-bar">
        <button
          className="brand-pill"
          onClick={() => {
            setActiveCase(null);
            setActiveTab('home');
          }}
        >
          <div className="brand-logo">🕵️</div>
          <div>
            <div className="brand-title">神探星途</div>
            <div className="brand-sub">深圳四年级智慧探案学院</div>
          </div>
        </button>

        <div className="top-stats">
          <div className="stat-chip star" title="当前可用侦探星">
            <Star size={16} fill="#F59E0B" color="#D97706" />
            <span>{profile.stars}</span>
          </div>
          <div className="stat-chip streak" title="连续探案天数">
            <Flame size={16} fill="#FB923C" color="#EA580C" />
            <span>{profile.streakDays} 天</span>
          </div>
          <button
            className="icon-btn"
            onClick={handleToggleSound}
            title={profile.soundEnabled ? '关闭音效' : '开启音效'}
          >
            {profile.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              setActiveCase(null);
              setActiveTab('parent');
            }}
            title="家长洞察控制台"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* 主内容区域 */}
      <main>
        {activeCase ? (
          <CasePlayView
            key={activeCase.id}
            detectiveCase={activeCase}
            nickname={profile.nickname}
            equippedGear={profile.equippedGear}
            onBack={() => setActiveCase(null)}
            onComplete={(stats) => handleCaseComplete(activeCase, stats)}
            onNextCase={handleNextCase}
          />
        ) : activeTab === 'home' ? (
          <HomeView
            profile={profile}
            allCases={allCases}
            onStartCase={(c) => setActiveCase(c)}
            onNavigate={(t) => setActiveTab(t)}
          />
        ) : activeTab === 'english' ? (
          <CaseListView
            subject="english"
            cases={allCases}
            solvedIds={profile.solvedCaseIds}
            onStartCase={(c) => setActiveCase(c)}
          />
        ) : activeTab === 'math' ? (
          <CaseListView
            subject="math"
            cases={allCases}
            solvedIds={profile.solvedCaseIds}
            onStartCase={(c) => setActiveCase(c)}
          />
        ) : activeTab === 'exams' ? (
          <ExamView
            profile={profile}
            allCases={allCases}
            equippedGear={profile.equippedGear}
            onFinishExam={handleFinishExam}
            onPracticeCase={(c) => setActiveCase(c)}
          />
        ) : activeTab === 'fugitive' ? (
          <FugitiveView
            fugitives={profile.fugitives}
            allCases={allCases}
            onStartCase={(c) => setActiveCase(c)}
          />
        ) : activeTab === 'wardrobe' ? (
          <WardrobeView
            profile={profile}
            onUnlockGear={handleUnlockGear}
            onEquipGear={handleEquipGear}
          />
        ) : activeTab === 'tutor' ? (
          <AiTutorView
            profile={profile}
            equippedGear={profile.equippedGear}
            onAddCustomCase={handleAddCustomCase}
            onStartCase={(c) => setActiveCase(c)}
          />
        ) : (
          <ParentDashboard
            profile={profile}
            onUpdateProfile={(updater) => setProfile(updater)}
            onResetAll={() => setProfile(createDefaultProfile())}
            onBack={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* 底部平板/手机常驻导航 */}
      {!activeCase && activeTab !== 'parent' && (
        <nav className="bottom-nav" aria-label="主导航">
          <button
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={20} />
            <span>事务所</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'english' ? 'active' : ''}`}
            onClick={() => setActiveTab('english')}
          >
            <BookOpen size={20} />
            <span>英语馆</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'math' ? 'active' : ''}`}
            onClick={() => setActiveTab('math')}
          >
            <Calculator size={20} />
            <span>数学馆</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'exams' ? 'active' : ''}`}
            onClick={() => setActiveTab('exams')}
          >
            <ClipboardCheck size={20} />
            <span>模拟卷</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'fugitive' ? 'active' : ''}`}
            onClick={() => setActiveTab('fugitive')}
          >
            <Target size={20} />
            <span>抓错怪</span>
            {atLargeCount > 0 && <span className="badge-dot">{atLargeCount}</span>}
          </button>
          <button
            className={`nav-item ${activeTab === 'wardrobe' ? 'active' : ''}`}
            onClick={() => setActiveTab('wardrobe')}
          >
            <Award size={20} />
            <span>装备库</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'tutor' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutor')}
          >
            <Wand2 size={20} />
            <span>问阿探</span>
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
