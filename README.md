# 微信公众号爆款文章生成器

这是一个使用 Next.js 和 AI 技术构建的应用程序，能够根据输入的主题自动生成高质量的微信公众号文章。文章风格类似于情感类爆文，每个段落都有一个点睛句（以蓝色文字突出显示）。

## 功能特点

- 输入主题一键生成爆款文章
- 生成的文章包含标题和正文
- 每个段落都有一个点睛句（以蓝色文字突出显示）
- 支持将文章下载为 HTML 格式
- 支持复制文章标题
- 自适应设计，适合各种屏幕尺寸

## 技术栈

- Next.js 15+
- TypeScript
- OpenAI API / Deepseek API
- Tailwind CSS
- shadcn/ui 组件库

## 本地开发

1. 克隆仓库

   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. 安装依赖

   ```bash
   npm install
   ```

3. 创建 `.env.local` 文件，添加 OpenAI API 密钥

   ```
   OPENAI_API_KEY=your_api_key_here
   API_PROVIDER=auto  # 可选值: auto, openai, deepseek
   ```

4. 启动开发服务器

   ```bash
   npm run dev
   ```

5. 浏览器打开 http://localhost:3000

## 部署到 Vercel

1. Fork 这个仓库到你的 GitHub 账户

2. 连接你的 GitHub 仓库到 Vercel

3. 在 Vercel 中添加以下环境变量:

   - `OPENAI_API_KEY`: 你的 OpenAI API 密钥
   - `API_PROVIDER`: 选择 API 提供商（auto, openai, deepseek）
     - `auto`: 自动尝试 Deepseek API，失败则回退到 OpenAI API（推荐）
     - `openai`: 仅使用 OpenAI API
     - `deepseek`: 仅使用 Deepseek API

4. 部署应用

## 故障排除

如果在 Vercel 上部署后遇到"生成文章失败"的错误:

1. 检查是否正确设置了环境变量 `OPENAI_API_KEY`
2. 尝试将 `API_PROVIDER` 设置为 `openai` 以避免 Deepseek API 的潜在连接问题
3. 确保 API 密钥有足够的额度和权限
4. 检查 Vercel 日志以获取更详细的错误信息

## 许可证

MIT
