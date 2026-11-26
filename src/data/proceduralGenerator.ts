import { DetectiveCase, SkillCategory, Subject } from '../types';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleWithCorrect(correct: string, distractors: { text: string; fb: string }[], correctFb: string) {
  const items = [
    { text: correct, fb: correctFb, isCorrect: true },
    ...distractors.map((d) => ({ text: d.text, fb: d.fb, isCorrect: false })),
  ];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return {
    options: items.map((x) => x.text),
    optionFeedback: items.map((x) => x.fb),
    correctIndex: items.findIndex((x) => x.isCorrect),
  };
}

let seqCounter = 1;
function uid(prefix: string) {
  seqCounter += 1;
  return `gen-${prefix}-${Date.now()}-${seqCounter}`;
}

// ================= 无限变式英语题生成器（沪教牛津深圳版 4A/4B）=================
function genEngThirdPerson(): DetectiveCase {
  const subjects = ['Tom', 'Kitty', 'Alice', 'Ben', 'My brother', 'She', 'He'];
  const verbs = [
    { base: 'play', s: 'plays', ing: 'playing', rest: 'table tennis', zh: '打乒乓球' },
    { base: 'read', s: 'reads', ing: 'reading', rest: 'English books', zh: '读英语书' },
    { base: 'drink', s: 'drinks', ing: 'drinking', rest: 'warm milk', zh: '喝热牛奶' },
    { base: 'draw', s: 'draws', ing: 'drawing', rest: 'cute pandas', zh: '画可爱熊猫' },
    { base: 'watch', s: 'watches', ing: 'watching', rest: 'cartoons', zh: '看动画片' },
    { base: 'go', s: 'goes', ing: 'going', rest: 'to the library', zh: '去图书馆' },
  ];
  const times = ['every day.', 'every Saturday.', 'on Sundays.', 'after school.'];
  const useDoesTrap = Math.random() > 0.45;
  const subj = pick(subjects);
  const v = pick(verbs);
  const time = pick(times);

  if (useDoesTrap) {
    const shuf = shuffleWithCorrect(
      v.base,
      [
        { text: v.s, fb: `小心照妖镜！前面有 doesn't 帮动词背走了 s，后面的动词必须现原形 ${v.base} 哦！` },
        { text: v.ing, fb: `doesn't 后面不接 -ing，直接接动词原形 ${v.base}！` },
      ],
      `火眼金睛！doesn't 是照妖镜，后面动词秒变原形 ${v.base}！`
    );
    return {
      id: uid('eng3d'),
      subject: 'english',
      skill: 'eng_third_person',
      mode: 'eng_clue_fill',
      difficulty: 2,
      textbookRef: '沪教牛津深圳版 4A/4B · 变式卷',
      title: `照妖镜特训：${subj} 的习惯`,
      suspectName: '双s贪心怪',
      storyIntro: `全新变式案！快用放大镜找出 ${subj} 后面的照妖镜！`,
      readAloudText: `${subj} doesn't ${v.base} ${v.rest} ${time}`,
      clueGoalText: '点出主语和照妖镜 doesn\'t（共 2 处）！',
      tokens: [
        { text: subj, isClue: true, clueTip: `${subj} 是第三人称单数，但要看后面有没有照妖镜！` },
        { text: "doesn't", isClue: true, clueTip: '叮！照妖镜 doesn\'t 已经带走了 es，后面的动词必须现原形！' },
        { text: '___', isBlank: true },
        { text: v.rest },
        { text: time },
      ],
      steps: [
        {
          prompt: `照妖镜 doesn't 后面，表示“${v.zh}”的动词应该选：`,
          ...shuf,
          hints: ['点一下 doesn\'t 看看它的魔法！', 'does/doesn\'t 后动词永原形！', `选原形 ${v.base}！`],
        },
      ],
      goldenRule: '神探口诀：does / doesn\'t 是照妖镜，后面动词秒变原形！',
      rewardStars: 16,
      cardId: 'card-eng-does',
    };
  }

  const shuf = shuffleWithCorrect(
    v.s,
    [
      { text: v.base, fb: `差点就对了！看看主角 ${subj} 是单数第三人称，一般现在时动词要戴 s/es 小帽子哦！` },
      { text: v.ing, fb: `句子里有 ${time}（日常习惯），而且没有 be 动词，不用 -ing 哦~` },
    ],
    `太准了！${subj} 是第三人称单数，${v.base} 变身成 ${v.s}！`
  );
  return {
    id: uid('eng3s'),
    subject: 'english',
    skill: 'eng_third_person',
    mode: 'eng_clue_fill',
    difficulty: 1,
    textbookRef: '沪教牛津深圳版 4A/4B · 变式卷',
    title: `三单小帽子：${subj} 爱${v.zh}`,
    suspectName: '偷帽小怪',
    storyIntro: '全新变式案！先找主角和时间线索，别忘了给动词戴帽子！',
    readAloudText: `${subj} ${v.s} ${v.rest} ${time}`,
    clueGoalText: '点出主角和时间词（共 2 处）！',
    tokens: [
      { text: subj, isClue: true, clueTip: `${subj} 是第三人称单数，一般现在时动词要加 s/es！` },
      { text: '___', isBlank: true },
      { text: v.rest },
      { text: time, isClue: true, clueTip: `${time} 表示经常发生的习惯，用一般现在时！` },
    ],
    steps: [
      {
        prompt: `根据 ${subj} 和 ${time}，横线上应填：`,
        ...shuf,
        hints: [`看看主角 ${subj} 是几个人？`, '第三人称单数做习惯动作，动词加 s/es！', `选 ${v.s}！`],
      },
    ],
    goldenRule: '神探口诀：he/she/it 和单个人名，一般现在时动词加 s/es！',
    rewardStars: 15,
    cardId: 'card-eng-s',
  };
}

