# 体质自测站 · 部署到 GitHub Pages 完整指南

按顺序执行，每一步都给了「验证方式」与「失败怎么办」。

## 前提：你的环境

- ✅ Windows + Git Bash（已确认）
- ✅ git v2.55 已装
- ⚠️ git user.name / user.email **未配置**（下面会教）
- ⏳ 需要 GitHub 账号（没有的话去 https://github.com 注册）

---

## 第 1 步 · 在 GitHub 上创建仓库

1. 登录 https://github.com
2. 右上角 **+** → **New repository**
3. 填写：
   - **Repository name**：`wellness-test`（必须用这个名字，与下面的命令对齐）
   - **Description**：`中医体质自测 + 养生建议`（可留空）
   - **Public**（公开，否则 Pages 只有 Pro 能用）
   - ⚠️ **不要勾选** "Add a README file"
   - ⚠️ **不要选** .gitignore / license（自定义会冲突）
4. 点 **Create repository**

**验证**：跳转到 `https://github.com/你的用户名/wellness-test`，看到空仓库 + 一行 "Quick setup — if you're already doing local stuff" 提示。

---

## 第 2 步 · 配置 git 身份（首次需要）

打开 **Git Bash**，执行（把下面命令里的 `你的名字` 和 `你的邮箱` 替换成真实信息）：

```bash
git config --global user.name "你的GitHub用户名"
git config --global user.email "你注册GitHub用的邮箱"
```

**验证**：

```bash
git config --global user.name
git config --global user.email
```

应该分别显示你刚配的名字和邮箱。

---

## 第 3 步 · 本地初始化与首次提交

在 **Git Bash** 里依次执行：

```bash
# 1. 切换到项目目录（路径含空格和中文，用引号）
cd "D:/32 GB/2026-08-17-10-56-09/wellness-test"

# 2. 初始化本地仓库
git init

# 3. 先创建 .gitignore 排除一些非必要文件
# （项目当前没有要排除的，但加一个空文件保留扩展性）
# 实际上下一步已经包含，这里省略

# 4. 添加 .gitignore（避免误提交敏感文件）
cat > .gitignore <<'EOF'
# 编辑器/系统
.DS_Store
.vscode/
.idea/
*.swp
*~
*.tmp

# 日志与缓存
*.log
.cache/

# 环境配置（如果你后续加了 .env）
.env
.env.local

# Python（之前那个官网用的）
__pycache__/
*.pyc
EOF

# 5. 添加所有文件到暂存区
git add .

# 6. 第一次提交
git commit -m "feat: 初始化中医体质自测 + 带货站"
```

**验证**：

```bash
git log --oneline
```

应该看到一行提交记录：`feat: 初始化中医体质自测 + 带货站`。

---

## 第 4 步 · 关联远程仓库并推送

⚠️ **用户名替换**：把下面所有 `YOUR_USERNAME` 改成你 GitHub 用户名。

```bash
# 1. 把默认分支改名为 main（GitHub 新仓库默认是 main）
git branch -M main

# 2. 关联你的 GitHub 仓库
git remote add origin https://github.com/YOUR_USERNAME/wellness-test.git

# 3. 推上去
git push -u origin main
```

### ⚠️ 推送时会弹认证框

按下面任一方式：

#### 方式 A · 浏览器登录（推荐新手）

- 推送时 Git Bash 会弹窗或在浏览器自动打开登录
- 登录即可，Git 会自动保存凭据
- 看到 `Writing objects: 100%` + `* [new branch] main -> main` 就成功

#### 方式 B · 用 PAT 登录

如果浏览器登录失败（公司网络等情况），用 PAT：

1. 去 https://github.com/settings/tokens/new 创建
   - **Note**：`wellness-test deploy`
   - **Expiration**：`30 days`（先短点，后续可续）
   - **勾选**：`repo`（仅这一个）
2. 点 Generate token → **复制好（关掉就看不到了）**
3. 在 Git Bash 执行 `git push`，用户名填 GitHub 用户名，密码填 **刚才的 PAT**

---

## 第 5 步 · 启用 GitHub Pages

1. 在 GitHub 上打开仓库页面
2. 上方标签 → **Settings**
3. 左侧菜单 → **Pages**
4. **Source** 选 **Deploy from a branch**
5. **Branch** 选 **main**，目录选 **/(root)**
6. 点 **Save**

**验证**：

- 顶部出现提示：`Your site is live at https://YOUR_USERNAME.github.io/wellness-test/`
- 等 **1—2 分钟**（首次部署要编译）
- 浏览器打开这个 URL，能看到首页

