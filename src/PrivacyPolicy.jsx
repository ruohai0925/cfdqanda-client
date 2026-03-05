// --- Language dictionary ---
const strings = {
  zh: {
    title: '隐私政策',
    lastUpdated: '最后更新：2026 年 3 月',
    backButton: '返回',
    sections: [
      {
        heading: '1. 我们收集哪些数据',
        content: `当您使用 CFDQandA 平台时，我们会收集以下数据：
• 账户信息：注册时提供的电子邮箱地址、加密后的密码、用户名和机构名称
• 仿真任务数据：您提交的仿真需求描述（prompt）、选择的求解器和 LLM 配置、生成的配置文件和仿真结果
• 使用数据：任务提交时间、任务状态变更、LLM token 使用量
• 可选数据：您主动提供的任务评价和文件反馈
• 如您选择"使用自己的 API Key"，该 Key 仅用于当前任务，Worker 读取后立即从数据库中删除
• 隐私政策同意时间戳：记录您同意本政策的时间`,
      },
      {
        heading: '2. Cookie 与本地存储',
        content: `本平台不使用传统 Cookie。我们使用浏览器的 localStorage 存储以下数据：
• Supabase 认证令牌（用于保持登录状态）

我们不使用任何第三方追踪 Cookie、广告 SDK 或用户行为分析工具。您的浏览行为不会被追踪或分析。`,
      },
      {
        heading: '3. 第三方服务',
        content: `为提供服务，我们使用以下第三方基础设施。我们仅与这些服务共享运行平台所必需的最少数据：

• Supabase（美国）：数据库、用户认证、文件存储。存储您的账户信息、仿真任务和结果文件
• Vercel（全球 CDN）：托管前端静态资源。不存储用户数据
• Cloudflare（全球）：DNS 解析、安全隧道、Turnstile 人机验证。处理注册时的 CAPTCHA 验证
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
• 已软删除的任务：3 天后自动硬删除（清理存储文件和数据库记录）
• 账户信息和用户资料：在您主动删除账户前一直保留
• 服务器日志：保留 30 天后自动清除`,
      },
      {
        heading: '7. 您的权利',
        content: `您对您的数据拥有以下权利：
• 访问权：您可以随时在平台上查看您提交的所有任务和结果
• 删除权：您可以删除单个任务，也可以通过联系我们删除账户来清除所有关联数据
• 导出权：您可以下载您的仿真结果文件（ZIP 格式），或通过文件浏览器查看和下载单个文件
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
• 注册时使用 Cloudflare Turnstile 人机验证，防止自动化攻击
• API 端点启用速率限制，防止滥用`,
      },
      {
        heading: '9. 联系我们',
        content: `如果您对本隐私政策有任何疑问，或希望行使您的数据权利（包括删除账户、导出数据、撤回同意等），请通过以下方式联系我们：
• 邮箱: apexxflowcfd@gmail.com`,
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: March 2026',
    backButton: 'Back',
    sections: [
      {
        heading: '1. What Data We Collect',
        content: `When you use the CFDQandA platform, we collect the following data:
• Account information: email address, encrypted password, display name, and organization provided during registration
• Simulation task data: your simulation requirement descriptions (prompts), solver and LLM configuration choices, generated configuration files, and simulation results
• Usage data: task submission times, task status changes, LLM token usage
• Optional data: task ratings and file feedback you voluntarily provide
• If you choose "Bring Your Own Key", the API key is used only for the current task and deleted from the database immediately after the Worker reads it
• Privacy policy consent timestamp: records when you agreed to this policy`,
      },
      {
        heading: '2. Cookies and Local Storage',
        content: `This platform does not use traditional cookies. We use the browser's localStorage to store:
• Supabase authentication token (to maintain your login session)

We do not use any third-party tracking cookies, advertising SDKs, or user behavior analytics tools. Your browsing behavior is not tracked or analyzed.`,
      },
      {
        heading: '3. Third-Party Services',
        content: `To provide our services, we use the following third-party infrastructure. We share only the minimum data necessary to operate the platform:

• Supabase (US): Database, user authentication, file storage. Stores your account information, simulation tasks, and result files
• Vercel (Global CDN): Hosts frontend static assets. Does not store user data
• Cloudflare (Global): DNS resolution, security tunnel, Turnstile CAPTCHA verification. Processes CAPTCHA verification during registration
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
• Soft-deleted tasks: permanently deleted after 3 days (storage files and database records are cleaned up)
• Account information and user profiles: retained until you actively delete your account
• Server logs: retained for 30 days, then automatically purged`,
      },
      {
        heading: '7. Your Rights',
        content: `You have the following rights regarding your data:
• Right of access: you can view all your submitted tasks and results on the platform at any time
• Right to erasure: you can delete individual tasks, or contact us to delete your account and remove all associated data
• Right to data portability: you can download your simulation result files (ZIP format), or browse and download individual files through the file browser
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
• Cloudflare Turnstile CAPTCHA verification is used during registration to prevent automated attacks
• API endpoints are rate-limited to prevent abuse`,
      },
      {
        heading: '9. Contact Us',
        content: `If you have any questions about this Privacy Policy or wish to exercise your data rights (including account deletion, data export, or consent withdrawal), please contact us:
• Email: apexxflowcfd@gmail.com`,
      },
    ],
  },
};

export default function PrivacyPolicy({ language, onBack }) {
  const t = strings[language];

  return (
    <div className="privacy-policy">
      <div className="privacy-header">
        <h1>{t.title}</h1>
        <button className="button-block button-outline" style={{ width: 'auto' }} onClick={onBack}>
          {t.backButton}
        </button>
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