function genEngThereBe(): DetectiveCase {
  const patterns = [
    { first: 'a ruler', second: 'four pencils', ans: 'is', reason: '紧挨着横线的是单数 a ruler，近视眼 There be 用 is！' },
    { first: 'two erasers', second: 'a pen', ans: 'are', reason: '紧挨着横线的是复数 two erasers，近视眼 There be 用 are！' },
    { first: 'some milk', second: 'two apples', ans: 'is', reason: 'milk 是不可数名词（液体），永远按单数看，用 is！' },
    { first: 'some water', second: 'three cups', ans: 'is', reason: 'water 是不可数名词，前面有 some 也用 is！' },
    { first: 'three kites', second: 'a ball', ans: 'are', reason: '紧挨着的是复数 three kites，所以用 are！' },
  ];
  const p = pick(patterns);
  const wrong = p.ans === 'is' ? 'are' : 'is';
  const shuf = shuffleWithCorrect(
    p.ans,
    [
      { text: wrong, fb: `小心就近原则！There be 是近视眼小狗，只看紧挨着横线右边的【${p.first}】哦！` },
      { text: 'have', fb: 'There 不能和 have 连用，表示“某处有某物”是 There is / There are！' },
    ],
    `火眼金睛！${p.reason}`
  );
  return {
    id: uid('engtb'),
    subject: 'english',
    skill: 'eng_be_have_there',
    mode: 'eng_clue_fill',
    difficulty: 2,
    textbookRef: '沪教牛津深圳版 4A M4 · 变式卷',
    title: '近视眼小狗的桌面白名单',
    suspectName: '就近迷魂怪',
    storyIntro: '记住 There be 只看紧挨着它的第一样东西！快用放大镜锁定！',
    readAloudText: `There ${p.ans} ${p.first} and ${p.second} on the table.`,
    clueGoalText: '点出 There 和紧挨着横线右边的词！',
    tokens: [
      { text: 'There', isClue: true, clueTip: 'There be 就近原则：只看紧挨着横线的第一个名词！' },
      { text: '___', isBlank: true },
      { text: p.first, isClue: true, clueTip: p.reason },
      { text: 'and' },
      { text: p.second },
      { text: 'on the table.' },
    ],
    steps: [
      {
        prompt: `盯着紧挨横线的 “${p.first}”，应该填：`,
        ...shuf,
        hints: [`点一下横线右边紧挨着的 ${p.first}！`, '单数和不可数用 is，复数用 are！', `选 ${p.ans}！`],
      },
    ],
    goldenRule: '神探口诀：There be 近视眼只看第一项，单数不可数 is，复数 are！',
    rewardStars: 18,
    cardId: 'card-eng-there',
  };
}

