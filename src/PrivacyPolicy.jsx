// --- Language dictionary ---
const strings = {
  zh: {
    title: '隐私政策',
    lastUpdated: '最后更新：2026 年 2 月',
    backButton: '返回',
    sections: [
      {
        heading: '1. 我们收集哪些数据',
        content: `当您使用 CFDQandA 平台时，我们会收集以下数据：
• 账户信息：注册时提供的电子邮箱地址和加密后的密码
• 仿真任务数据：您提交的仿真需求描述（prompt）、生成的配置文件和仿真结果
• 使用数据：任务提交时间、任务状态、LLM token 使用量
• 可选数据：您主动提供的任务评价和文件反馈
• 如您选择"使用自己的 API Key"，该 Key 仅用于当前任务，处理后立即从服务器删除`,
      },
      {
        heading: '2. 数据存储位置',
        content: `您的数据存储在以下位置：
• 数据库与认证服务：Supabase（美国数据中心），托管在 AWS 基础设施上
• 仿真结果文件：Supabase Storage（美国数据中心）
• 前端静态资源：Vercel CDN（全球分布）

我们不会将您的数据出售或分享给第三方广告商。`,
      },
      {
        heading: '3. 数据用途',
        content: `我们收集的数据仅用于：
• 提供仿真服务：处理您的请求并返回结果
• 改进平台质量：分析匿名化的使用统计以提升仿真成功率
• 账户管理：身份验证和权限控制`,
      },
      {
        heading: '4. 数据保留期限',
        content: `• 仿真任务及结果：自创建之日起保留 90 天，之后自动清理存储文件
• 账户信息：在您主动删除账户前一直保留
• 服务器日志：保留 30 天后自动清除`,
      },
      {
        heading: '5. 您的权利',
        content: `您对您的数据拥有以下权利：
• 访问权：您可以随时在平台上查看您提交的所有任务和结果
• 删除权：您可以删除单个任务，也可以通过删除账户来清除所有关联数据
• 导出权：您可以下载您的仿真结果文件（ZIP 格式）
• 更正权：如需修改账户信息，请联系我们`,
      },
      {
        heading: '6. 数据安全',
        content: `我们采取以下措施保护您的数据：
• 所有通信通过 HTTPS 加密传输
• 密码经过哈希处理，我们无法读取您的明文密码
• API Key 仅在内存中短暂存在，使用后立即从数据库中删除
• 数据库访问通过 Row Level Security (RLS) 策略限制，用户只能访问自己的数据`,
      },
      {
        heading: '7. 联系我们',
        content: `如果您对本隐私政策有任何疑问，或希望行使您的数据权利，请通过以下方式联系我们：
• GitHub: https://github.com/cfdqanda`,
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last updated: February 2026',
    backButton: 'Back',
    sections: [
      {
        heading: '1. What Data We Collect',
        content: `When you use the CFDQandA platform, we collect the following data:
• Account information: email address and encrypted password provided during registration
• Simulation task data: your simulation requirement descriptions (prompts), generated configuration files, and simulation results
• Usage data: task submission times, task status, LLM token usage
• Optional data: task ratings and file feedback you voluntarily provide
• If you choose "Bring Your Own Key", the API key is used only for the current task and deleted from the server immediately after processing`,
      },
      {
        heading: '2. Where Data Is Stored',
        content: `Your data is stored in the following locations:
• Database and authentication: Supabase (US data centers), hosted on AWS infrastructure
• Simulation result files: Supabase Storage (US data centers)
• Frontend static assets: Vercel CDN (globally distributed)

We do not sell or share your data with third-party advertisers.`,
      },
      {
        heading: '3. How Data Is Used',
        content: `The data we collect is used solely for:
• Providing simulation services: processing your requests and returning results
• Improving platform quality: analyzing anonymized usage statistics to improve simulation success rates
• Account management: authentication and access control`,
      },
      {
        heading: '4. Data Retention',
        content: `• Simulation tasks and results: retained for 90 days from creation, after which storage files are automatically cleaned up
• Account information: retained until you actively delete your account
• Server logs: retained for 30 days, then automatically purged`,
      },
      {
        heading: '5. Your Rights',
        content: `You have the following rights regarding your data:
• Right of access: you can view all your submitted tasks and results on the platform at any time
• Right to erasure: you can delete individual tasks, or delete your account to remove all associated data
• Right to data portability: you can download your simulation result files (ZIP format)
• Right to rectification: contact us to modify your account information`,
      },
      {
        heading: '6. Data Security',
        content: `We take the following measures to protect your data:
• All communications are encrypted via HTTPS
• Passwords are hashed; we cannot read your plaintext password
• API keys exist only briefly in memory and are immediately deleted from the database after use
• Database access is restricted through Row Level Security (RLS) policies, ensuring users can only access their own data`,
      },
      {
        heading: '7. Contact Us',
        content: `If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us:
• GitHub: https://github.com/cfdqanda`,
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
