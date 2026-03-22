import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import guideZh from '../USER_GUIDE_zh.md?raw';
import guideEn from '../USER_GUIDE_en.md?raw';

const strings = {
  zh: { backButton: '返回', downloadButton: '下载 Markdown' },
  en: { backButton: 'Back', downloadButton: 'Download Markdown' },
};

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
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>{content}</ReactMarkdown>
    </div>
  );
}