function genEngPresentProg(): DetectiveCase {
  const items = [
    { cue: 'Look!', subj: 'The boys', be: 'are', verb: 'swimming', wrongV: 'swiming', rest: 'in the pool.' },
    { cue: 'Listen!', subj: 'Sally', be: 'is', verb: 'singing', wrongV: 'sing', rest: 'an English song.' },
    { cue: 'Look!', subj: 'My brother', be: 'is', verb: 'running', wrongV: 'runing', rest: 'on the playground.' },
    { cue: 'Look!', subj: 'The girls', be: 'are', verb: 'dancing', wrongV: 'danceing', rest: 'happily now.' },
  ];
  const it = pick(items);
  const ans = `${it.be} ${it.verb}`;
  const otherBe = it.be === 'is' ? 'are' : 'is';
  const shuf = shuffleWithCorrect(
    ans,
    [
      { text: it.verb, fb: '哎呀丢了双胞胎哥哥 be 动词！现在进行时必须 be + V-ing 一起上场！' },
      { text: `${otherBe} ${it.verb}`, fb: `再看看主角 ${it.subj} 是单数还是复数，be 动词要配对哦！` },
      { text: `${it.be} ${it.wrongV}`, fb: `小心拼写陷阱！正确拼写是 ${it.verb} 哦~` },
    ],
    `完美！${it.cue} 召唤现在进行时，${it.subj} 配 ${ans}，一分不丢！`
  );
  return {
    id: uid('engpp'),
    subject: 'english',
    skill: 'eng_present_prog',
    mode: 'eng_clue_fill',
    difficulty: 2,
    textbookRef: '沪教牛津深圳版 4B M2 · 变式卷',
    title: `进行时抓拍：${it.subj}`,
    suspectName: '丢双胞胎怪',
    storyIntro: '动作正在发生！看看暗号词和主角单复数，凑齐 be + V-ing！',
    readAloudText: `${it.cue} ${it.subj} ${ans} ${it.rest}`,
    clueGoalText: '点出开头的暗号词和主角（共 2 处）！',
    tokens: [
      { text: it.cue, isClue: true, clueTip: `${it.cue} 说明动作正在发生，必须用 be + V-ing 双胞胎！` },
      { text: it.subj, isClue: true, clueTip: `${it.subj} 应该搭配 be 动词 ${it.be}！` },
      { text: '___', isBlank: true },
      { text: it.rest },
    ],
    steps: [
      {
        prompt: `凑齐正确的“be + V-ing”双胞胎组合：`,
        ...shuf,
        hints: [`看到 ${it.cue} 用现在进行时。`, `${it.subj} 配 ${it.be}，小心动词变形拼写！`, `选 ${ans}！`],
      },
    ],
    goldenRule: '神探口诀：Look!/Listen!/now 出现，be + V-ing 双胞胎牵手上场！',
    rewardStars: 18,
    cardId: 'card-eng-prog',
  };
}

