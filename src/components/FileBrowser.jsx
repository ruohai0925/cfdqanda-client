import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { formatFileSize } from '../utils/fileUtils';

// 多语言字符串
const fileBrowserStrings = {
  zh: {
    title: '文件浏览器',
    close: '关闭',
    loading: '加载中...',
    preview: '文件预览',
    download: '下载',
    downloadFile: '下载文件',
    downloadError: '下载失败',
    loadError: '加载文件失败',
    noPreview: '此文件类型不支持预览，请下载查看',
    empty: '暂无文件',
    fileSize: '文件大小',
    copyText: '复制文本',
    copySuccess: '已复制到剪贴板',
    addFeedback: '添加反馈',
    feedback: '反馈',
    feedbackPlaceholder: '请输入反馈内容（最多5KB）...',
    save: '保存',
    cancelFeedback: '取消',
    feedbackSaved: '已保存',
    feedbackError: '反馈提交失败',
    feedbackTooLarge: '反馈内容超过5KB限制',
    feedbackRequired: '请输入反馈内容',
    feedbackTitle: '文件反馈',
    feedbackFor: '反馈文件',
    caseFeedbackTitle: '整体评价',
    ratingSuccess: '成功',
    ratingPartial: '部分成功',
    ratingFailed: '失败',
    ratingCommentPlaceholder: '一句话评价（可选，最多500字）',
    ratingSaved: '评价已保存',
    ratingError: '评价提交失败',
    openfoamVersion: '生成的文件基于 OpenFOAM v10 (Foundation)，与 ESI 版本可能不兼容',
  },
  en: {
    title: 'File Browser',
    close: 'Close',
    loading: 'Loading...',
    preview: 'File Preview',
    download: 'Download',
    downloadFile: 'Download File',
    downloadError: 'Download failed',
    loadError: 'Failed to load file',
    noPreview: 'This file type cannot be previewed. Please download to view.',
    empty: 'No files',
    fileSize: 'File Size',
    copyText: 'Copy Text',
    copySuccess: 'Copied to clipboard',
    addFeedback: 'Add Feedback',
    feedback: 'Feedback',
    feedbackPlaceholder: 'Enter your feedback (max 5KB)...',
    save: 'Save',
    cancelFeedback: 'Cancel',
    feedbackSaved: 'Saved',
    feedbackError: 'Failed to submit feedback',
    feedbackTooLarge: 'Feedback exceeds 5KB limit',
    feedbackRequired: 'Please enter feedback content',
    feedbackTitle: 'File Feedback',
    feedbackFor: 'Feedback for',
    caseFeedbackTitle: 'Overall Rating',
    ratingSuccess: 'Success',
    ratingPartial: 'Partial',
    ratingFailed: 'Failed',
    ratingCommentPlaceholder: 'One-line comment (optional, max 500 chars)',
    ratingSaved: 'Rating saved',
    ratingError: 'Failed to submit rating',
    openfoamVersion: 'Generated files are based on OpenFOAM v10 (Foundation), may not be compatible with ESI version',
  }
};

