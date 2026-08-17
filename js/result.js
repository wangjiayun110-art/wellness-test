/**
 * 结果页脚本：根据体质展示结果 + 带货模块
 */
(function () {
  'use strict';

  const { TYPES, buildPurchaseLinks } = window.WellnessData;
  const { Storage } = window.WellnessApp;

  const KEY_RESULT = 'wellness-result-v1';

  const stage = document.getElementById('resultStage');

  function init() {
    if (!stage) return;
    const result = Storage.get(KEY_RESULT);
    if (!result) {
      renderNoResult();
      return;
    }
    renderResult(result);
  }

  function renderNoResult() {
    stage.innerHTML = `
      <div class="result-wrap">
        <div class="section-card" style="text-align:center;padding:3rem 1.5rem;">
          <div style="font-size:3.5rem;margin-bottom:1rem;">🤔</div>
          <h2 style="margin-bottom:1rem;">还没有测试结果</h2>
          <p style="color:var(--color-text-soft);margin-bottom:2rem;">
            完成测试后会自动跳转到结果页。
          </p>
          <a href="quiz.html" class="btn btn-primary">开始测试 →</a>
        </div>
      </div>
    `;
  }

  function renderResult(result) {
    const t = TYPES[result.typeId];
    if (!t) return renderNoResult();

    // 头部颜色根据体质调整
    document.documentElement.style.setProperty('--hero-bg',
      `linear-gradient(135deg, ${hexToRgba(t.color, .15)}, ${hexToRgba(t.color, .05)})`);

    stage.innerHTML = `
      <div class="result-wrap">
        <!-- 头部 -->
        <section class="result-hero" role="region" aria-label="体质评估结果">
          <div class="result-emoji" aria-hidden="true">${t.emoji}</div>
          <div class="result-type" style="color:${t.color}">${t.name}</div>
          <div class="result-tagline">${t.tagline} · 转化分数 ${result.score.toFixed(2)}</div>
          <p style="max-width:520px;margin:0 auto 1.5rem;color:var(--color-text-soft);">
            ${t.summary}
          </p>
          <div class="result-score">
            <span>评估依据</span>
            <strong>《中医体质分类与判定》ZYYXH/T 157-2009</strong>
          </div>
        </section>

        <!-- 免责提示 -->
        <div class="result-disclaimer">
          ⚠️ 本结果仅供健康自评参考，不作为医疗诊断依据。如有健康问题请咨询专业中医师。
        </div>

        <!-- 1. 典型特征 -->
        <section class="section-card">
          <h3><span class="num">1</span>典型特征</h3>
          <ul class="feature-list">
            ${t.features.map((f) => `<li>${f}</li>`).join('')}
          </ul>
        </section>

        <!-- 2. 形成原因 -->
        ${t.causes && t.causes.length ? `
        <section class="section-card">
          <h3><span class="num">2</span>形成原因</h3>
          <p class="section-intro">该体质的形成通常与下列因素有关：</p>
          <ul class="feature-list">
            ${t.causes.map((c) => `<li>${c}</li>`).join('')}
          </ul>
        </section>
        ` : ''}

        <!-- 3. 发病倾向 -->
        ${t.tendencies && t.tendencies.length ? `
        <section class="section-card">
          <h3><span class="num">3</span>发病倾向</h3>
          <p class="section-intro">该体质人群需注意以下健康倾向：</p>
          <ul class="feature-list">
            ${t.tendencies.map((d) => `<li>${d}</li>`).join('')}
          </ul>
        </section>
        ` : ''}

        <!-- 4. 调养原则 -->
        <section class="section-card">
          <h3><span class="num">4</span>调养原则</h3>

          <div class="advice-block">
            <div class="advice-title">🏠 生活起居</div>
            <p class="advice-text">${t.lifestyle}</p>
          </div>

          <div class="advice-block">
            <div class="advice-title">🏃 运动锻炼</div>
            <p class="advice-text">${t.exercise}</p>
          </div>

          <div class="advice-block">
            <div class="advice-title">💭 情志调摄</div>
            <p class="advice-text">${t.emotion}</p>
          </div>
        </section>

        <!-- 5. 饮食方向 -->
        <section class="section-card">
          <h3><span class="num">5</span>饮食方向</h3>

          <div class="advice-block">
            <div class="advice-title">✅ 推荐食材</div>
            <div class="food-tags">
              ${(t.foodRecommend && t.foodRecommend.length
                ? t.foodRecommend
                : ['日常均衡饮食即可']
              ).map((f) => `<span class="food-tag food-tag-good">${f}</span>`).join('')}
            </div>
          </div>

          ${t.foodAvoid && t.foodAvoid.length ? `
          <div class="advice-block">
            <div class="advice-title">⚠️ 少食 / 忌食</div>
            <div class="food-tags">
              ${t.foodAvoid.map((f) => `<span class="food-tag food-tag-avoid">${f}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          <p style="margin-top:1rem;font-size:.8125rem;color:var(--color-text-mute);">
            以上为日常饮食方向参考，具体调理建议咨询专业中医师或营养师。
          </p>
        </section>

        <!-- 6. 九大体质得分 -->
        <section class="section-card">
          <h3><span class="num">6</span>九大体质得分分布</h3>
          <p class="section-intro">分数越高表示在该体质上的倾向越明显。本表为各体质转化分数对比。</p>
          <div class="score-bars" id="scoreBars"></div>
        </section>

        <!-- 操作 -->
        <div class="action-row">
          <a href="guide.html#${t.id}" class="btn btn-ghost">查看百科详解</a>
          <button class="btn btn-ghost" id="shareBtn">📋 复制分享</button>
          <button class="btn btn-ghost" id="retestBtn">🔁 重新评估</button>
          <a href="index.html" class="btn btn-primary">回到首页</a>
        </div>
      </div>
    `;

    // 得分柱状图
    renderScoreBars(result.scores, t.id);

    // 事件
    document.getElementById('retestBtn').addEventListener('click', () => {
      if (!confirm('确定要清空结果并重新评估吗？')) return;
      Storage.remove(KEY_RESULT);
      window.location.href = 'quiz.html';
    });
    document.getElementById('shareBtn').addEventListener('click', () => {
      const txt = `我在「中医体质自评」测出来是「${t.name}」(${t.tagline})，依据《中医体质分类与判定》标准。你也来测测？${location.origin}${location.pathname.replace('result.html','quiz.html')}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(
          () => alert('分享语已复制到剪贴板'),
          () => prompt('复制失败，请手动复制：', txt)
        );
      } else {
        prompt('复制分享语：', txt);
      }
    });
  }

  function renderScoreBars(scores, highlightId) {
    const wrap = document.getElementById('scoreBars');
    if (!wrap) return;
    const order = ['pinghe','qixu','yangxu','yinxu','tanoshi','shire','xueyu','qiyu','teying'];
    const max = Math.max(...Object.values(scores), 0.01);
    wrap.innerHTML = order.map((id) => {
      const t = TYPES[id];
      const s = scores[id] || 0;
      const pct = (s / max) * 100;
      const isYou = id === highlightId;
      return `
        <div class="score-row" style="${isYou ? 'font-weight:700;' : ''}">
          <span style="color:${isYou ? t.color : 'var(--color-text-soft)'}">
            ${t.emoji} ${t.name}
          </span>
          <span class="bar">
            <span class="fill" style="width:${pct}%;background:${t.color};"></span>
          </span>
          <span class="val" style="color:${isYou ? t.color : 'inherit'}">
            ${(s * 100).toFixed(0)}
          </span>
        </div>
      `;
    }).join('');
    // 简单动画延后
    requestAnimationFrame(() => {
      wrap.querySelectorAll('.fill').forEach((f) => {
        f.style.width = f.style.width; // 触发重绘
      });
    });
  }

  function renderProducts(items) {
    const wrap = document.getElementById('productsGrid');
    if (!wrap) return;
    wrap.innerHTML = items.map((p) => `
      <div class="product-chip">${p}</div>
    `).join('');
  }

  function renderPlatforms(items) {
    const wrap = document.getElementById('platformList');
    if (!wrap) return;
    // 收集所有产品的链接
    let combined = [];
    items.forEach((p) => {
      combined = combined.concat(buildPurchaseLinks(p));
    });

    // 渲染：每行点击跳转（按产品维度展开）
    const productsHtml = items.map((p) => {
      const links = buildPurchaseLinks(p);
      return `
        <div style="margin-bottom:1rem;">
          <div style="font-weight:600;margin-bottom:.5rem;color:var(--color-text);font-size:.9375rem;">
            「${p}」搜索直达
          </div>
          <div style="display:flex;flex-direction:column;gap:.5rem;">
            ${links.map((l) => `
              <a class="platform-btn" href="${l.url}" target="_blank" rel="noopener noreferrer">
                <span class="platform-icon" aria-hidden="true">${l.icon}</span>
                <span class="platform-info">
                  <span class="platform-name">${p} · ${l.name}</span>
                  <span class="platform-desc">${l.desc}</span>
                </span>
                <span class="platform-arrow">→</span>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    wrap.innerHTML = productsHtml;
  }

  function totalAnswered(scores) {
    return Object.values(scores).filter((s) => s > 0).length * 4; // 估算
  }

  // 把 hex 转 rgba
  function hexToRgba(hex, alpha) {
    const v = hex.replace('#', '');
    const r = parseInt(v.substr(0, 2), 16);
    const g = parseInt(v.substr(2, 2), 16);
    const b = parseInt(v.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();