function genEngPrepOrCan(): DetectiveCase {
  const days = ['Monday morning', 'Friday afternoon', 'Sunday evening', 'June 1st'];
  const day = pick(days);
  const shuf = shuffleWithCorrect(
    'on',
    [
      { text: 'in', fb: `泛指 in the morning 用 in，但加上了具体某天（${day}），必须升级成 on 哦！` },
      { text: 'at', fb: 'at 用于具体几点钟（如 at 8:00），具体哪一天要用 on！' },
    ],
    `稳稳识破！具体某一天及某天早中晚，通通用 on！`
  );
  return {
    id: uid('engpr'),
    subject: 'english',
    skill: 'eng_prep_plural',
    mode: 'eng_clue_fill',
    difficulty: 2,
    textbookRef: '沪教牛津深圳版 4B M3 · 变式卷',
    title: `时间介词暗号：${day}`,
    suspectName: '介词迷糊虫',
    storyIntro: '四年级考试最爱考的时间介词陷阱！把整个时间短语连起来看！',
    readAloudText: `We have a PE class on ${day}.`,
    clueGoalText: '点出表示具体某一天的时间线索！',
    tokens: [
      { text: 'We have a PE class' },
      { text: '___', isBlank: true },
      { text: `${day}.`, isClue: true, clueTip: `${day} 是具体的某一天，时间介词必须用 on！` },
    ],
    steps: [
      {
        prompt: `搭配具体时间 “${day}”，应该填哪个介词？`,
        ...shuf,
        hints: ['不要只看 morning/afternoon，把前面的星期/日期连起来看！', '具体某一天用 on！', '选 on！'],
      },
    ],
    goldenRule: '神探口诀：具体某天（哪怕带早中晚）统统用 on，具体几点用 at！',
    rewardStars: 16,
    cardId: 'card-eng-prep',
  };
}

// ================= 无限变式数学题生成器（北师大版 4上/4下）=================
function genMathRoundTrip(): DetectiveCase {
  const len = pick([200, 250, 300, 350, 400, 500]);
  const trips = pick([2, 3]);
  const oneRound = len * 2;
  const total = oneRound * trips;
  const place = pick(['深圳湾跑道', '学校操场直道', '游泳馆泳道', '公园林荫道']);

  const step1 = shuffleWithCorrect(
    `${oneRound} 米`,
    [
      { text: `${len} 米`, fb: `${len} 米只是单程哦，跑一个“往返”还要跑回来呢！` },
      { text: `${len + 100} 米`, fb: `1 个往返 = 去 ${len} 米 + 回 ${len} 米 = ${len} × 2！` },
    ],
    `太清楚了！1 个往返 = ${len} × 2 = ${oneRound} 米！`
  );
  const step2 = shuffleWithCorrect(
    `${total} 米`,
    [
      { text: `${len * trips} 米`, fb: `哈哈忘了“往返”要乘 2 啦！每个往返是 ${oneRound} 米哦~` },
      { text: `${total - len} 米`, fb: `数数图里一共有 ${trips} 个 ${oneRound} 米，列式 ${oneRound} × ${trips}！` },
    ],
    `完美破案！${oneRound} × ${trips} = ${total} 米，往返陷阱彻底失效！`
  );

  return {
    id: uid('m-rt'),
    subject: 'math',
    skill: 'math_trap_reading',
    mode: 'math_scaffold',
    difficulty: 2,
    textbookRef: '北师大版 4上 · 防粗心变式卷',
    title: `${place}的 ${trips} 个往返`,
    suspectName: '往返迷雾狐',
    storyIntro: `${place}单程长 ${len} 米，小探员坚持运动了 ${trips} 个往返，一共行了多少米？`,
    clueGoalText: '用放大镜点出单程长度和“往返”陷阱词！',
    tokens: [
      { text: `${place}单程长` },
      { text: `${len} 米`, isClue: true, clueTip: `单程 1 趟是 ${len} 米！` },
      { text: '，小探员一共进行了' },
      { text: `${trips} 个往返`, isClue: true, clueTip: '警报！1 个往返 = 去 + 回 = 2 趟！' },
      { text: '，一共行了多少米？' },
    ],
    visual: {
      type: 'bar_model',
      title: `往返拆解图（1 个往返 = ${len} × 2 = ${oneRound} 米）`,
      unit: '米',
      bars: Array.from({ length: trips }, (_, i) => ({
        label: `第${i + 1}往返`,
        segments: [
          { valueLabel: `去 ${len}m`, flex: 1, color: '#60A5FA' },
          { valueLabel: `回 ${len}m`, flex: 1, color: '#34D399' },
        ],
        totalLabel: `${oneRound}m`,
      })),
    },
    steps: [
      {
        prompt: `第一步：先算 1 个往返（一去一回）是多少米？`,
        ...step1,
        hints: [`去 ${len} 米，回 ${len} 米。`, `算式：${len} × 2。`, `答案是 ${oneRound} 米！`],
        visualStage: 1,
      },
      {
        prompt: `第二步：一共 ${trips} 个往返，总路程是多少米？`,
        ...step2,
        hints: [`1 个往返是 ${oneRound} 米。`, `乘以 ${trips} 个往返：${oneRound} × ${trips}。`, `答案是 ${total} 米！`],
        visualStage: 2,
      },
    ],
    goldenRule: '神探口诀：看到“往返 / 来回”先乘 2，再乘往返次数！',
    rewardStars: 18,
    cardId: 'card-math-roundtrip',
  };
}

