import { useState } from 'react';
import toast from 'react-hot-toast';

// --- Common timezone options ---
const TIMEZONE_OPTIONS = [
  { value: 'Asia/Shanghai', label: 'CST (UTC+8) 北京/上海' },
  { value: 'Asia/Tokyo', label: 'JST (UTC+9) 东京' },
  { value: 'Asia/Kolkata', label: 'IST (UTC+5:30) 印度' },
  { value: 'Europe/London', label: 'GMT/BST (UTC+0/+1) 伦敦' },
  { value: 'Europe/Berlin', label: 'CET/CEST (UTC+1/+2) 柏林' },
  { value: 'America/New_York', label: 'EST/EDT (UTC-5/-4) 纽约' },
  { value: 'America/Chicago', label: 'CST/CDT (UTC-6/-5) 芝加哥' },
  { value: 'America/Los_Angeles', label: 'PST/PDT (UTC-8/-7) 洛杉矶' },
];

// Generate hour options 00:00 - 23:00
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0');
  return { value: `${h}:00`, label: `${h}:00` };
});

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
      under500: '¥500 以下',
      '500-1000': '¥500 - ¥1,000',
      '1000-3000': '¥1,000 - ¥3,000',
      '3000-5000': '¥3,000 - ¥5,000',
      above5000: '¥5,000 以上',
    },
    meetingTimes: '第一次三方会议时间',
    meetingTimesHint: '最多设置 3 个备选时间，方便接单者和组织者选择',
    meetingDate: '日期',
    meetingTimezone: '时区',
    meetingStart: '开始',
    meetingEnd: '结束',
    addMeetingTime: '+ 添加备选时间',
    removeMeetingTime: '移除',
    meetingOption: '备选',
    meetingEndBeforeStart: '结束时间必须晚于开始时间至少 1 小时',
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
      under500: 'Under ¥500',
      '500-1000': '¥500 - ¥1,000',
      '1000-3000': '¥1,000 - ¥3,000',
      '3000-5000': '¥3,000 - ¥5,000',
      above5000: 'Above ¥5,000',
    },
    meetingTimes: 'First 3-Party Meeting Time',
    meetingTimesHint: 'Set up to 3 options for the expert and organizer to choose from',
    meetingDate: 'Date',
    meetingTimezone: 'Timezone',
    meetingStart: 'Start',
    meetingEnd: 'End',
    addMeetingTime: '+ Add Option',
    removeMeetingTime: 'Remove',
    meetingOption: 'Option',
    meetingEndBeforeStart: 'End time must be at least 1 hour after start time',
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

const SOFTWARE_OPTIONS = ['OpenFOAM', 'FLUENT', 'STAR-CCM+'];

const DEFAULT_MEETING_SLOT = () => ({
  date: '',
  timezone: 'Asia/Shanghai',
  startTime: '09:00',
  endTime: '10:00',
});

export default function ExpertOrderTab({ language }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSoftware, setSelectedSoftware] = useState([]);
  const [budgetRange, setBudgetRange] = useState('under500');
  const [meetingSlots, setMeetingSlots] = useState([DEFAULT_MEETING_SLOT()]);
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

  const updateMeetingSlot = (index, field, value) => {
    setMeetingSlots((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addMeetingSlot = () => {
    if (meetingSlots.length < 3) {
      setMeetingSlots((prev) => [...prev, DEFAULT_MEETING_SLOT()]);
    }
  };

  const removeMeetingSlot = (index) => {
    setMeetingSlots((prev) => prev.filter((_, i) => i !== index));
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
    // Validate meeting times: end must be at least 1 hour after start
    for (const slot of meetingSlots) {
      if (slot.date) {
        const startH = parseInt(slot.startTime.split(':')[0], 10);
        const endH = parseInt(slot.endTime.split(':')[0], 10);
        if (endH <= startH) {
          toast.error(t.meetingEndBeforeStart);
          return;
        }
      }
    }
    toast(t.comingSoonToast, { icon: '🚧' });
  };

  const fieldLabel = { display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 };
  const subLabel = { fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 };

  return (
    <div className="dashboard-layout">
      {/* Left panel: order submission form */}
      <div className="dashboard-left">
        <h3>{t.formTitle}</h3>
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '14px' }}>
            <label style={fieldLabel}>{t.orderTitle}</label>
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
            <label style={fieldLabel}>{t.orderDescription}</label>
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
            <label style={{ ...fieldLabel, marginBottom: '6px' }}>{t.softwarePreference}</label>
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
            <label style={fieldLabel}>{t.budgetRange}</label>
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

          {/* Meeting times */}
          <div style={{ marginBottom: '14px' }}>
            <label style={fieldLabel}>{t.meetingTimes}</label>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
              {t.meetingTimesHint}
            </p>

            {meetingSlots.map((slot, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px',
                  marginBottom: '8px',
                  background: 'var(--bg-tertiary)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)' }}>
                    {t.meetingOption} {index + 1}
                  </span>
                  {meetingSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMeetingSlot(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        padding: '2px 6px',
                      }}
                    >
                      {t.removeMeetingTime}
                    </button>
                  )}
                </div>

                {/* Date */}
                <div style={{ marginBottom: '6px' }}>
                  <label style={subLabel}>{t.meetingDate}</label>
                  <input
                    type="date"
                    className="inputField"
                    value={slot.date}
                    onChange={(e) => updateMeetingSlot(index, 'date', e.target.value)}
                    style={{ margin: 0, width: '100%' }}
                  />
                </div>

                {/* Timezone */}
                <div style={{ marginBottom: '6px' }}>
                  <label style={subLabel}>{t.meetingTimezone}</label>
                  <select
                    value={slot.timezone}
                    onChange={(e) => updateMeetingSlot(index, 'timezone', e.target.value)}
                    style={{ width: '100%', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  >
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                {/* Start / End time row */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={subLabel}>{t.meetingStart}</label>
                    <select
                      value={slot.startTime}
                      onChange={(e) => updateMeetingSlot(index, 'startTime', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    >
                      {HOUR_OPTIONS.map((h) => (
                        <option key={h.value} value={h.value}>{h.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={subLabel}>{t.meetingEnd}</label>
                    <select
                      value={slot.endTime}
                      onChange={(e) => updateMeetingSlot(index, 'endTime', e.target.value)}
                      style={{ width: '100%', padding: '6px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    >
                      {HOUR_OPTIONS.map((h) => (
                        <option key={h.value} value={h.value}>{h.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {meetingSlots.length < 3 && (
              <button
                type="button"
                onClick={addMeetingSlot}
                style={{
                  background: 'none',
                  border: '1px dashed var(--border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  padding: '6px 12px',
                  width: '100%',
                  transition: 'all var(--transition)',
                }}
              >
                {t.addMeetingTime}
              </button>
            )}
          </div>

          {/* Deliverables */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ ...fieldLabel, marginBottom: '6px' }}>{t.deliverables}</label>
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
