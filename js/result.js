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

    // 主要产品关键词取前 3 个
    const topProducts = t.products.slice(0, 3);

    stage.innerHTML = `
      <div class="result-wrap">
        <!-- 头部 -->
        <section class="result-hero" role="region" aria-label="测试结果概览">
          <div class="result-emoji" aria-hidden="true">${t.emoji}</div>
          <div class="result-type" style="color:${t.color}">${t.name}</div>
          <div class="result-tagline">${t.tagline} · 转化分数 ${result.score.toFixed(2)}</div>
          <p style="max-width:520px;margin:0 auto 1.5rem;color:var(--color-text-soft);">
            ${t.summary}
          </p>
          <div class="result-score">
            <span>判定来源</span>
            <strong>${totalAnswered(result.scores)} 道相关题目</strong>
          </div>
        </section>

        <!-- 特征 -->
        <section class="section-card">
          <h3><span class="num">1</span>典型特征</h3>
          <ul class="feature-list">
            ${t.features.map((f) => `<li>${f}</li>`).join('')}
          </ul>
        </section>

        <!-- 调养建议 -->
        <section class="section-card">
          <h3><span class="num">2</span>日常调养建议</h3>
          <ul class="advice-list">
            ${t.advice.map((a, i) =>
              `<li data-num="${i + 1}"><span>${a}</span></li>`
            ).join('')}
          </ul>
        </section>

        <!-- 得分分布 -->
        <section class="section-card">
          <h3><span class="num">3</span>九大体质得分</h3>
          <p style="color:var(--color-text-soft);font-size:.9375rem;margin-bottom:1rem;">
            分数越高表示在该体质上的倾向越明显。
          </p>
          <div class="score-bars" id="scoreBars"></div>
        </section>

        <!-- 带货模块 - 核心 -->
        <section class="section-card" style="background:linear-gradient(135deg,rgba(231,111,81,.05),rgba(42,157,143,.05));border-color:${t.color}20;">
          <h3><span class="num" style="background:${t.color}">4</span>匹配的养生品类</h3>
          <p style="color:var(--color-text-soft);font-size:.9375rem;margin-bottom:1rem;">
            ${t.name}人群常关注以下食材/品类，你可以按需选购。
          </p>
          <div class="products-grid" id="productsGrid"></div>

          <div style="margin-top:1.5rem;">
            <div style="font-weight:600;margin-bottom:.75rem;color:var(--color-text-soft);font-size:.875rem;">
              选购渠道（自动跳到对应平台搜索页）
            </div>
            <div class="platform-list" id="platformList"></div>
          </div>

          <p style="margin-top:1.5rem;font-size:.8125rem;color:var(--color-text-mute);">
            ⚠️ 提示：保健食品不是药品，不能代替药物治疗。本页跳转仅为推荐渠道，请按需选购。
          </p>
        </section>

        <!-- 操作 -->
        <div class="action-row">
          <a href="guide.html#${t.id}" class="btn btn-ghost">查看百科解读</a>
          <button class="btn btn-ghost" id="shareBtn">📋 复制结果链接</button>
          <button class="btn btn-ghost" id="retestBtn">🔁 重新测试</button>
          <a href="index.html" class="btn btn-primary">回到首页</a>
        </div>
      </div>
    `;

    // 得分柱状图
    renderScoreBars(result.scores, t.id);

    // 带货卡片
    renderProducts(topProducts);

    // 多平台跳转（每个产品都生成跳转链接 + 总入口）
    renderPlatforms(topProducts);

    // 事件
    document.getElementById('retestBtn').addEventListener('click', () => {
      if (!confirm('确定要清空结果并重新测试吗？')) return;
      Storage.remove(KEY_RESULT);
      window.location.href = 'quiz.html';
    });
    document.getElementById('shareBtn').addEventListener('click', () => {
      const txt = `我在「体质自测」测出来是「${t.name}」(${t.tagline})，你也来测测？${location.origin}${location.pathname.replace('result.html','quiz.html')}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(
          () => alert('结果链接已复制到剪贴板'),
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