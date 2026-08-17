/**
 * =============================================================
 * 体质自测 · 数据层
 * - 中医九大体质（参考《中医体质分类与判定》标准）
 * - 31 道自评题（每题 0 / 0.5 / 1 分）
 * - 每个体质对应的养生品类（中性、不带具体品牌）
 *
 * 注意：本数据集仅供健康参考，不作为医疗诊断依据。
 * =============================================================
 */

(function (global) {
  'use strict';

  /* ---------- 九大体质元数据 ---------- */
  const TYPES = {
    pinghe: {
      id: 'pinghe',
      name: '平和质',
      tagline: '理想体质',
      emoji: '🌿',
      color: '#10b981',
      gradient: ['#10b981', '#34d399'],
      summary: '阴阳气血协调，体形匀称、面色润泽、精力充沛，是较为健康的体质状态。',
      features: [
        '面色、肤色润泽，头发稠密有光泽',
        '目光有神，唇色红润',
        '不易疲劳，精力充沛',
        '睡眠良好，胃口正常',
        '大小便规律',
      ],
      advice: [
        '保持规律作息，避免过度劳累',
        '饮食均衡，不偏食',
        '适当运动，保持良好状态',
      ],
      // 注意：以下为中性品类，不指向任何具体品牌
      products: ['山药', '莲子', '红枣', '小米', '燕麦'],
    },

    qixu: {
      id: 'qixu',
      name: '气虚质',
      tagline: '容易疲劳',
      emoji: '🍃',
      color: '#0891b2',
      gradient: ['#0891b2', '#22d3ee'],
      summary: '元气不足，以疲乏、气短、自汗为主要特征。',
      features: [
        '容易疲乏，活动量稍大就累',
        '说话声音低弱',
        '容易感冒，抵抗力偏弱',
        '容易出虚汗（不活动也出汗）',
        '舌淡红、边有齿痕',
      ],
      advice: [
        '避免过度劳累与剧烈运动',
        '注意保暖，防止受寒',
        '宜补气养气，少食耗气食物',
        '规律作息，充足睡眠',
      ],
      products: ['黄芪', '党参', '西洋参', '蜂蜜', '燕麦', '山药'],
    },

    yangxu: {
      id: 'yangxu',
      name: '阳虚质',
      tagline: '怕冷、手脚凉',
      emoji: '❄️',
      color: '#3b82f6',
      gradient: ['#3b82f6', '#6366f1'],
      summary: '阳气不足，以畏寒怕冷、手足不温为主要特征。',
      features: [
        '手脚发凉，怕冷',
        '穿得比别人多',
        '吃凉东西会不舒服',
        '小便清长，夜尿多',
        '大便偏稀',
      ],
      advice: [
        '注意保暖，特别是腰腹与下肢',
        '少吃生冷、冰镇食物',
        '适当晒太阳与温补',
      ],
      products: ['生姜', '桂圆', '肉桂', '核桃', '羊肉', '艾灸贴'],
    },

    yinxu: {
      id: 'yinxu',
      name: '阴虚质',
      tagline: '怕热、口干',
      emoji: '☀️',
      color: '#f59e0b',
      gradient: ['#f59e0b', '#fbbf24'],
      summary: '阴液亏少，以口燥咽干、手足心热为主要特征。',
      features: [
        '手脚心发热，午后明显',
        '口干咽燥，总想喝水',
        '皮肤偏干、易起皮',
        '睡眠浅，夜间盗汗',
        '大便偏干',
      ],
      advice: [
        '避免高温与暴晒',
        '少吃辛辣、煎炸食物',
        '保证充足睡眠',
      ],
      products: ['麦冬', '玉竹', '银耳', '百合', '鸭肉', '石斛'],
    },

    tanoshi: {
      id: 'tanoshi',
      name: '痰湿质',
      tagline: '体形偏胖',
      emoji: '🌾',
      color: '#a16207',
      gradient: ['#a16207', '#ca8a04'],
      summary: '痰湿凝聚，以体形肥胖、腹部松软、口黏为主要特征。',
      features: [
        '体形偏胖，腹部松软',
        '面部皮肤油脂较多',
        '痰多，咽部常有痰感',
        '嘴里发黏，舌苔厚腻',
        '容易困倦',
      ],
      advice: [
        '控制饮食，少吃油腻甜食',
        '坚持有氧运动',
        '饮食清淡，规律作息',
      ],
      products: ['薏米', '赤小豆', '冬瓜', '荷叶', '山药', '陈皮'],
    },

    shire: {
      id: 'shire',
      name: '湿热质',
      tagline: '面油有痘',
      emoji: '🔥',
      color: '#dc2626',
      gradient: ['#dc2626', '#f87171'],
      summary: '湿热内蕴，以面油有痤疮、口苦口干为主要特征。',
      features: [
        '面部油光发亮，易生痤疮',
        '口苦或口中有异味',
        '舌苔黄腻',
        '小便偏黄',
        '容易烦躁、着急',
      ],
      advice: [
        '清淡饮食，少吃辛辣油腻',
        '戒烟限酒',
        '避免潮湿闷热环境',
      ],
      products: ['菊花', '苦瓜', '绿豆', '决明子', '蒲公英', '薏米'],
    },

    xueyu: {
      id: 'xueyu',
      name: '血瘀质',
      tagline: '面色晦暗',
      emoji: '🍷',
      color: '#9333ea',
      gradient: ['#9333ea', '#a855a7'],
      summary: '血行不畅，以面色晦暗、易瘀斑为主要特征。',
      features: [
        '面色晦暗、易有色斑',
        '皮肤偏暗或色素沉着',
        '嘴唇颜色偏暗',
        '容易出现瘀斑',
        '身体某处固定刺痛',
      ],
      advice: [
        '保持心情舒畅',
        '适量运动促进循环',
        '注意保暖',
      ],
      products: ['玫瑰花', '山楂', '丹参', '藏红花', '红枣'],
    },

    qiyu: {
      id: 'qiyu',
      name: '气郁质',
      tagline: '情绪敏感',
      emoji: '🌸',
      color: '#ec4899',
      gradient: ['#ec4899', '#f472b6'],
      summary: '气机郁滞，以情绪低落、敏感多虑为主要特征。',
      features: [
        '情绪低落、敏感多虑',
        '胸闷叹气',
        '咽部异物感（梅核气）',
        '睡眠差、容易失眠',
        '乳房胀痛（女性）',
      ],
      advice: [
        '保持心情舒畅，多与家人朋友交流',
        '增加户外活动与社交',
        '适当听舒缓音乐、阅读',
      ],
      products: ['陈皮', '佛手', '玫瑰花', '柠檬', '香橼'],
    },

    teying: {
      id: 'teying',
      name: '特禀质',
      tagline: '容易过敏',
      emoji: '🌼',
      color: '#65a30d',
      gradient: ['#65a30d', '#84cc16'],
      summary: '先天失常，以过敏反应为主要表现。',
      features: [
        '容易过敏（药物、食物、气味）',
        '容易起疹、荨麻疹',
        '鼻塞、流涕、喷嚏',
        '皮肤容易抓痕',
        '对气候适应能力差',
      ],
      advice: [
        '远离已知过敏原',
        '保持室内清洁',
        '饮食清淡，避免致敏食物',
      ],
      products: ['灵芝', '蜂胶', '益生菌', '燕窝', '维生素C'],
    },
  };

  /* ---------- 题库 ---------- */
  // 共 31 题，每题可归属于一个或多个体质
  // 每个体质 3-4 题，平和质作为对照基线
  const QUESTIONS = [
    // 平和质（4 道，对照基线）
    { id: 'q1', type: 'pinghe', text: '您精力充沛，不易感到疲劳吗？' },
    { id: 'q2', type: 'pinghe', text: '您睡眠质量好，能很快入睡吗？' },
    { id: 'q3', type: 'pinghe', text: '您胃口正常，饮食规律吗？' },
    { id: 'q4', type: 'pinghe', text: '您面色红润、肤色润泽吗？' },

    // 气虚质（4 道）
    { id: 'q5', type: 'qixu', text: '您容易疲乏，活动稍大就累吗？' },
    { id: 'q6', type: 'qixu', text: '您说话声音低弱无力吗？' },
    { id: 'q7', type: 'qixu', text: '您容易感冒，抵抗力偏弱吗？' },
    { id: 'q8', type: 'qixu', text: '您容易出虚汗（不活动也出汗）吗？' },

    // 阳虚质（4 道）
    { id: 'q9', type: 'yangxu', text: '您手脚发凉，比别人更怕冷吗？' },
    { id: 'q10', type: 'yangxu', text: '您吃凉东西会感到不舒服吗？' },
    { id: 'q11', type: 'yangxu', text: '您小便清长、夜尿偏多吗？' },
    { id: 'q12', type: 'yangxu', text: '您比别人穿得更多，仍感觉冷吗？' },

    // 阴虚质（3 道）
    { id: 'q13', type: 'yinxu', text: '您手脚心发热，午后明显吗？' },
    { id: 'q14', type: 'yinxu', text: '您口干咽燥、总想喝水吗？' },
    { id: 'q15', type: 'yinxu', text: '您睡眠浅、易盗汗吗？' },

    // 痰湿质（4 道）
    { id: 'q16', type: 'tanoshi', text: '您体形偏胖、腹部松软吗？' },
    { id: 'q17', type: 'tanoshi', text: '您面部油脂较多、痰多吗？' },
    { id: 'q18', type: 'tanoshi', text: '您嘴里发黏、舌苔厚腻吗？' },
    { id: 'q19', type: 'tanoshi', text: '您容易困倦、饭后尤甚吗？' },

    // 湿热质（3 道）
    { id: 'q20', type: 'shire', text: '您面部油光发亮、易生痤疮吗？' },
    { id: 'q21', type: 'shire', text: '您口苦或口中有异味吗？' },
    { id: 'q22', type: 'shire', text: '您小便偏黄、容易烦躁吗？' },

    // 血瘀质（3 道）
    { id: 'q23', type: 'xueyu', text: '您面色晦暗、容易出现色斑吗？' },
    { id: 'q24', type: 'xueyu', text: '您嘴唇颜色偏暗或紫吗？' },
    { id: 'q25', type: 'xueyu', text: '您皮肤容易出现瘀斑吗？' },

    // 气郁质（3 道）
    { id: 'q26', type: 'qiyu', text: '您情绪低落、敏感多虑吗？' },
    { id: 'q27', type: 'qiyu', text: '您胸闷叹气、咽部有异物感吗？' },
    { id: 'q28', type: 'qiyu', text: '您容易失眠、多梦吗？' },

    // 特禀质（3 道）
    { id: 'q29', type: 'teying', text: '您容易过敏（药物/食物/气味）吗？' },
    { id: 'q30', type: 'teying', text: '您容易起疹、荨麻疹吗？' },
    { id: 'q31', type: 'teying', text: '您鼻塞、流涕、喷嚏频繁吗？' },
  ];

  /* ---------- 选项得分映射 ---------- */
  // 同一道题所有体质适用同一套选项
  const OPTIONS = [
    { label: '是', score: 1 },
    { label: '有时', score: 0.5 },
    { label: '不是', score: 0 },
  ];

  /* ---------- 评分算法 ---------- */
  // 计算每个体质的得分（归一化到 0-1），返回 {typeId: score}
  function computeScores(answers) {
    // answers: { q1: 1, q2: 0.5, ... } 或 { q1: optionIndex }
    const total = {};
    const counts = {};
    QUESTIONS.forEach((q) => {
      const raw = answers[q.id];
      if (raw === undefined) return;
      const opt = typeof raw === 'number' && OPTIONS[raw] !== undefined
        ? OPTIONS[raw]
        : OPTIONS.find((o) => o.score === raw) || null;
      if (!opt) return;
      total[q.type] = (total[q.type] || 0) + opt.score;
      counts[q.type] = (counts[q.type] || 0) + 1;
    });

    const result = {};
    Object.keys(TYPES).forEach((tid) => {
      if (!counts[tid]) {
        result[tid] = 0;
      } else {
        result[tid] = +(total[tid] / counts[tid]).toFixed(3);
      }
    });
    return result;
  }

  // 找出最高分的体质
  function findDominant(scores) {
    let bestId = 'pinghe';
    let bestScore = -1;
    Object.entries(scores).forEach(([tid, score]) => {
      if (score > bestScore) {
        bestScore = score;
        bestId = tid;
      }
    });
    return { typeId: bestId, score: bestScore, scores };
  }

  /* ---------- 跳转电商搜索链接 ---------- */
  // 给出关键词生成三个平台的搜索 URL（用户在结果页选平台跳转）
  function buildPurchaseLinks(keyword) {
    const enc = encodeURIComponent(keyword);
    return [
      {
        name: '京东',
        icon: '🛒',
        url: `https://search.jd.com/Search?keyword=${enc}`,
        desc: '京东自营为主，物流快',
      },
      {
        name: '淘宝',
        icon: '🛍️',
        url: `https://s.taobao.com/search?q=${enc}`,
        desc: '淘宝全网商家',
      },
      {
        name: '拼多多',
        icon: '🟢',
        url: `https://mobile.yangkeduo.com/search_result.html?search_key=${enc}`,
        desc: '性价比之选',
      },
    ];
  }

  /* ---------- 暴露到全局 ---------- */
  global.WellnessData = {
    TYPES,
    QUESTIONS,
    OPTIONS,
    computeScores,
    findDominant,
    buildPurchaseLinks,
  };
})(window);