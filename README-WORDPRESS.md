# WordPress tizhi-shop 集成说明

将本项目文件复制到 `/wp-content/plugins/tizhi-shop/assets/wellness-test/`，并通过插件页面或 shortcode 加载 `index.html`、`quiz.html`、`result.html` 与 `guide.html`。页面脚本使用相对资源路径，站内跳转由 `js/wordpress-integration.js` 统一解析，不再依赖根目录 `/quiz`、`/result`、`/guide`。

在加载脚本前由 PHP 输出配置：

```html
<script>
window.TIZHI_SHOP_CONFIG = {
  baseUrl: '/wp-content/plugins/tizhi-shop/assets/wellness-test',
  pages: { home: '', quiz: 'quiz.html', result: 'result.html', guide: 'guide.html' },
  productsByType: {
    qixu: [{ name: '黄芪类商品', productId: 123, url: '/shop/?product=123' }],
    pinghe: [{ name: '日常调养商品', productId: 124, url: '/shop/?product=124' }]
  }
};
</script>
```

`productsByType` 是后台商品配置预留接口：键为九大体质的 `typeId`（如 `qixu`、`yangxu`），值为商品数组。每项至少提供 `name`；可选 `productId` 与插件生成的 `url`。前端不会写死真实购买链接。

核心算法仍由 `WellnessData.computeScores(answers)` 和 `WellnessData.findDominant(scores)` 提供；题库 27 题、三档答案及评分算法均未修改。外部插件可调用这两个函数，或监听 `tizhi-shop:result` 事件获得 `{ typeId, score, scores }`。

测试：在静态服务器或 WordPress 预览页完成 27 题，确认结果、饮食/食疗报告、返回导航和按 typeId 的商品展示正常。还应分别为九种 `typeId` 配置商品，确认无真实链接被前端写死。