function genMathRatio(): DetectiveCase {
  const unitVal = pick([12, 15, 18, 20, 25]);
  const mult = pick([3, 4]);
  const isSum = Math.random() > 0.45;

  if (isSum) {
    const total = unitVal * (mult + 1);
    const s1 = shuffleWithCorrect(
      `${mult + 1} 份`,
      [
        { text: `${mult} 份`, fb: `${mult} 份只是漫画书哦，别忘了加上故事书自己的 1 份！` },
        { text: `${mult - 1} 份`, fb: '两种书“合起来一共”，应该用 倍数 + 1 哦！' },
      ],
      `太棒了！1 + ${mult} = ${mult + 1} 份！`
    );
    const s2 = shuffleWithCorrect(
      `${unitVal} 本`,
      [
        { text: `${Math.round(total / mult)} 本`, fb: `不要除以 ${mult} 哦，总份数是 ${mult + 1} 份，列式 ${total} ÷ ${mult + 1}！` },
        { text: `${unitVal + 5} 本`, fb: `用总数 ${total} 除以总份数 ${mult + 1} 算一算~` },
      ],
      `神探威武！${total} ÷ ${mult + 1} = ${unitVal} 本！`
    );
    return {
      id: uid('m-sum'),
      subject: 'math',
      skill: 'math_word_logic',
      mode: 'math_scaffold',
      difficulty: 2,
      textbookRef: '北师大版 4年级 · 和倍变式卷',
      title: `和倍书架（共 ${total} 本）`,
      suspectName: '少算一份怪',
      storyIntro: `书架上漫画书和故事书一共 ${total} 本，漫画书是故事书的 ${mult} 倍，故事书有多少本？`,
      clueGoalText: '点出总数和倍数线索！',
      tokens: [
        { text: '漫画书和故事书' },
        { text: `一共 ${total} 本`, isClue: true, clueTip: `总数 ${total} 本对应“故事书 + 漫画书”的总份数！` },
        { text: '，漫画书是故事书的' },
        { text: `${mult} 倍`, isClue: true, clueTip: `故事书 1 份 + 漫画书 ${mult} 份 = 一共 ${mult + 1} 份！` },
        { text: '，故事书有多少本？' },
      ],
      visual: {
        type: 'bar_model',
        title: `和倍线段图（总计 ${mult + 1} 份 = ${total} 本）`,
        unit: '本',
        bars: [
          { label: '故事书', segments: [{ valueLabel: '1 份', flex: 1, color: '#34D399', highlight: true }], totalLabel: '1 份' },
          {
            label: '漫画书',
            segments: Array.from({ length: mult }, () => ({ valueLabel: '1 份', flex: 1, color: '#60A5FA' })),
            totalLabel: `${mult} 份`,
          },
        ],
      },
      steps: [
        { prompt: `第一步：两种书合起来一共占几份？`, ...s1, hints: ['数数图里绿色和蓝色一共几段。', `1 + ${mult} = ?`, `${mult + 1} 份！`], visualStage: 1 },
        { prompt: `第二步：${mult + 1} 份共 ${total} 本，故事书（1 份）是多少本？`, ...s2, hints: [`把 ${total} 平均分成 ${mult + 1} 份。`, `${total} ÷ ${mult + 1} = ?`, `${unitVal} 本！`], visualStage: 2 },
      ],
      goldenRule: '神探口诀：和倍问题先画图，总份数 = 倍数 + 1！',
      rewardStars: 20,
      cardId: 'card-math-ratio',
    };
  }

  const diff = unitVal * (mult - 1);
  const s1 = shuffleWithCorrect(
    `${mult - 1} 份`,
    [
      { text: `${mult} 份`, fb: `${mult} 份是大数的全部，多出来的差份要减掉 1 份哦！` },
      { text: `${mult + 1} 份`, fb: '这里给的是“多出多少”（差），所以用 倍数 - 1！' },
    ],
    `火眼金睛！${mult} - 1 = ${mult - 1} 份！`
  );
  const s2 = shuffleWithCorrect(
    `${unitVal} 颗`,
    [
      { text: `${Math.round(diff / mult)} 颗`, fb: `别除以 ${mult}，差 ${diff} 对应的是多出来的 ${mult - 1} 份哦！` },
      { text: `${unitVal + 4} 颗`, fb: `算一算 ${diff} ÷ ${mult - 1}！` },
    ],
    `完美解开差倍谜题！${diff} ÷ ${mult - 1} = ${unitVal} 颗！`
  );
  return {
    id: uid('m-diff'),
    subject: 'math',
    skill: 'math_word_logic',
    mode: 'math_scaffold',
    difficulty: 3,
    textbookRef: '北师大版 4年级 · 差倍变式卷',
    title: `糖果罐差倍谜题（多 ${diff} 颗）`,
    suspectName: '错除以倍数怪',
    storyIntro: `大罐糖果比小罐多 ${diff} 颗，大罐糖果数量是小罐的 ${mult} 倍，小罐有多少颗？`,
    clueGoalText: '点出“多出数量”和“倍数”！',
    tokens: [
      { text: '大罐糖果比小罐' },
      { text: `多 ${diff} 颗`, isClue: true, clueTip: `${diff} 颗是大罐比小罐“多出来的份数”！` },
      { text: '，大罐是小罐的' },
      { text: `${mult} 倍`, isClue: true, clueTip: `小罐 1 份，大罐 ${mult} 份，多出 ${mult - 1} 份！` },
      { text: '，小罐有多少颗？' },
    ],
    visual: {
      type: 'bar_model',
      title: `差倍线段图（多出的蓝色 ${mult - 1} 份 = ${diff} 颗）`,
      unit: '颗',
      bars: [
        { label: '小罐', segments: [{ valueLabel: '1 份', flex: 1, color: '#34D399', highlight: true }], totalLabel: '1 份' },
        {
          label: '大罐',
          segments: [
            { valueLabel: '1 份', flex: 1, color: '#A7F3D0' },
            ...Array.from({ length: mult - 1 }, () => ({ valueLabel: '多1份', flex: 1, color: '#60A5FA', highlight: true })),
          ],
          totalLabel: `多${mult - 1}份=${diff}`,
        },
      ],
    },
    steps: [
      { prompt: `第一步：大罐比小罐多出几份？`, ...s1, hints: ['数数图里蓝色的有几段。', `${mult} - 1 = ?`, `${mult - 1} 份！`], visualStage: 1 },
      { prompt: `第二步：多出的 ${mult - 1} 份是 ${diff} 颗，小罐（1 份）是多少颗？`, ...s2, hints: [`算式：${diff} ÷ ${mult - 1}。`, `每份一样多。`, `${unitVal} 颗！`], visualStage: 2 },
    ],
    goldenRule: '神探口诀：差倍问题画线段，1 份 = 差 ÷ (倍数 - 1)！',
    rewardStars: 22,
    cardId: 'card-math-ratio',
  };
}

