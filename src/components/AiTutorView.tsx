import React, { useState } from 'react';
import { ImagePlus, Send, Sparkles, Wand2, Play } from 'lucide-react';
import { DetectiveCase, EquipmentItem, LearnerProfile, SkillCategory } from '../types';
import { DetectiveAvatar } from './DetectiveAvatar';
import { SKILL_META } from '../data/curriculum';
import { computeSkillMastery } from '../utils/storage';
import { sound } from '../utils/sound';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  imagePreview?: string;
}

interface Props {
  profile: LearnerProfile;
  equippedGear: Partial<Record<EquipmentItem['slot'], string>>;
  onAddCustomCase: (newCase: DetectiveCase) => void;
  onStartCase: (c: DetectiveCase) => void;
}

const PRESET_QUESTIONS = [
  '为什么 “Peter doesn\'t like apples” 里的 like 不加 s？',
  '这道应用题我看不懂：小明买 3 支笔花 18 元，买 7 支同样的笔要多少钱？',
  '乘法分配律 25 × 44 怎么拆才好算呀？',
  'There is a book and two pens 为什么用 is 不用 are？',
];

// 本地离线苏格拉底引导引擎（无 API Key 也能用得很棒）
function localSocraticReply(question: string, nickname: string): string {
  const q = question.toLowerCase();
  if (q.includes('doesn') || q.includes('三单') || q.includes('加 s') || q.includes('likes')) {
    return `好问题，${nickname}！咱们用放大镜照一照「doesn't」这个词：\n\n1️⃣ 你看 doesn't 里面是不是已经带着 “es” 啦？\n2️⃣ 阿探把 does / doesn't 叫做【照妖镜】——它已经帮后面的动词背走了 s，所以后面的动词必须光秃秃地【现原形】！\n\n💡 小考验：那你猜猜 “Does she ___ (go / goes) to school by bus?” 该选哪一个？（提示：前面站着照妖镜 Does 哦！）`;
  }
  if (q.includes('there') || q.includes('就近') || q.includes('is') && q.includes('are')) {
    return `${nickname}，记住阿探的搞笑画面就能永远不忘：\n\n🐶 **There be 是一只近视眼小狗！**\n它看不远，眼睛只盯着【紧挨着它右边的第一个词】！\n• 如果紧挨着的是 a book（1本，单数）→ 选 **is**\n• 如果紧挨着的是 two pens（2支，复数）→ 选 **are**\n\n💡 考考你：把顺序反过来 “There ___ two pens and a book.” 这时候近视眼小狗第一眼看到谁？该填 is 还是 are？`;
  }
  if (q.includes('分配律') || q.includes('25') || q.includes('巧算') || q.includes('×')) {
    return `别怕大数字，${nickname}！咱们把大算式当成**拼乐高积木**：\n\n🌟 记住超级好朋友配对：**25 × 4 = 100**，**125 × 8 = 1000**！\n比如 25 × 44，你可以有两种酷炫拆法：\n• **拆加法**：把 44 拆成 40 + 4 → 25×40 + 25×4 = 1000 + 100 = 1100！\n• **拆乘法**：把 44 拆成 4 × 11 → (25×4) × 11 = 100 × 11 = 1100！\n\n你更喜欢哪一种拆积木的方法？试试告诉我 25 × 16 你想把 16 拆成什么呀？`;
  }
  if (q.includes('应用题') || q.includes('多少钱') || q.includes('支笔') || q.includes('一共')) {
    return `遇到应用题别急着一口算完，${nickname}！用咱们的【神探切块法】切成两小步，超简单：\n\n🔍 **第一步（先找“1 个”是多少）**：3 支笔一共 18 元，那 **1 支笔** 是多少钱？（18 ÷ 3 = ？）\n🔍 **第二步（再算要买的数量）**：算出 1 支笔的价钱后，乘以 7 支就是答案啦！\n\n你先告诉我第一步：1 支笔是几块钱呀？答对阿探给你点赞！👏`;
  }
  return `收到你的案件啦，${nickname}！咱们别急着直接要答案，一起用【神探三步法】拆解它：\n\n1️⃣ **圈线索**：这道题里有哪些关键数字、人称词或时间词？（比如“往返”“还剩”“every day”“Look!”）\n2️⃣ **画个图/找规律**：如果是数学题，试试把已知条件画成小线段；如果是英语题，先找主角是谁、什么时候发生！\n3️⃣ **切成第一步**：你觉得解决这道题，最最简单的第一步可以先算/先判断什么？\n\n💡（爸爸妈妈在右上角【家长看板】填入 Gemini API Key 后，阿探还能开启超强 AI 识图与深度定制出题哦！）`;
}

