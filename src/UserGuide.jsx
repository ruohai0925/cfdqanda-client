import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import guideZh from '../USER_GUIDE_zh.md?raw';
import guideEn from '../USER_GUIDE_en.md?raw';

const strings = {
  zh: {
    backButton: '返回',
    downloadButton: '下载 Markdown',
    videoTitle: '平台介绍视频（英文）',
    videoCaption: '快速了解平台核心功能。',
  },
  en: {
    backButton: 'Back',
    downloadButton: 'Download Markdown',
    videoTitle: 'Platform Walkthrough',
    videoCaption: 'A quick tour of the platform.',
  },
};

// Embed via youtube-nocookie so visitors aren't tracked until they hit play.
const TUTORIAL_EMBED_URL = 'https://www.youtube-nocookie.com/embed/_Fveasp8QHI';

export default function UserGuide({ language, onBack }) {
  const t = strings[language];
  const content = language === 'zh' ? guideZh : guideEn;

  // Handle anchor link clicks: scroll to target instead of changing hash
  // (changing hash would trigger App's hashchange listener and navigate away)
  const handleClick = (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.getElementById(decodeURIComponent(href.slice(1)));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const downloadMd = () => {
    const filename = language === 'zh' ? 'USER_GUIDE_zh.md' : 'USER_GUIDE_en.md';
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="user-guide" onClick={handleClick}>
      <div className="user-guide-header">
        <button className="button-block button-outline" style={{ width: 'auto' }} onClick={onBack}>
          {t.backButton}
        </button>
        <button className="button-block button-outline" style={{ width: 'auto' }} onClick={downloadMd}>
          {t.downloadButton}
        </button>
      </div>
      <section className="user-guide-video" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginTop: 0 }}>{t.videoTitle}</h2>
        <p style={{ marginTop: 0, color: 'var(--text-muted, #666)' }}>{t.videoCaption}</p>
        <div style={{
          position: 'relative',
          paddingBottom: '56.25%',  // 16:9
          height: 0,
          overflow: 'hidden',
          borderRadius: '8px',
        }}>
          <iframe
            src={TUTORIAL_EMBED_URL}
            title={t.videoTitle}
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          />
        </div>
      </section>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>{content}</ReactMarkdown>
    </div>
  );
}