function genMathDistLaw(): DetectiveCase {
  const a = pick([24, 32, 45, 58, 67, 74, 83]);
  const ans = a * 100;
  const s1 = shuffleWithCorrect(
    `100 个 ${a}`,
    [
      { text: `99 个 ${a}`, fb: `别忘了后面还藏着“+ ${a}”（也就是隐身的 1 个 ${a}）哦！` },
      { text: `98 个 ${a}`, fb: '这里是加号 +，99 个加上 1 个变成 100 个啦！' },
    ],
    `豁然开朗！99 个 + 1 个 = 100 个 ${a}！`
  );
  const s2 = shuffleWithCorrect(
    `${ans}`,
    [
      { text: `${a * 10}`, fb: '乘以 100 需要在末尾添上两个 0 哦~' },
      { text: `${ans - a}`, fb: `已经凑齐整整 100 个 ${a} 啦，直接添两个 0！` },
    ],
    `3 秒秒杀！${a} × 100 = ${ans}！`
  );
  return {
    id: uid('m-dl'),
    subject: 'math',
    skill: 'math_calc_laws',
    mode: 'math_scaffold',
    difficulty: 2,
    textbookRef: '北师大版 4上 第四单元 · 分配律变式卷',
    title: `巧算变式：${a} × 99 + ${a}`,
    suspectName: '隐身1号怪',
    storyIntro: `把单独站着的 + ${a} 变成 ${a} × 1，瞬间凑整百！`,
    clueGoalText: `点出 99 和后面的 + ${a}！`,
    tokens: [
      { text: `巧算：${a} ×` },
      { text: '99', isClue: true, clueTip: '99 离 100 只差 1 个啦！' },
      { text: `+ ${a}`, isClue: true, clueTip: `隐身小伙伴现身：单独的 ${a} 就是 ${a} × 1！` },
      { text: '= ？' },
    ],
    visual: {
      type: 'area_split',
      title: `凑整百积木图：99 个 ${a} + 1 个 ${a}`,
      heightLabel: `${a}`,
      parts: [
        { widthLabel: '99 个', expr: `${a} × 99`, result: `99个${a}`, color: '#818CF8' },
        { widthLabel: '隐身 1 个', expr: `${a} × 1`, result: `1个${a}`, color: '#FBBF24' },
      ],
      combinedExpr: `${a} × (99 + 1) = ${a} × 100`,
    },
    steps: [
      { prompt: `第一步：99 个 ${a} 加 1 个 ${a}，一共是几个 ${a}？`, ...s1, hints: ['把数字当成盒子，99盒+1盒。', '99 + 1 = 100！', `100 个 ${a}！`], visualStage: 1 },
      { prompt: `第二步：${a} × 100 = ？`, ...s2, hints: ['乘 100 在末尾加两个 0。', `${a} 后面添 00。`, `答案是 ${ans}！`], visualStage: 2 },
    ],
    goldenRule: '神探口诀：见到 a×99 + a，马上补“× 1”，秒变 a × 100！',
    rewardStars: 20,
    cardId: 'card-math-dist',
  };
}