export const AiTutorView: React.FC<Props> = ({
  profile,
  equippedGear,
  onAddCustomCase,
  onStartCase,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: `嗨 ${profile.nickname}！我是你的专属解惑搭档阿探 🐾\n写作业遇到看不懂的数学题或英语语法题，直接发给我！我绝不骂人，也不直接甩干巴巴的答案，咱们一起像拆乐高一样一步步把它弄懂！`,
    },
  ]);
  const [input, setInput] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState(false);
  const [generatingCase, setGeneratingCase] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<DetectiveCase | null>(null);

  const mastery = computeSkillMastery(
    profile.attempts,
    SKILL_META.map((s) => ({ id: s.id, subject: s.subject }))
  );
  const weakestSkillMeta = (() => {
    const sorted = [...mastery].sort((a, b) => a.masteryScore - b.masteryScore);
    return SKILL_META.find((s) => s.id === sorted[0]?.skill) || SKILL_META[0];
  })();

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const sendMessage = async (textOverride?: string) => {
    const content = (textOverride ?? input).trim();
    if (!content && !imageBase64) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: content || '请帮我看看这道拍照的题目怎么理解~',
      imagePreview: imageBase64 || undefined,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    const currentImg = imageBase64;
    setImageBase64(null);
    setLoading(true);

    try {
      if (!profile.geminiApiKey) {
        // 本地离线引导模式
        await new Promise((r) => setTimeout(r, 450));
        const reply = localSocraticReply(userMsg.text, profile.nickname);
        sound.playHint();
        setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      } else {
        // 调用 Gemini API (gemini-2.5-flash)
        const systemPrompt = `你是“阿探”，一位温柔、幽默、极具耐心的柴犬小神探导师，专门辅导深圳小学四年级学生（名字叫 ${profile.nickname}，英语教材为沪教牛津深圳版，数学教材为北师大版）。
孩子的特点：容易粗心、数学逻辑较弱、有畏难心理、害怕失败。
你的辅导原则（必须严格遵守）：
1. 永远先表扬孩子的提问或思考，绝不出现“错了”“笨”“这么简单都不会”等打击性词语。
2. 用苏格拉底式启发教学：把题目拆成极小的第一步，用四年级孩子秒懂的生活比喻（如积木、天平、近视眼小狗、放大镜找线索）讲清核心直觉，而不是直接甩一大段枯燥答案。
3. 回复简短清晰（150字以内优先），用小标题和 emoji，并在最后抛出一个超级简单的小问题让孩子互动回答，帮他获得成就感。`;

        const parts: Record<string, unknown>[] = [{ text: userMsg.text }];
        if (currentImg) {
          const base64Data = currentImg.split(',')[1];
          parts.push({
            inline_data: {
              mime_type: imageMime,
              data: base64Data,
            },
          });
        }

        const contents = [
          ...nextHistory.slice(-6, -1).map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }],
          })),
          { role: 'user', parts },
        ];

        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
            profile.geminiApiKey
          )}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemPrompt }] },
              contents,
            }),
          }
        );

        if (!resp.ok) {
          throw new Error(`API ${resp.status}`);
        }
        const data = await resp.json();
        const aiText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          localSocraticReply(userMsg.text, profile.nickname);
        sound.playHint();
        setMessages((prev) => [...prev, { role: 'assistant', text: aiText }]);
      }
    } catch {
      const fallback =
        localSocraticReply(userMsg.text, profile.nickname) +
        '\n\n（注：当前未能连上 Gemini API，已自动切换为阿探本地辅导模式，请检查网络或家长看板中的 API Key。）';
      setMessages((prev) => [...prev, { role: 'assistant', text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  // 一键针对最薄弱技能生成专属新案件
  const handleGenerateWeaknessCase = async () => {
    setGeneratingCase(true);
    try {
      let generated: DetectiveCase | null = null;

      if (profile.geminiApiKey) {
        const prompt = `请为深圳小学四年级学生生成 1 道全新的互动侦探闯关题（JSON 格式，不要输出 markdown 代码块外的任何文字）。
目标薄弱知识点：${weakestSkillMeta.name} (${weakestSkillMeta.id})，学科：${weakestSkillMeta.subject}，教材：${weakestSkillMeta.textbook}。
要求：
- 严格匹配下面 TypeScript JSON 结构：
{
  "title": "有趣的案件标题",
  "suspectName": "可爱的陷阱小怪名称",
  "storyIntro": "简短鼓励性的案件背景（40字内）",
  "clueGoalText": "提示孩子点出关键线索",
  "tokens": [{"text": "片段", "isClue": true, "clueTip": "点中线索后的口诀提示"}, {"text": "___", "isBlank": true}],
  "steps": [{
    "prompt": "简洁明了的小步提问",
    "options": ["选项A", "选项B", "选项C"],
    "correctIndex": 0,
    "optionFeedback": ["温柔反馈A", "温柔反馈B", "温柔反馈C"],
    "hints": ["提示1线索", "提示2比喻", "提示3手把手"]
  }],
  "goldenRule": "一句好记的神探口诀"
}
如果是数学题，tokens 不需要 isBlank，steps 请拆成 2 个由易到难的小步骤；如果是英语题，tokens 包含 1 个 isBlank 槽位和 1-2 个 isClue 关键词。`;

        const resp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
            profile.geminiApiKey
          )}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (resp.ok) {
          const data = await resp.json();
          const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJson) {
            const parsed = JSON.parse(rawJson);
            if (parsed.title && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
              generated = {
                id: `ai-${Date.now()}`,
                subject: weakestSkillMeta.subject,
                skill: weakestSkillMeta.id as SkillCategory,
                mode: weakestSkillMeta.subject === 'english' ? 'eng_clue_fill' : 'math_scaffold',
                difficulty: 2,
                textbookRef: `${weakestSkillMeta.textbook} · AI定制`,
                title: parsed.title,
                suspectName: parsed.suspectName || '神秘陷阱怪',
                storyIntro: parsed.storyIntro || '阿探为你量身定制的专属突破案！',
                clueGoalText: parsed.clueGoalText || '先用放大镜找出题干里的关键线索！',
                tokens: Array.isArray(parsed.tokens) ? parsed.tokens : [{ text: parsed.storyIntro }],
                steps: parsed.steps,
                goldenRule: parsed.goldenRule || '细心找线索，分步解难题！',
                rewardStars: 22,
                isAiGenerated: true,
              };
            }
          }
        }
      }

      // 本地智能变式兜底生成（无需 API Key 也能无限出新变式题！）
      if (!generated) {
        await new Promise((r) => setTimeout(r, 400));
        if (weakestSkillMeta.subject === 'english') {
          const names = ['Tom', 'Alice', 'Ben', 'Lucy'];
          const verbs = [
            { base: 'play', s: 'plays', obj: 'basketball' },
            { base: 'read', s: 'reads', obj: 'storybooks' },
            { base: 'drink', s: 'drinks', obj: 'milk' },
          ];
          const n = names[Math.floor(Math.random() * names.length)];
          const v = verbs[Math.floor(Math.random() * verbs.length)];
          generated = {
            id: `local-${Date.now()}`,
            subject: 'english',
            skill: 'eng_third_person',
            mode: 'eng_clue_fill',
            difficulty: 1,
            textbookRef: '沪教牛津深圳版 · 变式特训',
            title: `${n} 的每日神秘习惯`,
            suspectName: '变身三单怪',
            storyIntro: `阿探根据你的薄弱点生成了专属特训案！找找主角 ${n} 和时间线索！`,
            readAloudText: `${n} ${v.s} ${v.obj} every day.`,
            clueGoalText: '用放大镜点出主角人名和时间词（共 2 处）！',
            tokens: [
              { text: n, isClue: true, clueTip: `${n} 是单个人名（第三人称单数），一般现在时动词要戴上 s 小帽子！` },
              { text: '___', isBlank: true },
              { text: v.obj },
              { text: 'every day.', isClue: true, clueTip: 'every day（每天）表示经常发生的习惯！' },
            ],
            steps: [
              {
                prompt: `结合 ${n} 和 every day，横线应该填哪个词？`,
                options: [v.base, v.s, `${v.base}ing`],
                correctIndex: 1,
                optionFeedback: [
                  `差点就对啦！主角 ${n} 只有一个人（三单），别忘了给动词戴 s 小帽子！`,
                  `太帅了！${n} 是三单，所以 ${v.base} 变身成 ${v.s}！`,
                  `这里有 every day（日常习惯），不是正在发生，不需要 -ing 哦~`,
                ],
                hints: [
                  `点一下 ${n} 看看它是单数还是复数。`,
                  '单个人名配一般现在时，动词加 s！',
                  `选 ${v.s}！`,
                ],
              },
            ],
            goldenRule: '神探口诀：单个人名配 every day，动词戴上 s 小帽子！',
            rewardStars: 18,
            isAiGenerated: true,
          };
        } else {
          const singleLen = [200, 250, 300, 350][Math.floor(Math.random() * 4)];
          const roundTrips = [2, 3][Math.floor(Math.random() * 2)];
          const oneRound = singleLen * 2;
          const total = oneRound * roundTrips;
          generated = {
            id: `local-${Date.now()}`,
            subject: 'math',
            skill: 'math_trap_reading',
            mode: 'math_scaffold',
            difficulty: 2,
            textbookRef: '北师大版 · 变式防粗心特训',
            title: `泳池往返特训（${singleLen}米版）`,
            suspectName: '泳池往返怪',
            storyIntro: `专门克制粗心的变式挑战！泳道长 ${singleLen} 米，游 ${roundTrips} 个往返一共多少米？`,
            clueGoalText: '先用放大镜圈出泳道长度和“往返”陷阱！',
            tokens: [
              { text: '游泳池泳道长' },
              { text: `${singleLen} 米`, isClue: true, clueTip: `单程游 1 趟是 ${singleLen} 米！` },
              { text: '，小探员游了' },
              { text: `${roundTrips} 个往返`, isClue: true, clueTip: '陷阱警报！1 个往返 = 去 + 回 = 2 趟！' },
              { text: '，一共游了多少米？' },
            ],
            visual: {
              type: 'bar_model',
              title: `往返拆解图（1 个往返 = ${singleLen}×2 = ${oneRound} 米）`,
              unit: '米',
              bars: Array.from({ length: roundTrips }, (_, idx) => ({
                label: `第${idx + 1}往返`,
                segments: [
                  { valueLabel: `去 ${singleLen}米`, flex: 1, color: '#60A5FA' },
                  { valueLabel: `回 ${singleLen}米`, flex: 1, color: '#34D399' },
                ],
                totalLabel: `${oneRound}米`,
              })),
            },
            steps: [
              {
                prompt: `第一步：游 1 个往返（一去一回）一共是多少米？`,
                options: [`${singleLen} 米`, `${oneRound} 米`, `${singleLen + 100} 米`],
                correctIndex: 1,
                optionFeedback: [
                  `${singleLen} 米只是游过去哦，别忘了游回来！`,
                  `太稳了！${singleLen} × 2 = ${oneRound} 米！`,
                  `1 个往返是 2 个 ${singleLen} 米相加哦！`,
                ],
                hints: [
                  `去 ${singleLen} 米，回来又是 ${singleLen} 米。`,
                  `算式：${singleLen} + ${singleLen}。`,
                  `答案是 ${oneRound} 米！`,
                ],
                visualStage: 1,
              },
              {
                prompt: `第二步：${roundTrips} 个往返一共游了多少米？`,
                options: [`${total - singleLen} 米`, `${total} 米`, `${oneRound} 米`],
                correctIndex: 1,
                optionFeedback: [
                  `再数数图里有 ${roundTrips} 个 ${oneRound} 米哦~`,
                  `秒杀变式题！${oneRound} × ${roundTrips} = ${total} 米！`,
                  `${oneRound} 米只是 1 个往返哦，一共游了 ${roundTrips} 个往返！`,
                ],
                hints: [
                  `1 个往返是 ${oneRound} 米，一共 ${roundTrips} 个往返。`,
                  `列式：${oneRound} × ${roundTrips}。`,
                  `答案是 ${total} 米！`,
                ],
                visualStage: 2,
              },
            ],
            goldenRule: '神探口诀：看到“往返”先乘 2，再乘往返次数，稳拿满分！',
            rewardStars: 20,
            isAiGenerated: true,
          };
        }
      }

      sound.playUnlock();
      onAddCustomCase(generated);
      setLastGenerated(generated);
    } finally {
      setGeneratingCase(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部薄弱项定制出题卡 */}
      <div
        className="card card-warm"
        style={{
          borderColor: '#8B5CF6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <DetectiveAvatar mood="thinking" skinId={profile.equippedSkinId} equippedGear={equippedGear} size={76} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span className="pill pill-purple">
                {profile.geminiApiKey ? '✨ Gemini AI 圣光导师已开启' : '🧭 本地苏格拉底引导模式'}
              </span>
            </div>
            <h2 style={{ margin: '6px 0 2px', fontSize: 20, fontWeight: 900, color: '#E9D5FF' }}>
              圣光祭坛 · 问阿探
            </h2>
            <div style={{ fontSize: 13, color: '#D8B4FE', fontWeight: 600 }}>
              当前重点突破目标：<strong>{weakestSkillMeta.name}</strong>
            </div>
          </div>
        </div>

        <button
          className="btn-primary"
          disabled={generatingCase}
          onClick={handleGenerateWeaknessCase}
        >
          <Wand2 size={17} />
          {generatingCase ? '正在定制专属案件...' : '按我的弱项生成 1 宗新案'}
        </button>
      </div>

      {lastGenerated && (
        <div
          className="card fade-in"
          style={{
            background: '#ECFDF5',
            borderColor: '#34D399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            padding: '14px 18px',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#059669' }}>
              <Sparkles size={14} style={{ verticalAlign: 'middle' }} /> 专属新案件已生成！
            </div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#064E3B' }}>
              {lastGenerated.title}（抓捕：{lastGenerated.suspectName}）
            </div>
          </div>
          <button className="btn-mint" onClick={() => onStartCase(lastGenerated)}>
            <Play size={16} fill="currentColor" /> 立即去破案！
          </button>
        </div>
      )}

      {/* 聊天对话窗 */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '86%',
                background: m.role === 'user' ? '#2563EB' : '#1F1A2C',
                color: '#F5EFE4',
                border: m.role === 'user' ? 'none' : '1.5px solid #8C6229',
                borderRadius: 18,
                padding: '12px 15px',
                fontSize: 14,
                fontWeight: 600,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.65,
              }}
            >
              {m.imagePreview && (
                <img
                  src={m.imagePreview}
                  alt="上传的题目"
                  style={{ maxWidth: '100%', maxHeight: 180, borderRadius: 10, marginBottom: 8, display: 'block' }}
                />
              )}
              {m.text}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', color: '#92400E', fontSize: 13, fontWeight: 700 }}>
              🐾 阿探正在举着放大镜帮你拆解思路...
            </div>
          )}
        </div>

        {/* 快捷问题胶囊 */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESET_QUESTIONS.map((q, i) => (
            <button
              key={i}
              type="button"
              className="btn-soft"
              style={{ fontSize: 12, padding: '6px 11px', textAlign: 'left' }}
              onClick={() => sendMessage(q)}
            >
              💬 {q}
            </button>
          ))}
        </div>

        {/* 图片预览 */}
        {imageBase64 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={imageBase64} alt="待发送题目图" style={{ height: 56, borderRadius: 10, border: '2px solid #F59E0B' }} />
            <button className="btn-soft" onClick={() => setImageBase64(null)}>移除图片</button>
          </div>
        )}

        {/* 输入区 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          style={{ display: 'flex', gap: 8, alignItems: 'center' }}
        >
          <label
            className="icon-btn"
            style={{ cursor: 'pointer', flexShrink: 0 }}
            title="拍题或上传作业图片（配置 Gemini API Key 后支持看图辅导）"
          >
            <ImagePlus size={19} />
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImagePick} />
          </label>
          <input
            className="input-box"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入卡壳的数学题或英语语法疑问，阿探一步步带你懂..."
          />
          <button type="submit" className="btn-primary" style={{ flexShrink: 0, padding: '12px 18px' }} disabled={loading}>
            <Send size={17} />
          </button>
        </form>
      </div>
    </div>
  );
};