export default function FileBrowser({ jobId, accessToken, fileTree, storageBasePath, language, onClose, apiUrl, userRating, userComment }) {
  const [expandedDirs, setExpandedDirs] = useState(new Set(['output'])); // 默认展开output目录
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackFile, setFeedbackFile] = useState(null);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [savedFeedbackFiles, setSavedFeedbackFiles] = useState(new Set());

  // Rating panel state (always visible, initialized from props)
  const [selectedRating, setSelectedRating] = useState(userRating || null);
  const [ratingComment, setRatingComment] = useState(userComment || '');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSaved, setRatingSaved] = useState(!!userRating);
  
  // 拖拽状态
  const [fileBrowserPosition, setFileBrowserPosition] = useState({ x: 0, y: 0 });
  const [feedbackModalPosition, setFeedbackModalPosition] = useState({ x: 0, y: 0 });
  const [isDraggingBrowser, setIsDraggingBrowser] = useState(false);
  const [isDraggingFeedback, setIsDraggingFeedback] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const t = fileBrowserStrings[language] || fileBrowserStrings.en;
  const [fileTreeData, setFileTreeData] = useState(null);

  // 构建目录树
  useEffect(() => {
    if (!fileTree) {
      setFileTreeData(null);
      return;
    }

    const tree = {};
    
    // 处理目录
    if (fileTree.directories) {
      fileTree.directories.forEach(dir => {
        const parts = dir.path.split('/');
        let current = tree;
        parts.forEach((part) => {
          if (!current[part]) {
            current[part] = {
              type: 'directory',
              name: part,
              path: dir.path,
              children: {}
            };
          }
          current = current[part].children;
        });
      });
    }
    
    // 处理文件
    if (fileTree.files) {
      fileTree.files.forEach(file => {
        const parts = file.path.split('/');
        const fileName = parts.pop();
        const dirPath = parts.join('/');
        
        if (dirPath === '') {
          // 根目录文件
          tree[fileName] = {
            type: 'file',
            ...file
          };
        } else {
          // 子目录文件
          const dirParts = dirPath.split('/');
          let current = tree;
          dirParts.forEach(part => {
            if (!current[part]) {
              current[part] = {
                type: 'directory',
                name: part,
                path: dirPath,
                children: {}
              };
            }
            current = current[part].children;
          });
          current[fileName] = {
            type: 'file',
            ...file
          };
        }
      });
    }
    
    setFileTreeData(tree);
  }, [fileTree]);

  // 切换目录展开状态
  const toggleDirectory = (path) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedDirs(newExpanded);
  };

  // 加载文件内容
  const loadFileContent = async (filePath) => {
    setLoading(true);
    setSelectedFile(filePath);
    setFileContent(null);
    
    try {
      const storagePath = `${storageBasePath}/${filePath}`;
      const { data, error } = await supabase.storage
        .from('simulation_results')
        .download(storagePath);
      
      if (error) throw error;
      
      // 默认尝试将所有文件都作为文本文件读取
      try {
        const text = await data.text();
        
        // 检查是否包含不可打印字符（二进制文件的特征）
        // 排除常见的文本控制字符：\n (0x0A), \r (0x0D), \t (0x09)
        // eslint-disable-next-line no-control-regex
        const binaryCharPattern = /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\xFF]/g;
        const binaryMatches = text.match(binaryCharPattern);
        
        if (binaryMatches && text.length > 0) {
          // 如果二进制字符超过总字符数的1%，可能是二进制文件
          const binaryRatio = binaryMatches.length / text.length;
          if (binaryRatio > 0.01) {
            throw new Error('Binary file detected');
          }
        }
        
        setFileContent(text);
      } catch (textError) {
        // 无法作为文本读取，可能是二进制文件
        console.warn('File cannot be read as text:', textError);
        setFileContent(null);
        // 只有在确实检测到是二进制文件时才显示提示
        if (textError.message === 'Binary file detected') {
          toast(t.noPreview);
        }
      }
    } catch (error) {
      console.error('Error loading file:', error);
      toast.error(t.loadError);
      setFileContent(null);
    } finally {
      setLoading(false);
    }
  };

  // 下载文件
  const downloadFile = async (filePath, fileName) => {
    try {
      const storagePath = `${storageBasePath}/${filePath}`;
      const { data, error } = await supabase.storage
        .from('simulation_results')
        .download(storagePath);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || filePath.split('/').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(t.download);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(t.downloadError);
    }
  };

  // 打开反馈模态框
  const openFeedbackModal = (filePath, fileName) => {
    setFeedbackFile({ path: filePath, name: fileName });
    setFeedbackContent('');
    setShowFeedbackModal(true);
  };

  // 关闭反馈模态框
  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackFile(null);
    setFeedbackContent('');
    setFeedbackModalPosition({ x: 0, y: 0 }); // 重置位置
  };

  // 文件浏览器拖拽处理
  const handleBrowserMouseDown = (e) => {
    if (e.target.closest('.file-browser-close')) return; // 不允许拖拽关闭按钮
    setIsDraggingBrowser(true);
    setDragStart({
      x: e.clientX - fileBrowserPosition.x,
      y: e.clientY - fileBrowserPosition.y
    });
  };

  // 反馈模态框拖拽处理
  const handleFeedbackMouseDown = (e) => {
    if (e.target.closest('.feedback-modal-close')) return; // 不允许拖拽关闭按钮
    setIsDraggingFeedback(true);
    setDragStart({
      x: e.clientX - feedbackModalPosition.x,
      y: e.clientY - feedbackModalPosition.y
    });
  };

  // 全局鼠标事件监听
  useEffect(() => {
    if (isDraggingBrowser) {
      const handleMove = (e) => {
        setFileBrowserPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      };
      const handleUp = () => {
        setIsDraggingBrowser(false);
      };
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
    }
  }, [isDraggingBrowser, dragStart]);

  useEffect(() => {
    if (isDraggingFeedback) {
      const handleMove = (e) => {
        setFeedbackModalPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      };
      const handleUp = () => {
        setIsDraggingFeedback(false);
      };
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
    }
  }, [isDraggingFeedback, dragStart]);

  // 提交反馈
  const submitFeedback = async () => {
    if (!feedbackContent.trim()) {
      toast.error(t.feedbackRequired);
      return;
    }

    // 检查文件大小（5KB = 5120字节）
    const contentSize = new Blob([feedbackContent]).size;
    if (contentSize > 5120) {
      toast.error(t.feedbackTooLarge);
      return;
    }

    setSubmittingFeedback(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/simulations/${jobId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          file_path: feedbackFile.path,
          feedback_content: feedbackContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t.feedbackError);
      }

      toast.success(t.feedbackSaved);
      setSavedFeedbackFiles(prev => new Set(prev).add(feedbackFile.path));
      closeFeedbackModal();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || t.feedbackError);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Submit rating to API (save, not close)
  const submitRating = async () => {
    if (!selectedRating) return;

    setSubmittingRating(true);
    try {
      const body = { rating: selectedRating };
      if (ratingComment.trim()) {
        body.comment = ratingComment.trim();
      }

      const response = await fetch(`${apiUrl}/api/v1/simulations/${jobId}/rating`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t.ratingError);
      }

      toast.success(t.ratingSaved);
      setRatingSaved(true);
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error(error.message || t.ratingError);
    } finally {
      setSubmittingRating(false);
    }
  };

  // 渲染文件树节点
  const renderTreeNode = (node, path = '', level = 0) => {
    const entries = Object.entries(node).sort(([a], [b]) => {
      // 目录在前，文件在后
      const aIsDir = node[a].type === 'directory';
      const bIsDir = node[b].type === 'directory';
      if (aIsDir !== bIsDir) return aIsDir ? -1 : 1;
      return a.localeCompare(b);
    });

    return (
      <ul className="file-tree" style={{ paddingLeft: level > 0 ? '20px' : '0' }}>
        {entries.map(([name, item]) => {
          const fullPath = path ? `${path}/${name}` : name;
          
          if (item.type === 'directory') {
            const isExpanded = expandedDirs.has(item.path);
            return (
              <li key={fullPath} className="file-tree-item directory">
                <div
                  className="file-tree-node"
                  onClick={() => toggleDirectory(item.path)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="file-tree-icon">
                    {isExpanded ? '📂' : '📁'}
                  </span>
                  <span className="file-tree-name">{name}</span>
                </div>
                {isExpanded && item.children && (
                  <div className="file-tree-children">
                    {renderTreeNode(item.children, item.path, level + 1)}
                  </div>
                )}
              </li>
            );
          } else {
            return (
              <li key={fullPath} className="file-tree-item file">
                <div className="file-tree-node">
                  <span className="file-tree-icon">📄</span>
                  <span
                    className="file-tree-name"
                    onClick={() => loadFileContent(item.path)}
                    style={{ cursor: 'pointer', color: '#6200ea' }}
                  >
                    {name}
                  </span>
                  <span className="file-tree-size">{formatFileSize(item.size)}</span>
                  {savedFeedbackFiles.has(item.path) && (
                    <span className="file-saved-indicator" title={t.feedbackSaved}>&#x2705;</span>
                  )}
                  <button
                    className={`file-feedback-btn${savedFeedbackFiles.has(item.path) ? ' saved' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openFeedbackModal(item.path, item.name);
                    }}
                    title={t.addFeedback}
                  >
                    &#x1F4AC;
                  </button>
                  <button
                    className="file-download-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFile(item.path, item.name);
                    }}
                    title={t.downloadFile}
                  >
                    ⬇️
                  </button>
                </div>
              </li>
            );
          }
        })}
      </ul>
    );
  };

  return (
    <div
      className="file-browser-modal-overlay"
      onClick={(e) => {
        // 如果反馈模态框打开，点击overlay时只关闭反馈模态框，不关闭文件浏览器
        if (showFeedbackModal) {
          e.stopPropagation();
          closeFeedbackModal();
        } else {
          onClose();
        }
      }}
    >
      <div 
        className="file-browser-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translate(${fileBrowserPosition.x}px, ${fileBrowserPosition.y}px)`,
          cursor: isDraggingBrowser ? 'grabbing' : 'default'
        }}
      >
        <div 
          className="file-browser-header"
          onMouseDown={handleBrowserMouseDown}
          style={{ cursor: 'grab' }}
        >
          <h2>{t.title} - Task #{jobId}</h2>
          <button className="file-browser-close" onClick={onClose}>
            {t.close}
          </button>
        </div>
        
        <div className="openfoam-version-notice">
          ⚠ {t.openfoamVersion}
        </div>

        <div className="file-browser-content">
          <div 
            className="file-browser-sidebar"
            onClick={(e) => e.stopPropagation()} // 阻止点击事件传播到overlay
            onMouseDown={(e) => e.stopPropagation()} // 阻止mousedown事件传播
          >
            <h3>文件列表</h3>
            {fileTreeData ? (
              renderTreeNode(fileTreeData)
            ) : (
              <p className="file-browser-empty">{t.empty}</p>
            )}
          </div>
          
          <div 
            className="file-browser-preview"
            onClick={(e) => e.stopPropagation()} // 阻止点击事件传播到overlay
            onMouseDown={(e) => e.stopPropagation()} // 阻止mousedown事件传播
          >
            <h3>{t.preview}</h3>
            {loading ? (
              <div className="file-browser-loading">{t.loading}</div>
            ) : selectedFile ? (
              <div className="file-preview-content">
                <div className="file-preview-header">
                  <strong>{selectedFile}</strong>
                  {fileContent && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="copy-text-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(fileContent);
                          toast.success(t.copySuccess);
                        }}
                      >
                        {t.copyText}
                      </button>
                      <button
                        className="file-download-btn"
                        onClick={() => downloadFile(selectedFile, selectedFile.split('/').pop())}
                      >
                        {t.download}
                      </button>
                    </div>
                  )}
                </div>
                {fileContent ? (
                  <pre className="file-preview-text">{fileContent}</pre>
                ) : (
                  <p>{t.noPreview}</p>
                )}
              </div>
            ) : (
              <p className="file-browser-empty">Please select a file</p>
            )}
          </div>
        </div>

        {/* Overall rating panel — always visible at the bottom */}
        <div className="rating-panel">
          <div className="rating-panel-title">
            {t.caseFeedbackTitle}
            {ratingSaved && <span className="rating-saved-indicator"> &#x2705; {t.ratingSaved}</span>}
          </div>
          <div className="rating-panel-body">
            <div className="rating-buttons">
              <button
                className={`rating-btn rating-btn-success ${selectedRating === 1 ? 'rating-btn-selected' : ''}`}
                onClick={() => { setSelectedRating(1); setRatingSaved(false); }}
              >
                {t.ratingSuccess}
              </button>
              <button
                className={`rating-btn rating-btn-partial ${selectedRating === 2 ? 'rating-btn-selected' : ''}`}
                onClick={() => { setSelectedRating(2); setRatingSaved(false); }}
              >
                {t.ratingPartial}
              </button>
              <button
                className={`rating-btn rating-btn-failed ${selectedRating === 3 ? 'rating-btn-selected' : ''}`}
                onClick={() => { setSelectedRating(3); setRatingSaved(false); }}
              >
                {t.ratingFailed}
              </button>
            </div>
            <input
              type="text"
              className="rating-comment-input"
              placeholder={t.ratingCommentPlaceholder}
              value={ratingComment}
              onChange={(e) => { setRatingComment(e.target.value); setRatingSaved(false); }}
              maxLength={500}
            />
            <button
              className="rating-submit-btn"
              onClick={submitRating}
              disabled={submittingRating || !selectedRating}
            >
              {submittingRating ? '...' : t.save}
            </button>
          </div>
        </div>
      </div>

      {/* 反馈模态框 */}
      {showFeedbackModal && feedbackFile && (
        <div 
          className="feedback-modal-overlay" 
          onClick={(e) => {
            // 点击反馈模态框的overlay时，只关闭反馈模态框，不关闭文件浏览器
            if (e.target === e.currentTarget) {
              e.stopPropagation(); // 阻止事件传播到文件浏览器的overlay
              closeFeedbackModal();
            }
          }}
          onMouseDown={(e) => {
            // 阻止mousedown事件传播，避免触发文件浏览器的关闭
            e.stopPropagation();
          }}
        >
          <div 
            className="feedback-modal" 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              transform: `translate(${feedbackModalPosition.x}px, ${feedbackModalPosition.y}px)`,
              cursor: isDraggingFeedback ? 'grabbing' : 'default'
            }}
          >
            <div 
              className="feedback-modal-header"
              onMouseDown={handleFeedbackMouseDown}
              style={{ cursor: 'grab' }}
            >
              <h3>{t.feedbackTitle}</h3>
              <button className="feedback-modal-close" onClick={closeFeedbackModal}>
                ×
              </button>
            </div>
            <div className="feedback-modal-body">
              <div className="feedback-file-info">
                <strong>{t.feedbackFor}:</strong> {feedbackFile.name}
              </div>
              <textarea
                className="feedback-textarea"
                placeholder={t.feedbackPlaceholder}
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                rows={10}
                maxLength={5120}
              />
              <div className="feedback-char-count">
                {new Blob([feedbackContent]).size} / 5120 bytes
              </div>
            </div>
            <div className="feedback-modal-footer">
              <button
                className="feedback-cancel-btn"
                onClick={closeFeedbackModal}
                disabled={submittingFeedback}
              >
                {t.cancelFeedback}
              </button>
              <button
                className="feedback-submit-btn"
                onClick={submitFeedback}
                disabled={submittingFeedback || !feedbackContent.trim()}
              >
                {submittingFeedback ? t.loading : t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

