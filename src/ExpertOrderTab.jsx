import { useState } from 'react';
import toast from 'react-hot-toast';

// --- Language dictionary ---
const strings = {
  zh: {
    formTitle: '发布仿真需求',
    historyTitle: '我的订单',
    noOrders: '暂无订单记录。',
    orderTitle: '需求标题',
    orderTitlePlaceholder: '例如：换热器 CFD 校核',
    orderDescription: '详细描述',
    orderDescriptionPlaceholder: '请描述您的仿真需求，包括物理场景、几何形状、所需精度、交付形式等...',
    softwarePreference: '首选仿真软件',
    budgetRange: '预算区间',
    budgetOptions: {
      negotiable: '面议',
      under500: '¥500 以下',
      '500-1000': '¥500 - ¥1,000',
      '1000-3000': '¥1,000 - ¥3,000',
      '3000-5000': '¥3,000 - ¥5,000',
      above5000: '¥5,000 以上',
    },
    deadline: '期望完成时间',
    deliverables: '交付物',
    deliverableOptions: {
      simulation_files: '仿真文件（源文件 + 结果）',
      postprocessing: '后处理图片/动画',
      report: '书面报告',
      video: '视频演示/讲解',
    },
    submitButton: '发布需求',
    comingSoonToast: '专家接单系统即将上线，敬请期待！',
    titleRequired: '请输入需求标题',
    descriptionRequired: '请输入详细描述',
    comingSoonBadge: '即将上线',
    systemDescription: '连接仿真需求与专业人才的平台。客户发布需求，专家接单完成，组织者质量把关。',
  },
  en: {
    formTitle: 'Post Simulation Request',
    historyTitle: 'My Orders',
    noOrders: 'No orders yet.',
    orderTitle: 'Request Title',
    orderTitlePlaceholder: 'e.g., Heat exchanger CFD validation',
    orderDescription: 'Detailed Description',
    orderDescriptionPlaceholder: 'Describe your simulation needs, including physical scenario, geometry, accuracy requirements, deliverables...',
    softwarePreference: 'Preferred Software',
    budgetRange: 'Budget Range',
    budgetOptions: {
      negotiable: 'Negotiable',
      under500: 'Under ¥500',
      '500-1000': '¥500 - ¥1,000',
      '1000-3000': '¥1,000 - ¥3,000',
      '3000-5000': '¥3,000 - ¥5,000',
      above5000: 'Above ¥5,000',
    },
    deadline: 'Expected Deadline',
    deliverables: 'Deliverables',
    deliverableOptions: {
      simulation_files: 'Simulation files (source + results)',
      postprocessing: 'Post-processing images/animations',
      report: 'Written report',
      video: 'Video demonstration/explanation',
    },
    submitButton: 'Post Request',
    comingSoonToast: 'Expert order system coming soon!',
    titleRequired: 'Please enter a request title',
    descriptionRequired: 'Please enter a detailed description',
    comingSoonBadge: 'Coming Soon',
    systemDescription: 'A platform connecting simulation needs with professional talent. Clients post requirements, experts fulfill orders, organizers ensure quality.',
  }
};

const SOFTWARE_OPTIONS = [
  'OpenFOAM',
  'FLUENT',
  'STAR-CCM+',
  'COMSOL',
  'Abaqus',
  'Other',
];

export default function ExpertOrderTab({ session, language }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSoftware, setSelectedSoftware] = useState([]);
  const [budgetRange, setBudgetRange] = useState('negotiable');
  const [deadline, setDeadline] = useState('');
  const [selectedDeliverables, setSelectedDeliverables] = useState([]);

  const t = strings[language];

  const toggleSoftware = (sw) => {
    setSelectedSoftware((prev) =>
      prev.includes(sw) ? prev.filter((s) => s !== sw) : [...prev, sw]
    );
  };

  const toggleDeliverable = (d) => {
    setSelectedDeliverables((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error(t.titleRequired);
      return;
    }
    if (!description.trim()) {
      toast.error(t.descriptionRequired);
      return;
    }
    toast(t.comingSoonToast, { icon: '🚧' });
  };

  return (
    <div className="dashboard-layout">
      {/* Left panel: order submission form */}
      <div className="dashboard-left">
        <h3>{t.formTitle}</h3>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              {t.orderTitle}
            </label>
            <input
              type="text"
              className="inputField"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.orderTitlePlaceholder}
              style={{ margin: 0 }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              {t.orderDescription}
            </label>
            <textarea
              className="inputField prompt-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.orderDescriptionPlaceholder}
              rows="6"
              style={{ margin: 0 }}
            />
          </div>

          {/* Software preference */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              {t.softwarePreference}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SOFTWARE_OPTIONS.map((sw) => (
                <button
                  key={sw}
                  type="button"
                  onClick={() => toggleSoftware(sw)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '14px',
                    border: `1px solid ${selectedSoftware.includes(sw) ? 'var(--accent)' : 'var(--border)'}`,
                    background: selectedSoftware.includes(sw) ? 'var(--accent-subtle)' : 'transparent',
                    color: selectedSoftware.includes(sw) ? 'var(--accent)' : 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition)',
                  }}
                >
                  {sw}
                </button>
              ))}
            </div>
          </div>

          {/* Budget range */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              {t.budgetRange}
            </label>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            >
              {Object.entries(t.budgetOptions).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Deadline */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              {t.deadline}
            </label>
            <input
              type="date"
              className="inputField"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{ margin: 0 }}
            />
          </div>

          {/* Deliverables */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
              {t.deliverables}
            </label>
            {Object.entries(t.deliverableOptions).map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={selectedDeliverables.includes(key)}
                  onChange={() => toggleDeliverable(key)}
                />
                {label}
              </label>
            ))}
          </div>

          <button className="button-block" type="submit">
            {t.submitButton}
          </button>
        </form>
      </div>

      {/* Right panel: order list */}
      <div className="dashboard-right">
        <h3>{t.historyTitle}</h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '40px 20px',
          textAlign: 'center',
        }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: '12px',
            background: 'var(--purple-subtle)',
            color: 'var(--purple)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '16px',
          }}>
            {t.comingSoonBadge}
          </span>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6, fontSize: '0.9rem' }}>
            {t.systemDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
