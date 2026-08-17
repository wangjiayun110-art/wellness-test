/**
 * 问卷脚本：管理测试流程 + 计算 + 保存结果
 */
(function () {
  'use strict';

  const { QUESTIONS, OPTIONS, computeScores, findDominant } = window.WellnessData;
  const { Storage } = window.WellnessApp;

  // 进度键名（关闭标签页会丢失 - 这是预期，避免隐私问题）
  const KEY_PROGRESS = 'wellness-progress-v1';
  // 结果键名（保留 30 天）
  const KEY_RESULT = 'wellness-result-v1';
  const RESULT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

  const stage = document.getElementById('stage');

  /* ---------- 入口 ---------- */
  function init() {
    if (!stage) return;

    // 优先恢复已有结果，直接提示"已有结果"；否则恢复进度；否则显示介绍
    const result = Storage.get(KEY_RESULT);
    if (result && Date.now() - result.savedAt < RESULT_TTL_MS) {
      renderResultPrompt(result);
      return;
    }

    const progress = Storage.get(KEY_PROGRESS);
    if (progress && progress.answers && progress.currentIndex >= 0) {
      renderQuiz(progress);
    } else {
      renderIntro();
    }
  }

  /* ---------- 介绍页 ---------- */
  function renderIntro() {
    stage.innerHTML = `
      <div class="quiz-page">
        <div class="quiz-intro">
          <div style="font-size:3.5rem;margin-bottom:1rem;">🌿</div>
          <h2>中医九大体质自评量表</h2>
          <p>依据中华中医药学会《中医体质分类与判定》(ZYYXH/T 157-2009) 标准，共 27 项自评问题，约 3 分钟完成。</p>
          <p>本量表通过自评方式评估你的中医体质倾向（包括平和质与 8 种偏颇体质），并提供特征解读与日常调养参考。</p>
          <div style="background:var(--color-bg-alt);border-radius:12px;padding:1rem 1.25rem;margin:1.5rem 0;text-align:left;font-size:.875rem;color:var(--color-text-soft);">
            <strong style="color:var(--color-text);">填写说明</strong>
            <ul style="margin-top:.5rem;padding-left:1.25rem;">
              <li>请根据<strong>近 1 年</strong>的身体感受作答</li>
              <li>每题选「是 / 有时 / 不是」三档之一</li>
              <li>无对错之分，请按真实感受填写</li>
            </ul>
          </div>
          <button class="btn btn-primary btn-lg" id="startBtn" style="margin-top:1rem;">
            开始体质评估 →
          </button>
          <p style="margin-top:2rem;font-size:.8125rem;color:var(--color-text-mute);">
            ⚠️ 本量表结果仅供健康自评参考，不作为医疗诊断依据。如有健康问题请咨询专业中医师。
          </p>
        </div>
      </div>
    `;
    document.getElementById('startBtn').addEventListener('click', () => {
      const fresh = { currentIndex: 0, answers: {} };
      Storage.set(KEY_PROGRESS, fresh);
      renderQuiz(fresh);
    });
  }

  /* ---------- 已有结果的提示页 ---------- */
  function renderResultPrompt(result) {
    const type = window.WellnessData.TYPES[result.typeId];
    const date = new Date(result.savedAt).toLocaleDateString('zh-CN');
    stage.innerHTML = `
      <div class="quiz-page">
        <div class="quiz-intro">
          <div style="font-size:3.5rem;margin-bottom:1rem;">${type.emoji}</div>
          <h2>上次测试结果</h2>
          <p>${date} 测试：你属于 <strong style="color:${type.color}">${type.name}</strong></p>
          <div style="display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center;margin-top:2rem;">
            <a href="result.html" class="btn btn-primary">查看完整结果</a>
            <button class="btn btn-ghost" id="restartBtn">重新测试</button>
          </div>
        </div>
      </div>
    `;
    document.getElementById('restartBtn').addEventListener('click', () => {
      Storage.remove(KEY_PROGRESS);
      Storage.remove(KEY_RESULT);
      renderIntro();
    });
  }

  /* ---------- 渲染单题 ---------- */
  function renderQuiz(progress) {
    const { currentIndex } = progress;
    if (currentIndex >= QUESTIONS.length) {
      finishQuiz(progress);
      return;
    }
    const q = QUESTIONS[currentIndex];
    const total = QUESTIONS.length;
    const pct = ((currentIndex + 1) / total) * 100;
    const selectedIdx = progress.answers[q.id];

    stage.innerHTML = `
      <div class="quiz-page">
        <div class="quiz-progress">
          <div class="progress-meta">
            <span>第 <strong>${currentIndex + 1}</strong> / ${total} 题</span>
            <span>${Math.round(pct)}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="question-card" id="qcard">
          <div class="question-meta">
            <span class="tag">${getTypeName(q.type)}</span>
            <span>选一项继续</span>
          </div>
          <p class="question-text">${q.text}</p>
          <div class="options" id="opts"></div>
        </div>

        <div class="quiz-nav">
          <button class="btn btn-ghost" id="prevBtn" ${currentIndex === 0 ? 'disabled' : ''}>
            ← 上一题
          </button>
          <button class="btn btn-primary" id="nextBtn" ${selectedIdx === undefined ? 'disabled' : ''}>
            ${currentIndex === total - 1 ? '查看结果' : '下一题'} →
          </button>
        </div>
      </div>
    `;

    const optsWrap = document.getElementById('opts');
    OPTIONS.forEach((opt, idx) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'option' + (selectedIdx === idx ? ' is-selected' : '');
      el.setAttribute('data-idx', idx);
      el.innerHTML = `
        <span class="option-radio" aria-hidden="true"></span>
        <span>${opt.label}</span>
      `;
      el.addEventListener('click', () => {
        progress.answers[q.id] = idx;
        Storage.set(KEY_PROGRESS, progress);
        // 重渲染选中态
        optsWrap.querySelectorAll('.option').forEach((o) => o.classList.remove('is-selected'));
        el.classList.add('is-selected');
        document.getElementById('nextBtn').disabled = false;
        // 用户答题后 350ms 自动跳下一题，给视觉反馈
        window.setTimeout(() => {
          if (currentIndex < QUESTIONS.length - 1) {
            goNext(progress);
          } else {
            finishQuiz(progress);
          }
        }, 350);
      });
      optsWrap.appendChild(el);
    });

    document.getElementById('prevBtn').addEventListener('click', () => goPrev(progress));
    document.getElementById('nextBtn').addEventListener('click', () => {
      if (currentIndex < QUESTIONS.length - 1) goNext(progress);
      else finishQuiz(progress);
    });
  }

  function goNext(progress) {
    progress.currentIndex += 1;
    Storage.set(KEY_PROGRESS, progress);
    renderQuiz(progress);
  }
  function goPrev(progress) {
    if (progress.currentIndex === 0) return;
    progress.currentIndex -= 1;
    Storage.set(KEY_PROGRESS, progress);
    renderQuiz(progress);
  }

  /* ---------- 完成测试 ---------- */
  function finishQuiz(progress) {
    const scores = computeScores(progress.answers);
    const dom = findDominant(scores);
    const result = {
      typeId: dom.typeId,
      score: dom.score,
      scores: dom.scores,
      savedAt: Date.now(),
    };
    Storage.set(KEY_RESULT, result);
    Storage.remove(KEY_PROGRESS);
    window.location.href = 'result.html';
  }

  /* ---------- 工具：体质名 ---------- */
  function getTypeName(id) {
    const t = window.WellnessData.TYPES[id];
    return t ? t.name : id;
  }

  /* ---------- 启动 ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();