function genMathBalanceEq(): DetectiveCase {
  const x = pick([5, 6, 7, 8, 9, 11, 12]);
  const coef = pick([2, 3]);
  const add = pick([4, 5, 6, 8, 9]);
  const right = coef * x + add;
  const afterSub = coef * x;

  const s1 = shuffleWithCorrect(
    `${afterSub}`,
    [
      { text: `${right + add}`, fb: `两边同时拿走 ${add} 要用减法（${right} - ${add}）哦！` },
      { text: `${afterSub - 2}`, fb: `再仔细算一下 ${right} - ${add}！` },
    ],
    `天平稳稳平衡！${right} - ${add} = ${afterSub}！`
  );
  const s2 = shuffleWithCorrect(
    `${x}`,
    [
      { text: `${x + 2}`, fb: `验算一下：${coef} × ${x + 2} + ${add} 超过 ${right} 啦！` },
      { text: `${afterSub - coef}`, fb: `${coef} 个 x 等于 ${afterSub}，求 1 个 x 要用除法 ${afterSub} ÷ ${coef}！` },
    ],
    `完美解方程！x = ${afterSub} ÷ ${coef} = ${x}！`
  );

  return {
    id: uid('m-eq'),
    subject: 'math',
    skill: 'math_eq_geo_dec',
    mode: 'math_scaffold',
    difficulty: 2,
    textbookRef: '北师大版 4下 第五单元 · 方程变式卷',
    title: `魔法天平解方程：${coef}x + ${add} = ${right}`,
    suspectName: '神秘宝箱 x',
    storyIntro: `天平左边有 ${coef} 个神秘宝箱 x 和 ${add} 颗宝石，右边有 ${right} 颗宝石，天平平衡！求 x！`,
    clueGoalText: `点出 ${coef}x 和多余的 + ${add}！`,
    tokens: [
      { text: '解方程：' },
      { text: `${coef}x`, isClue: true, clueTip: `${coef} 个一模一样的神秘宝箱 x！` },
      { text: `+ ${add}`, isClue: true, clueTip: `第一步让天平两边同时拿走 ${add}！` },
      { text: `= ${right}，求 x = ？` },
    ],
    visual: {
      type: 'balance_scale',
      title: `魔法方程天平：${coef}x + ${add} = ${right}`,
      leftItems: [...Array.from({ length: coef }, () => '📦 x'), `+ ${add}`],
      rightValue: right,
      subtractEachSide: add,
      divideBy: coef,
      unknownLabel: 'x',
    },
    steps: [
      { prompt: `第一步：天平两边同时拿走 ${add}，右边剩下多少？`, ...s1, hints: [`算式：${right} - ${add}。`, '两边同减保持平衡。', `答案是 ${afterSub}！`], visualStage: 1 },
      { prompt: `第二步：${coef}x = ${afterSub}，那么 1 个 x 等于多少？`, ...s2, hints: [`把 ${afterSub} 平均分成 ${coef} 份。`, `${afterSub} ÷ ${coef} = ?`, `x = ${x}！`], visualStage: 2 },
    ],
    goldenRule: '神探口诀：方程天平两边同加同减、同乘同除，永远保持平衡！',
    rewardStars: 20,
    cardId: 'card-math-eq',
  };
}

export function generateProceduralCase(skill: SkillCategory): DetectiveCase {
  switch (skill) {
    case 'eng_third_person':
      return genEngThirdPerson();
    case 'eng_be_have_there':
      return genEngThereBe();
    case 'eng_present_prog':
      return genEngPresentProg();
    case 'eng_prep_plural':
      return genEngPrepOrCan();
    case 'math_trap_reading':
      return genMathRoundTrip();
    case 'math_word_logic':
      return genMathRatio();
    case 'math_calc_laws':
      return genMathDistLaw();
    case 'math_eq_geo_dec':
      return genMathBalanceEq();
  }
}

export function generateVariantPaperCases(skills: SkillCategory[], count: number): DetectiveCase[] {
  const list: DetectiveCase[] = [];
  for (let i = 0; i < count; i++) {
    const sk = skills[i % skills.length];
    list.push(generateProceduralCase(sk));
  }
  return list;
}

export function generateBossQuestions(skills: SkillCategory[], hp: number): DetectiveCase[] {
  return generateVariantPaperCases(skills, hp + 2);
}

export function getSubjectOfSkill(skill: SkillCategory): Subject {
  return skill.startsWith('eng_') ? 'english' : 'math';
}
