// --- Language dictionary ---
const strings = {
  zh: {
    title: '隐私政策',
    lastUpdated: '最后更新：2026 年 3 月 21 日',
    backButton: '返回',
    sections: [
      {
        heading: '1. 我们收集哪些数据',
        content: `当您使用 Foam-Agent 平台时，我们会收集以下数据：
• 账户信息：注册时提供的电子邮箱地址、加密后的密码、用户名和机构名称
• 仿真任务数据：您提交的仿真需求描述（prompt）、选择的求解器和 LLM 配置、生成的配置文件和仿真结果
• 使用数据：任务提交时间、任务状态变更、LLM token 使用量
• 可选数据：您主动提供的任务评价（整体评价和阶段评价）、文件反馈、专家咨询需求
• 上传文件：如您上传了自定义网格文件（.msh），该文件存储在 Supabase Storage 中，随关联任务一起删除
• 如您选择"使用自己的 API Key"，该 Key 仅用于当前任务，Worker 读取后立即从数据库中删除
• 隐私政策同意时间戳：记录您同意本政策的时间`,
      },
      {
        heading: '2. Cookie 与本地存储',
        content: `本平台不使用传统 Cookie。我们使用浏览器的 localStorage 存储以下数据：
• Supabase 认证令牌（用于保持登录状态）
• 用户保存的模型和执行设置（如 LLM 提供商、模型版本、流水线模式等，不含 API Key 等敏感信息）

我们不使用任何第三方追踪 Cookie、广告 SDK 或用户行为分析工具。您的浏览行为不会被追踪或分析。`,
      },
      {
        heading: '3. 第三方服务',
        content: `为提供服务，我们使用以下第三方基础设施。我们仅与这些服务共享运行平台所必需的最少数据：

• Supabase（美国）：数据库、用户认证、文件存储。存储您的账户信息、仿真任务和结果文件
• Vercel（全球 CDN）：托管前端静态资源。不存储用户数据
• Cloudflare（全球）：DNS 解析、安全隧道、Turnstile 人机验证。处理注册和登录时的 CAPTCHA 验证
• OpenAI / Anthropic（美国）：LLM API。仅接收仿真需求描述（prompt）用于生成配置文件，不存储您的个人身份信息

我们不使用 Google Analytics、Facebook Pixel 或任何其他广告/追踪服务。`,
      },
      {
        heading: '4. 数据存储位置',
        content: `您的数据存储在以下位置：
• 数据库与认证服务：Supabase（美国数据中心），托管在 AWS 基础设施上
• 仿真结果文件：Supabase Storage（美国数据中心）
• 前端静态资源：Vercel CDN（全球分布）

我们不会将您的数据出售或分享给第三方广告商。`,
      },
      {
        heading: '5. 数据用途',
        content: `我们收集的数据仅用于：
• 提供仿真服务：处理您的请求并返回结果
• 改进平台质量：分析匿名化的使用统计以提升仿真成功率
• 账户管理：身份验证和权限控制
• 安全保障：人机验证、速率限制、异常检测`,
      },
      {
        heading: '6. 数据保留期限',
        content: `• 失败/取消的仿真任务：自创建之日起保留 7 天，之后自动软删除
• 已完成的仿真任务：自创建之日起保留 14 天，之后自动软删除
• 已软删除的任务：3 天后自动硬删除（清理云端存储文件、本地运行目录和数据库记录）
• 账户信息和用户资料：在您主动删除账户前一直保留
• 服务器日志：保留 30 天后自动清除`,
      },
      {
        heading: '7. 您的权利',
        content: `您对您的数据拥有以下权利：
• 访问权：您可以随时在平台上查看您提交的所有任务和结果
• 删除权：您可以删除单个任务；账户删除功能已实现（后端 API 就绪），开启后可自助永久删除账户及所有关联数据，或联系我们协助删除
• 导出权：您可以下载您的仿真结果文件（ZIP 格式），或通过文件浏览器查看和下载单个文件。所有状态的任务（已完成、失败、取消）均可下载
• 更正权：如需修改用户名、机构等账户信息，请联系我们
• 撤回同意权：您可以随时联系我们撤回对本隐私政策的同意，届时您的账户将被停用`,
      },
      {
        heading: '8. 数据安全',
        content: `我们采取以下措施保护您的数据：
• 所有通信通过 HTTPS 加密传输
• 密码经过哈希处理，我们无法读取您的明文密码
• API Key 仅在内存中短暂存在，Worker 读取后立即从数据库中删除
• 数据库访问通过 Row Level Security (RLS) 策略限制，用户只能访问自己的数据
• 注册和登录时使用 Cloudflare Turnstile 人机验证，防止自动化攻击
• API 端点启用速率限制，防止滥用
• 仿真脚本执行前经过安全审计（Allrun 白名单验证）
• 任务领取使用数据库级原子锁（FOR UPDATE SKIP LOCKED），防止并发冲突`,
      },
      {
        heading: '9. 开源许可与使用限制',
        content: `Foam-Agent 平台的源代码在 PolyForm Strict License 1.0.0 许可下发布。这意味着：

允许的用途：
• 个人学习、研究、实验和测试（无商业意图）
• 教育机构、公共研究组织、慈善组织和政府机构的非营利使用
• 业余爱好项目和个人娱乐

禁止的行为：
• 商业用途：不得将本平台或其源代码用于任何商业目的，包括但不限于出售、集成到商业产品、或为商业客户提供服务
• 分发：不得重新分发本软件的源代码
• 衍生作品：不得基于本软件创建修改版本或衍生作品
• 再许可：不得将您获得的许可转让或再许可给他人

完整许可协议文本请参阅各代码仓库中的 LICENSE 文件：
• 前端：github.com/ruohai0925/cfdqanda-client/blob/main/LICENSE
• 后端：github.com/ruohai0925/cfdqanda-server/blob/main/LICENSE
• 中间件：github.com/ruohai0925/cfdqanda-middleware/blob/main/LICENSE

违反许可条款的，在收到书面通知后 32 天内纠正可保留许可，否则许可立即终止。`,
      },
      {
        heading: '10. 联系我们',
        content: `如果您对本隐私政策或许可协议有任何疑问，或希望行使您的数据权利（包括删除账户、导出数据、撤回同意等），请通过以下方式联系我们：
• 邮箱: apexflowcfd@gmail.com`,
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: March 21, 2026',
    backButton: 'Back',
    sections: [
      {
        heading: '1. What Data We Collect',
        content: `When you use the Foam-Agent platform, we collect the following data:
• Account information: email address, encrypted password, display name, and organization provided during registration
• Simulation task data: your simulation requirement descriptions (prompts), solver and LLM configuration choices, generated configuration files, and simulation results
• Usage data: task submission times, task status changes, LLM token usage
• Optional data: task ratings (overall and per-stage), file feedback, and expert consultation requests you voluntarily provide
• Uploaded files: if you upload a custom mesh file (.msh), it is stored in Supabase Storage and deleted together with the associated task
• If you choose "Bring Your Own Key", the API key is used only for the current task and deleted from the database immediately after the Worker reads it
• Privacy policy consent timestamp: records when you agreed to this policy`,
      },
      {
        heading: '2. Cookies and Local Storage',
        content: `This platform does not use traditional cookies. We use the browser's localStorage to store:
• Supabase authentication token (to maintain your login session)
• User-saved model and execution settings (e.g. LLM provider, model version, pipeline mode — no sensitive data such as API keys)

We do not use any third-party tracking cookies, advertising SDKs, or user behavior analytics tools. Your browsing behavior is not tracked or analyzed.`,
      },
      {
        heading: '3. Third-Party Services',
        content: `To provide our services, we use the following third-party infrastructure. We share only the minimum data necessary to operate the platform:

• Supabase (US): Database, user authentication, file storage. Stores your account information, simulation tasks, and result files
• Vercel (Global CDN): Hosts frontend static assets. Does not store user data
• Cloudflare (Global): DNS resolution, security tunnel, Turnstile CAPTCHA verification. Processes CAPTCHA verification during registration and login
• OpenAI / Anthropic (US): LLM APIs. Only receives simulation requirement descriptions (prompts) for generating configuration files; does not store your personal identity information

We do not use Google Analytics, Facebook Pixel, or any other advertising/tracking services.`,
      },
      {
        heading: '4. Where Data Is Stored',
        content: `Your data is stored in the following locations:
• Database and authentication: Supabase (US data centers), hosted on AWS infrastructure
• Simulation result files: Supabase Storage (US data centers)
• Frontend static assets: Vercel CDN (globally distributed)

We do not sell or share your data with third-party advertisers.`,
      },
      {
        heading: '5. How Data Is Used',
        content: `The data we collect is used solely for:
• Providing simulation services: processing your requests and returning results
• Improving platform quality: analyzing anonymized usage statistics to improve simulation success rates
• Account management: authentication and access control
• Security: CAPTCHA verification, rate limiting, anomaly detection`,
      },
      {
        heading: '6. Data Retention',
        content: `• Failed/cancelled simulation tasks: retained for 7 days from creation, then automatically soft-deleted
• Completed simulation tasks: retained for 14 days from creation, then automatically soft-deleted
• Soft-deleted tasks: permanently deleted after 3 days (cloud storage files, local run directories, and database records are cleaned up)
• Account information and user profiles: retained until you actively delete your account
• Server logs: retained for 30 days, then automatically purged`,
      },
      {
        heading: '7. Your Rights',
        content: `You have the following rights regarding your data:
• Right of access: you can view all your submitted tasks and results on the platform at any time
• Right to erasure: you can delete individual tasks; the account deletion feature is implemented (backend API ready) and once enabled, you can permanently remove your account and all associated data, or contact us for assistance
• Right to data portability: you can download your simulation result files (ZIP format) for all task statuses (completed, failed, cancelled), or browse and download individual files through the file browser
• Right to rectification: contact us to modify your display name, organization, or other account information
• Right to withdraw consent: you may contact us at any time to withdraw your consent to this Privacy Policy, at which point your account will be deactivated`,
      },
      {
        heading: '8. Data Security',
        content: `We take the following measures to protect your data:
• All communications are encrypted via HTTPS
• Passwords are hashed; we cannot read your plaintext password
• API keys exist only briefly in memory and are immediately deleted from the database after the Worker reads them
• Database access is restricted through Row Level Security (RLS) policies, ensuring users can only access their own data
• Cloudflare Turnstile CAPTCHA verification is used during registration and login to prevent automated attacks
• API endpoints are rate-limited to prevent abuse
• Simulation scripts undergo security auditing before execution (Allrun whitelist validation)
• Task claiming uses database-level atomic locks (FOR UPDATE SKIP LOCKED) to prevent concurrency conflicts`,
      },
      {
        heading: '9. Open Source License & Usage Restrictions',
        content: `The Foam-Agent platform source code is released under the PolyForm Strict License 1.0.0. This means:

Permitted uses:
• Personal study, research, experimentation, and testing (with no commercial intent)
• Non-profit use by educational institutions, public research organizations, charities, and government agencies
• Hobby projects and personal entertainment

Prohibited actions:
• Commercial use: You may not use this platform or its source code for any commercial purpose, including but not limited to selling, integrating into commercial products, or providing services to commercial clients
• Distribution: You may not redistribute the source code of this software
• Derivative works: You may not create modified versions or derivative works based on this software
• Sublicensing: You may not transfer or sublicense your licenses to anyone else

The full license text is available in the LICENSE file of each repository:
• Frontend: github.com/ruohai0925/cfdqanda-client/blob/main/LICENSE
• Backend: github.com/ruohai0925/cfdqanda-server/blob/main/LICENSE
• Middleware: github.com/ruohai0925/cfdqanda-middleware/blob/main/LICENSE

If you violate the license terms, you have 32 days from written notice to come into full compliance; otherwise, all your licenses end immediately.`,
      },
      {
        heading: '10. Contact Us',
        content: `If you have any questions about this Privacy Policy or license agreement, or wish to exercise your data rights (including account deletion, data export, or consent withdrawal), please contact us:
• Email: apexflowcfd@gmail.com`,
      },
    ],
  },
};

const downloadStrings = {
  zh: '下载 Markdown',
  en: 'Download Markdown',
};

export default function PrivacyPolicy({ language, onBack }) {
  const t = strings[language];

  const downloadMd = () => {
    const md = `# ${t.title}\n\n*${t.lastUpdated}*\n\n` +
      t.sections.map(s => `## ${s.heading}\n\n${s.content}`).join('\n\n---\n\n');
    const filename = language === 'zh' ? 'PRIVACY_POLICY_zh.md' : 'PRIVACY_POLICY_en.md';
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="privacy-policy">
      <div className="privacy-header">
        <h1>{t.title}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="button-block button-outline" style={{ width: 'auto' }} onClick={onBack}>
            {t.backButton}
          </button>
          <button className="button-block button-outline" style={{ width: 'auto' }} onClick={downloadMd}>
            {downloadStrings[language]}
          </button>
        </div>
      </div>
      <p className="privacy-updated">{t.lastUpdated}</p>

      {t.sections.map((section, index) => (
        <div key={index} className="privacy-section">
          <h2>{section.heading}</h2>
          <p>{section.content}</p>
        </div>
      ))}
    </div>
  );
}
