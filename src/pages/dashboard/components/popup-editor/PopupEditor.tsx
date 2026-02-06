'use client';

import { useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { useLandingContext } from '../../context';
import { FONTS, LANGUAGES } from '../../constants';
import type { Popup, PopupChildElement, PopupTextElement, PopupImageElement } from '../../types';
import styles from './PopupEditor.module.scss';

interface PopupEditorProps {
  popup: Popup;
  onClose: () => void;
}

function PopupElementRenderer({
  popup,
  element,
  isEditing,
  setEditingElementId,
  onDrag,
  onDragStop: onDragStopGuide,
}: {
  popup: Popup;
  element: PopupChildElement;
  isEditing: boolean;
  setEditingElementId: (id: number | null) => void;
  onDrag: (x: number, y: number, elW: number, elH: number) => void;
  onDragStop: () => void;
}) {
  const {
    activeView,
    activeLang,
    updatePopupElementStyles,
    updatePopupElementContent,
    deletePopupElement,
  } = useLandingContext();

  const est = element.styles[activeView];

  const handleDragStop = (_: unknown, d: { x: number; y: number }) => {
    onDragStopGuide();
    updatePopupElementStyles(popup.id, element.id, {
      ...element.styles,
      [activeView]: { ...est, x: d.x, y: d.y },
    });
  };

  const handleResizeStop = (
    _: unknown,
    __: unknown,
    ref: HTMLElement,
    ___: unknown,
    pos: { x: number; y: number }
  ) => {
    updatePopupElementStyles(popup.id, element.id, {
      ...element.styles,
      [activeView]: {
        ...est,
        width: ref.offsetWidth,
        height: ref.offsetHeight,
        ...pos,
      },
    });
  };

  return (
    <Rnd
      size={{ width: est.width, height: est.height }}
      position={{ x: est.x, y: est.y }}
      bounds="parent"
      disableDragging={isEditing}
      onDrag={(_e, d) => onDrag(d.x, d.y, est.width, est.height)}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      style={{
        zIndex: est.zIndex || 1,
        border: isEditing ? '2px solid #667eea' : '1px dashed rgba(255,255,255,0.3)',
        borderRadius: element.type === 'image' ? `${(est as PopupImageElement['styles']['WEB']).borderRadius}px` : '4px',
        boxShadow: isEditing ? '0 0 10px rgba(102, 126, 234, 0.5)' : 'none',
      }}
    >
      <div
        style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
        onClick={(e) => {
          e.stopPropagation();
          setEditingElementId(element.id);
        }}
      >
        {/* Edit/Delete controls */}
        {isEditing && (
          <div className={styles.elementControls}>
            <button
              className={styles.deleteElementBtn}
              onClick={(e) => {
                e.stopPropagation();
                deletePopupElement(popup.id, element.id);
                setEditingElementId(null);
              }}
            >
              X
            </button>
          </div>
        )}

        {element.type === 'text' ? (
          <div
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => {
              updatePopupElementContent(popup.id, element.id, e.currentTarget.innerHTML);
            }}
            style={{
              fontSize: `${(est as PopupTextElement['styles']['WEB']).fontSize}px`,
              fontFamily: (est as PopupTextElement['styles']['WEB']).fontFamily,
              color: (est as PopupTextElement['styles']['WEB']).color,
              textShadow: (est as PopupTextElement['styles']['WEB']).textShadow || 'none',
              textAlign: (est as PopupTextElement['styles']['WEB']).textAlign || 'left',
              outline: 'none',
              width: '100%',
              height: '100%',
              cursor: isEditing ? 'text' : 'move',
              padding: '4px',
              boxSizing: 'border-box',
            }}
            dangerouslySetInnerHTML={{ __html: element.content[activeLang] || '' }}
          />
        ) : (
          <img
            src={element.content[activeLang] || ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: `${(est as PopupImageElement['styles']['WEB']).borderRadius || 0}px`,
              cursor: 'move',
            }}
            draggable={false}
            alt=""
          />
        )}
      </div>
    </Rnd>
  );
}

