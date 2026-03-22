import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import guideZh from '../USER_GUIDE_zh.md?raw';
import guideEn from '../USER_GUIDE_en.md?raw';

const strings = {
  zh: { backButton: '返回' },
  en: { backButton: 'Back' },
};

export default function UserGuide({ language, onBack }) {
  const t = strings[language];
  const content = language === 'zh' ? guideZh : guideEn;

  return (
    <div className="user-guide">
      <div className="user-guide-header">
        <button className="button-block button-outline" style={{ width: 'auto' }} onClick={onBack}>
          {t.backButton}
        </button>
      </div>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]}>{content}</ReactMarkdown>
    </div>
  );
}