如果打开了但显示 404：
- 等多 2 分钟（Pages 冷启动）
- 在 Settings → Pages 页面看是否有错误提示
- 检查仓库根目录是否有 `index.html`（Pages 以此为入口）

---

## 第 6 步 · 之后修改代码怎么部署

日常修改：

```bash
cd "D:/32 GB/2026-08-17-10-56-09/wellness-test"

# 看改了什么
git status

# 加进去
git add .

# 提交（描述写清楚改了什么）
git commit -m "feat: 加了新功能"   # 或 "fix: 修了XX"

# 推送（每次都要）
git push
```

GitHub 会在 **30 秒到 2 分钟**内自动重新部署 Pages。

**查看部署状态**：
- 仓库 → 上方 **Actions** 标签
- 看到绿色的 ✓ 就是部署成功
- 如果失败，点进去看报错

---

## 常见问题（Troubleshooting）

### Q1：`git push` 报 "Authentication failed"

**原因**：GitHub 2021 年起不再允许用账号密码推送，只能用 PAT 或 SSH。

**解决**：
1. 按上面"方式 B"创建 PAT
2. 或者 Windows 凭据管理器清掉旧凭据，让它重新弹窗

清理旧凭据的方法（Windows）：
```bash
# 在 Git Bash 执行
git credential-manager erase https://github.com
```
然后重新 `git push` 触发登录。

### Q2：推送时 "fatal: refusing to merge unrelated histories"

如果 GitHub 仓库初始化时勾选了 README：
```bash
git pull origin main --allow-unrelated-histories
git push origin main
```

### Q3：Pages 部署后页面 404

- 等待 2—3 分钟（首次部署）
- 检查仓库根目录确实有 `index.html`
- 在 Settings → Pages 确认 Branch 配置正确

### Q4：自定义域名

想用 `yourdomain.com` 而不是 `username.github.io`：

1. 买域名（阿里云、Cloudflare 都可以）
2. 在域名 DNS 添加：
   - **CNAME 记录**：`www` → `YOUR_USERNAME.github.io`
   - **A 记录**（@ 根域）：
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
3. 在仓库根目录加一个 `CNAME` 文件，内容写你的域名（如 `yourdomain.com`）
4. 在 GitHub Pages 设置里勾选 **Enforce HTTPS**（等证书签发几分钟后启用）

```bash
# 加 CNAME 文件并推送
echo "yourdomain.com" > CNAME
git add CNAME
git commit -m "feat: 添加自定义域名"
git push
```

### Q5：中文文件名导致 git 问题

如果遇到乱码，配置：
```bash
git config --global core.quotepath false
git config --global i18n.commitEncoding utf-8
git config --global i18n.logOutputEncoding utf-8
```

---

## 回滚（万一改坏了）

### 方法 1：Git 层面回滚（推荐）

```bash
# 1. 查看历史
git log --oneline

# 2. 回到上一版（HEAD~1 是上一个，HEAD~2 是上两个）
git reset --hard HEAD~1

# 3. 推送（强制）
git push -f origin main
```

### 方法 2：在 GitHub 网页上回滚

1. 仓库页面 → 文件列表
2. 点要回滚的文件
3. 上方点 **History** → 找旧版本
4. 点 **← Older commit** 找到好的版本
5. 点 **...** → **Revert this commit** → **Create pull request**

---

## 自定义域名（如需要）

参见上面 Q4。

---

## 完整流程一览（图示）

```
本地 wellness-test/        →    GitHub 仓库        →    GitHub Pages
[git init / add / commit]  →  [git push]        →  [自动部署]
                            https://github.com/  →  https://USER.github.io/
                            YOUR_USERNAME/         wellness-test/
                            wellness-test
```

---

## 一键复制（最终版）

如果你已经按上面配过身份、创建好仓库，把下面的命令复制到 Git Bash 一次性跑完：

```bash
cd "D:/32 GB/2026-08-17-10-56-09/wellness-test" && \
git init && \
git add . && \
git commit -m "feat: 初始化中医体质自测 + 带货站" && \
git branch -M main && \
git remote add origin https://github.com/YOUR_USERNAME/wellness-test.git && \
git push -u origin main
```

⚠️ 记得把 `YOUR_USERNAME` 改成你 GitHub 用户名！

---

## 部署成功后

- 📍 在 README 顶部更新一行 "线上地址"：`https://YOUR_USERNAME.github.io/wellness-test/`
- 🚀 之后每次改动 → `git add . && git commit -m "..." && git push`
- 🔍 SEO：在 https://search.google.com/search-console 注册并提交 sitemap