export function PopupEditor({ popup, onClose }: PopupEditorProps) {
  const {
    activeView,
    activeLang,
    setActiveLang,
    updatePopupStyle,
    updatePopupTitle,
    setPopupSameForAllLangs,
    addPopupElement,
    updatePopupElementStyle,
    updatePopupElementContent,
    updateCloseButtonStyle,
    setCloseButtonUseImage,
    updateCloseButtonImage,
  } = useLandingContext();

  const langLabel = popup.sameForAllLangs ? 'All' : activeLang;

  const [editingElementId, setEditingElementId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'elements' | 'style' | 'closeBtn'>('elements');
  const [showCenterGuideV, setShowCenterGuideV] = useState(false);
  const [showCenterGuideH, setShowCenterGuideH] = useState(false);

  const pst = popup.styles[activeView];
  const closeBtn = popup.closeButton;
  const closeBtnStyle = closeBtn.styles[activeView];
  const editingElement = popup.children.find((c) => c.id === editingElementId);

  const checkCenterAlignment = useCallback(
    (x: number, y: number, elW: number, elH: number) => {
      const elCenterX = x + elW / 2;
      const parentCenterX = pst.width / 2;
      setShowCenterGuideV(Math.abs(elCenterX - parentCenterX) < 6);

      const elCenterY = y + elH / 2;
      const parentCenterY = pst.height / 2;
      setShowCenterGuideH(Math.abs(elCenterY - parentCenterY) < 6);
    },
    [pst.width, pst.height]
  );

  const clearCenterGuides = useCallback(() => {
    setShowCenterGuideV(false);
    setShowCenterGuideH(false);
  }, []);

  const handleCloseButtonImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = () => updateCloseButtonImage(popup.id, r.result as string);
      r.readAsDataURL(f);
    }
  };

  const handleElementImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingElement || editingElement.type !== 'image') return;
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = () => updatePopupElementContent(popup.id, editingElement.id, r.result as string);
      r.readAsDataURL(f);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.editor} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <input
            type="text"
            className={styles.titleInput}
            value={popup.title}
            onChange={(e) => updatePopupTitle(popup.id, e.target.value)}
          />
          <div className={styles.langTabs}>
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                className={`${styles.langTab} ${activeLang === lang ? styles['langTab--active'] : ''}`}
                onClick={() => setActiveLang(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
          <button className={styles.closeEditorBtn} onClick={onClose}>
            X
          </button>
        </div>

        <div className={styles.content}>
          {/* Left - Preview */}
          <div className={styles.previewArea}>
            <div className={styles.previewLabel}>Preview ({activeView})</div>
            <div
              className={styles.popupPreview}
              style={{
                width: `${pst.width}px`,
                height: `${pst.height}px`,
                backgroundColor: pst.backgroundImage ? 'transparent' : pst.backgroundColor,
                backgroundImage: pst.backgroundImage ? `url(${pst.backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: `${pst.borderRadius}px`,
                border: pst.borderWidth > 0 ? `${pst.borderWidth}px solid ${pst.borderColor}` : 'none',
                overflow: 'visible',
              }}
              onClick={() => setEditingElementId(null)}
            >
              {/* Vertical center guide */}
              {showCenterGuideV && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: '50%',
                    width: '2px',
                    backgroundColor: '#ff00ff',
                    pointerEvents: 'none',
                    zIndex: 999,
                    transform: 'translateX(-1px)',
                  }}
                />
              )}
              {/* Horizontal center guide */}
              {showCenterGuideH && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: '50%',
                    height: '2px',
                    backgroundColor: '#ff00ff',
                    pointerEvents: 'none',
                    zIndex: 999,
                    transform: 'translateY(-1px)',
                  }}
                />
              )}

              {/* Close button preview — draggable + resizable, can go outside popup */}
              <Rnd
                size={{ width: closeBtnStyle.width, height: closeBtnStyle.height }}
                position={{
                  x: closeBtnStyle.x === -1 ? pst.width - closeBtnStyle.width - 10 : closeBtnStyle.x,
                  y: closeBtnStyle.x === -1 ? 10 : closeBtnStyle.y,
                }}
                onDragStop={(_e, d) => {
                  updateCloseButtonStyle(popup.id, 'x', Math.round(d.x));
                  updateCloseButtonStyle(popup.id, 'y', Math.round(d.y));
                }}
                onResizeStop={(_e, _dir, ref, _delta, pos) => {
                  updateCloseButtonStyle(popup.id, 'width', ref.offsetWidth);
                  updateCloseButtonStyle(popup.id, 'height', ref.offsetHeight);
                  updateCloseButtonStyle(popup.id, 'x', Math.round(pos.x));
                  updateCloseButtonStyle(popup.id, 'y', Math.round(pos.y));
                }}
                style={{ zIndex: 100 }}
                minWidth={16}
                minHeight={16}
              >
                <div
                  className={styles.closeButtonPreview}
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: closeBtn.useImage ? 'transparent' : closeBtnStyle.backgroundColor,
                    color: closeBtnStyle.color,
                    borderRadius: `${closeBtnStyle.borderRadius}px`,
                    fontSize: `${closeBtnStyle.fontSize}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'move',
                    overflow: 'hidden',
                  }}
                >
                  {closeBtn.useImage && closeBtn.image[activeLang] ? (
                    <img
                      src={closeBtn.image[activeLang]}
                      alt="close"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    'X'
                  )}
                </div>
              </Rnd>

              {/* Popup elements */}
              {popup.children.map((child) => (
                <PopupElementRenderer
                  key={child.id}
                  popup={popup}
                  element={child}
                  isEditing={editingElementId === child.id}
                  setEditingElementId={setEditingElementId}
                  onDrag={checkCenterAlignment}
                  onDragStop={clearCenterGuides}
                />
              ))}
            </div>
          </div>

          {/* Right - Settings */}
          <div className={styles.settingsArea}>
            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'elements' ? styles['tab--active'] : ''}`}
                onClick={() => setActiveTab('elements')}
              >
                Elements
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'style' ? styles['tab--active'] : ''}`}
                onClick={() => setActiveTab('style')}
              >
                Style
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'closeBtn' ? styles['tab--active'] : ''}`}
                onClick={() => setActiveTab('closeBtn')}
              >
                Close Btn
              </button>
            </div>

            <div className={styles.tabContent}>
              {/* Elements Tab */}
              {activeTab === 'elements' && (
                <>
                  <div className={styles.toggleRow}>
                    <span>Same for all languages</span>
                    <button
                      className={`${styles.toggle} ${popup.sameForAllLangs ? styles['toggle--active'] : ''}`}
                      onClick={() => setPopupSameForAllLangs(popup.id, !popup.sameForAllLangs)}
                    />
                  </div>

                  <div className={styles.addButtons}>
                    <button
                      className={styles.addTextBtn}
                      onClick={() => addPopupElement(popup.id, 'text')}
                    >
                      + Text
                    </button>
                    <button
                      className={styles.addImageBtn}
                      onClick={() => addPopupElement(popup.id, 'image')}
                    >
                      + Image
                    </button>
                  </div>

                  {editingElement ? (
                    <div className={styles.elementSettings}>
                      <div className={styles.settingsTitle}>
                        {editingElement.type === 'text' ? 'Text Element' : 'Image Element'}
                      </div>

                      {editingElement.type === 'text' ? (
                        <>
                          <div className={styles.field}>
                            <label>Font Size / Color</label>
                            <div className={styles.fieldRow}>
                              <input
                                type="number"
                                className={styles.inputSmall}
                                value={(editingElement.styles[activeView] as PopupTextElement['styles']['WEB']).fontSize}
                                onChange={(e) =>
                                  updatePopupElementStyle(popup.id, editingElement.id, 'fontSize', Number(e.target.value))
                                }
                              />
                              <input
                                type="color"
                                className={styles.colorInput}
                                value={(editingElement.styles[activeView] as PopupTextElement['styles']['WEB']).color}
                                onChange={(e) =>
                                  updatePopupElementStyle(popup.id, editingElement.id, 'color', e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <div className={styles.field}>
                            <label>Font Family</label>
                            <select
                              className={styles.select}
                              value={(editingElement.styles[activeView] as PopupTextElement['styles']['WEB']).fontFamily}
                              onChange={(e) =>
                                updatePopupElementStyle(popup.id, editingElement.id, 'fontFamily', e.target.value)
                              }
                            >
                              {FONTS.map((f) => (
                                <option key={f} value={f}>
                                  {f}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className={styles.field}>
                            <label>Text Align</label>
                            <div className={styles.fieldRow}>
                              {(['left', 'center', 'right'] as const).map((align) => (
                                <button
                                  key={align}
                                  className={styles.alignBtn}
                                  style={{
                                    background:
                                      ((editingElement.styles[activeView] as PopupTextElement['styles']['WEB']).textAlign || 'left') === align
                                        ? 'rgba(102, 126, 234, 0.4)'
                                        : 'rgba(255, 255, 255, 0.06)',
                                    borderColor:
                                      ((editingElement.styles[activeView] as PopupTextElement['styles']['WEB']).textAlign || 'left') === align
                                        ? '#667eea'
                                        : 'rgba(255, 255, 255, 0.1)',
                                  }}
                                  onClick={() =>
                                    updatePopupElementStyle(popup.id, editingElement.id, 'textAlign', align)
                                  }
                                >
                                  {align === 'left' && (
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                      <rect x="2" y="3" width="12" height="1.5" rx="0.5" />
                                      <rect x="2" y="7" width="8" height="1.5" rx="0.5" />
                                      <rect x="2" y="11" width="10" height="1.5" rx="0.5" />
                                    </svg>
                                  )}
                                  {align === 'center' && (
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                      <rect x="2" y="3" width="12" height="1.5" rx="0.5" />
                                      <rect x="4" y="7" width="8" height="1.5" rx="0.5" />
                                      <rect x="3" y="11" width="10" height="1.5" rx="0.5" />
                                    </svg>
                                  )}
                                  {align === 'right' && (
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                      <rect x="2" y="3" width="12" height="1.5" rx="0.5" />
                                      <rect x="6" y="7" width="8" height="1.5" rx="0.5" />
                                      <rect x="4" y="11" width="10" height="1.5" rx="0.5" />
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className={styles.field}>
                            <label>Text Shadow</label>
                            <input
                              type="text"
                              className={styles.input}
                              value={(editingElement.styles[activeView] as PopupTextElement['styles']['WEB']).textShadow || ''}
                              onChange={(e) =>
                                updatePopupElementStyle(popup.id, editingElement.id, 'textShadow', e.target.value)
                              }
                              placeholder="2px 2px 4px rgba(0,0,0,0.5)"
                            />
                          </div>
                          <div className={styles.field}>
                            <label>Content ({langLabel})</label>
                            <textarea
                              className={styles.textarea}
                              value={editingElement.content[activeLang] || ''}
                              onChange={(e) =>
                                updatePopupElementContent(popup.id, editingElement.id, e.target.value)
                              }
                            />
                          </div>
                          <div className={styles.field}>
                            <label>Rich Text Tip</label>
                            <p className={styles.helpText}>
                              To color specific words, select text in preview and use browser's format (Ctrl+B for bold, etc.)
                              or write HTML like: &lt;span style="color:red"&gt;text&lt;/span&gt;
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={styles.field}>
                            <label>Image ({langLabel})</label>
                            <input
                              type="file"
                              className={styles.fileInput}
                              onChange={handleElementImageUpload}
                              accept="image/*"
                            />
                            {editingElement.content[activeLang] && (
                              <img
                                src={editingElement.content[activeLang]}
                                alt="preview"
                                className={styles.imagePreview}
                              />
                            )}
                          </div>
                          <div className={styles.field}>
                            <label>Border Radius</label>
                            <input
                              type="number"
                              className={styles.inputSmall}
                              value={(editingElement.styles[activeView] as PopupImageElement['styles']['WEB']).borderRadius}
                              onChange={(e) =>
                                updatePopupElementStyle(popup.id, editingElement.id, 'borderRadius', Number(e.target.value))
                              }
                            />
                          </div>
                        </>
                      )}

                      <div className={styles.field}>
                        <label>Size (W / H)</label>
                        <div className={styles.fieldRow}>
                          <input
                            type="number"
                            className={styles.inputSmall}
                            value={editingElement.styles[activeView].width}
                            onChange={(e) =>
                              updatePopupElementStyle(popup.id, editingElement.id, 'width', Number(e.target.value))
                            }
                          />
                          <input
                            type="number"
                            className={styles.inputSmall}
                            value={editingElement.styles[activeView].height}
                            onChange={(e) =>
                              updatePopupElementStyle(popup.id, editingElement.id, 'height', Number(e.target.value))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.noSelection}>
                      Click on an element in preview to edit it
                    </div>
                  )}
                </>
              )}

              {/* Style Tab */}
              {activeTab === 'style' && (
                <>
                  <div className={styles.field}>
                    <label>Size (W / H)</label>
                    <div className={styles.fieldRow}>
                      <input
                        type="number"
                        className={styles.inputSmall}
                        value={pst.width}
                        onChange={(e) => updatePopupStyle(popup.id, 'width', Number(e.target.value))}
                      />
                      <input
                        type="number"
                        className={styles.inputSmall}
                        value={pst.height}
                        onChange={(e) => updatePopupStyle(popup.id, 'height', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Background: toggle between image and color */}
                  <div className={styles.toggleRow}>
                    <span>Background Image</span>
                    <button
                      className={`${styles.toggle} ${pst.backgroundImage ? styles['toggle--active'] : ''}`}
                      onClick={() => {
                        if (pst.backgroundImage) {
                          updatePopupStyle(popup.id, 'backgroundImage', '');
                        }
                      }}
                    />
                  </div>

                  {pst.backgroundImage ? (
                    <div className={styles.field}>
                      <label>Background Image</label>
                      <input
                        type="file"
                        className={styles.fileInput}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            const r = new FileReader();
                            r.onload = () => updatePopupStyle(popup.id, 'backgroundImage', r.result as string);
                            r.readAsDataURL(f);
                          }
                        }}
                        accept="image/*"
                      />
                      {pst.backgroundImage && (
                        <img
                          src={pst.backgroundImage}
                          alt="bg preview"
                          className={styles.imagePreview}
                        />
                      )}
                      <button
                        className={styles.clearBtn}
                        onClick={() => updatePopupStyle(popup.id, 'backgroundImage', '')}
                        style={{ marginTop: '4px' }}
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className={styles.field}>
                      <label>Background Color</label>
                      <div className={styles.fieldRow}>
                        <input
                          type="color"
                          className={styles.colorInput}
                          value={pst.backgroundColor === 'transparent' ? '#000000' : pst.backgroundColor}
                          onChange={(e) => updatePopupStyle(popup.id, 'backgroundColor', e.target.value)}
                        />
                        <button
                          className={styles.clearBtn}
                          onClick={() => updatePopupStyle(popup.id, 'backgroundColor', 'transparent')}
                        >
                          Clear
                        </button>
                        <button
                          className={styles.clearBtn}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (ev) => {
                              const f = (ev.target as HTMLInputElement).files?.[0];
                              if (f) {
                                const r = new FileReader();
                                r.onload = () => updatePopupStyle(popup.id, 'backgroundImage', r.result as string);
                                r.readAsDataURL(f);
                              }
                            };
                            input.click();
                          }}
                        >
                          Upload Image
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Border Radius (always visible) */}
                  <div className={styles.field}>
                    <label>Border Radius</label>
                    <input
                      type="number"
                      className={styles.inputSmall}
                      value={pst.borderRadius}
                      onChange={(e) => updatePopupStyle(popup.id, 'borderRadius', Number(e.target.value))}
                    />
                  </div>

                  {/* Border toggle */}
                  <div className={styles.toggleRow}>
                    <span>Border</span>
                    <button
                      className={`${styles.toggle} ${pst.borderWidth > 0 ? styles['toggle--active'] : ''}`}
                      onClick={() => {
                        if (pst.borderWidth > 0) {
                          updatePopupStyle(popup.id, 'borderWidth', 0);
                        } else {
                          updatePopupStyle(popup.id, 'borderWidth', 1);
                        }
                      }}
                    />
                  </div>

                  {pst.borderWidth > 0 && (
                    <div className={styles.field}>
                      <label>Border (Width / Color)</label>
                      <div className={styles.fieldRow}>
                        <input
                          type="number"
                          className={styles.inputSmall}
                          value={pst.borderWidth}
                          onChange={(e) => updatePopupStyle(popup.id, 'borderWidth', Number(e.target.value))}
                        />
                        <input
                          type="color"
                          className={styles.colorInput}
                          value={pst.borderColor}
                          onChange={(e) => updatePopupStyle(popup.id, 'borderColor', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Close Button Tab */}
              {activeTab === 'closeBtn' && (
                <>
                  <div className={styles.toggleRow}>
                    <span>Use Image</span>
                    <button
                      className={`${styles.toggle} ${closeBtn.useImage ? styles['toggle--active'] : ''}`}
                      onClick={() => setCloseButtonUseImage(popup.id, !closeBtn.useImage)}
                    />
                  </div>

                  {closeBtn.useImage ? (
                    <div className={styles.field}>
                      <label>Close Button Image ({langLabel})</label>
                      <input
                        type="file"
                        className={styles.fileInput}
                        onChange={handleCloseButtonImageUpload}
                        accept="image/*"
                      />
                      {closeBtn.image[activeLang] && (
                        <img
                          src={closeBtn.image[activeLang]}
                          alt="close btn preview"
                          className={styles.imagePreview}
                        />
                      )}
                    </div>
                  ) : (
                    <>
                      <div className={styles.field}>
                        <label>Background / Text Color</label>
                        <div className={styles.fieldRow}>
                          <input
                            type="color"
                            className={styles.colorInput}
                            value={closeBtnStyle.backgroundColor === 'transparent' ? '#000000' : closeBtnStyle.backgroundColor.replace(/[^#\w]/g, '').slice(0, 7)}
                            onChange={(e) => updateCloseButtonStyle(popup.id, 'backgroundColor', e.target.value)}
                          />
                          <input
                            type="color"
                            className={styles.colorInput}
                            value={closeBtnStyle.color}
                            onChange={(e) => updateCloseButtonStyle(popup.id, 'color', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className={styles.field}>
                        <label>Font Size</label>
                        <input
                          type="number"
                          className={styles.inputSmall}
                          value={closeBtnStyle.fontSize}
                          onChange={(e) => updateCloseButtonStyle(popup.id, 'fontSize', Number(e.target.value))}
                        />
                      </div>
                    </>
                  )}

                  <div className={styles.field}>
                    <label>Size (W / H)</label>
                    <div className={styles.fieldRow}>
                      <input
                        type="number"
                        className={styles.inputSmall}
                        value={closeBtnStyle.width}
                        onChange={(e) => updateCloseButtonStyle(popup.id, 'width', Number(e.target.value))}
                      />
                      <input
                        type="number"
                        className={styles.inputSmall}
                        value={closeBtnStyle.height}
                        onChange={(e) => updateCloseButtonStyle(popup.id, 'height', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>Border Radius</label>
                    <input
                      type="number"
                      className={styles.inputSmall}
                      value={closeBtnStyle.borderRadius}
                      onChange={(e) => updateCloseButtonStyle(popup.id, 'borderRadius', Number(e.target.value))}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Position (drag in preview to move)</label>
                    <div className={styles.fieldRow}>
                      <span style={{ fontSize: '12px', color: '#999' }}>
                        X: {closeBtnStyle.x === -1 ? 'auto' : closeBtnStyle.x}, Y: {closeBtnStyle.x === -1 ? 'auto' : closeBtnStyle.y}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
