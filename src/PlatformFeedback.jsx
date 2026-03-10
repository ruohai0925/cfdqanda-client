import { useState } from 'react';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

const strings = {
  zh: {
    title: '平台反馈',
    placeholder: '请告诉我们您的建议、想要的功能、遇到的问题……',
    submit: '提交',
    cancel: '取消',
    success: '感谢您的反馈！',
    empty: '请输入反馈内容。',
    error: '提交失败，请稍后再试。',
  },
  en: {
    title: 'Platform Feedback',
    placeholder: 'Tell us your suggestions, feature requests, issues…',
    submit: 'Submit',
    cancel: 'Cancel',
    success: 'Thank you for your feedback!',
    empty: 'Please enter your feedback.',
    error: 'Submission failed. Please try again later.',
  },
};

export default function PlatformFeedback({ language, userId, onClose }) {
  const t = strings[language];
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error(t.empty);
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('platform_feedback')
      .insert({ user_id: userId, content: trimmed });

    setLoading(false);

    if (error) {
      console.error('Feedback insert error:', error);
      toast.error(t.error);
      return;
    }

    toast.success(t.success);
    onClose();
  };

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t.title}</h2>
        <textarea
          className="feedback-textarea"
          rows={6}
          placeholder={t.placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoFocus
        />
        <div className="feedback-actions">
          <button className="button-block button-outline" onClick={onClose}>
            {t.cancel}
          </button>
          <button className="button-block" onClick={handleSubmit} disabled={loading}>
            {loading ? '…' : t.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
