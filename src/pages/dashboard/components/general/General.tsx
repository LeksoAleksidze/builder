'use client';

import React, { useState } from 'react';
import styles from './General.module.scss';
import clsx from 'clsx';

const FONTS = [
  'Arial',
  'Helvetica',
  'Inter',
  'BPG Nino Mtavruli',
  'Times New Roman',
  'Courier New',
];

export default function General({
  activeLang,
  setActiveLang,
  activeView,
  setActiveView,
  authStyles,
  setAuthStyles,
  globalBG,
  setGlobalBG,
  sections,
  setSections,
  addSection,
  deleteSection,
  addElement,
  updateElement,
  saveAllConfig,
  setIsPreview,
}: any) {
  const [openStates, setOpenStates] = useState({ bg: true, builder: true });
  const [openSections, setOpenSections] = useState<number[]>([]);

  const updateSectionStyle = (sId: number, field: string, value: any) => {
    setSections((prev: any) =>
      prev.map((s: any) =>
        s.id === sId
          ? {
              ...s,
              styles: {
                ...s.styles,
                [activeView]: { ...s.styles[activeView], [field]: value },
              },
            }
          : s
      )
    );
  };

  const updateElementStyle = (
    sId: number,
    elId: number,
    field: string,
    value: any
  ) => {
    setSections((prev: any) =>
      prev.map((s: any) =>
        s.id === sId
          ? {
              ...s,
              elements: s.elements.map((el: any) =>
                el.id === elId
                  ? {
                      ...el,
                      styles: {
                        ...el.styles,
                        [activeView]: {
                          ...el.styles[activeView],
                          [field]: value,
                        },
                      },
                    }
                  : el
              ),
            }
          : s
      )
    );
  };

  return (
    <div className={styles.general}>
      <div className={styles.general__topControls}>
        <div className={styles.general__tabGroup}>
          {['WEB', 'MOB'].map((v) => (
            <button
              key={v}
              className={clsx(
                styles.general__tab,
                activeView === v && styles['general__tab--active']
              )}
              onClick={() => setActiveView(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <div className={styles.general__tabGroup}>
          {['GE', 'EN', 'RU', 'TR'].map((l) => (
            <button
              key={l}
              className={clsx(
                styles.general__tab,
                activeLang === l && styles['general__tab--active']
              )}
              onClick={() => setActiveLang(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <button className={styles.general__saveBtn} onClick={saveAllConfig}>
        💾 PUBLISH CHANGES
      </button>

      {/* GLOBAL BG */}
      <div className={styles.general__block}>
        <div
          className={styles.general__header}
          onClick={() => setOpenStates({ ...openStates, bg: !openStates.bg })}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {globalBG[activeLang][activeView.toLowerCase()] && (
              <img
                src={globalBG[activeLang][activeView.toLowerCase()]}
                style={{ width: '30px', height: '20px', objectFit: 'cover' }}
              />
            )}
            <h2>Main Background</h2>
          </div>
        </div>
        {openStates.bg && (
          <div className={styles.general__content}>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () =>
                    setGlobalBG({
                      ...globalBG,
                      [activeLang]: {
                        ...globalBG[activeLang],
                        [activeView.toLowerCase()]: reader.result,
                      },
                    });
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* SECTIONS BUILDER */}
      <div className={styles.general__block}>
        <div
          className={styles.general__header}
          onClick={() =>
            setOpenStates({ ...openStates, builder: !openStates.builder })
          }
        >
          <h2>Sections</h2>
        </div>
        {openStates.builder && (
          <div className={styles.general__content}>
            <button
              className={styles.general__addSectionLarge}
              onClick={addSection}
            >
              + Add New Landing Section
            </button>
            {sections.map((s) => {
              const st = s.styles[activeView];
              const isOpened = openSections.includes(s.id);
              return (
                <div key={s.id} className={styles.general__sectionCard}>
                  <div className={styles.general__cardHeader}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flex: 1,
                      }}
                      onClick={() =>
                        setOpenSections((prev) =>
                          prev.includes(s.id)
                            ? prev.filter((i) => i !== s.id)
                            : [...prev, s.id]
                        )
                      }
                    >
                      {st.backgroundImage && (
                        <img
                          src={st.backgroundImage}
                          style={{
                            width: '25px',
                            height: '18px',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                      <strong>{s.title}</strong>
                    </div>
                    <button
                      className={styles.general__delBtn}
                      onClick={() => deleteSection(s.id)}
                    >
                      ×
                    </button>
                  </div>
                  {isOpened && (
                    <div className={styles.general__cardBody}>
                      <div className={styles.general__field}>
                        <label>Dimensions (W / H / Z)</label>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <input
                            type="text"
                            placeholder="Width"
                            value={st.width}
                            onChange={(e) =>
                              updateSectionStyle(s.id, 'width', e.target.value)
                            }
                          />
                          <input
                            type="number"
                            placeholder="Height"
                            value={st.height}
                            onChange={(e) =>
                              updateSectionStyle(
                                s.id,
                                'height',
                                Number(e.target.value)
                              )
                            }
                          />
                          <input
                            type="number"
                            placeholder="Z"
                            value={st.zIndex || 1}
                            onChange={(e) =>
                              updateSectionStyle(
                                s.id,
                                'zIndex',
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.general__field}>
                        <label>Margins (Top / Bottom)</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <input
                            type="number"
                            value={st.marginTop}
                            onChange={(e) =>
                              updateSectionStyle(
                                s.id,
                                'marginTop',
                                Number(e.target.value)
                              )
                            }
                          />
                          <input
                            type="number"
                            value={st.marginBottom}
                            onChange={(e) =>
                              updateSectionStyle(
                                s.id,
                                'marginBottom',
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.general__field}>
                        <label>Border (Width / Color / Radius)</label>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <input
                            type="number"
                            value={st.borderWidth}
                            onChange={(e) =>
                              updateSectionStyle(
                                s.id,
                                'borderWidth',
                                Number(e.target.value)
                              )
                            }
                          />
                          <input
                            type="color"
                            value={st.borderColor}
                            onChange={(e) =>
                              updateSectionStyle(
                                s.id,
                                'borderColor',
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="number"
                            value={st.borderRadius}
                            onChange={(e) =>
                              updateSectionStyle(
                                s.id,
                                'borderRadius',
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.general__field}>
                        <label>Background (Color / Image)</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <input
                            type="color"
                            value={st.backgroundColor}
                            onChange={(e) =>
                              updateSectionStyle(
                                s.id,
                                'backgroundColor',
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () =>
                                  updateSectionStyle(
                                    s.id,
                                    'backgroundImage',
                                    reader.result
                                  );
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className={styles.general__elementAdders}>
                        <button
                          className={styles.addBtnText}
                          onClick={() => addElement(s.id, 'text')}
                        >
                          + Add Text
                        </button>
                        <button
                          className={styles.addBtnImg}
                          onClick={() => addElement(s.id, 'image')}
                        >
                          + Add Image
                        </button>
                      </div>

                      {s.elements.map((el: any) => {
                        const est = el.styles[activeView];
                        return (
                          <div key={el.id} className={styles.general__elItem}>
                            <div className={styles.general__elHeader}>
                              <span>{el.type.toUpperCase()} Element</span>
                            </div>
                            {el.type === 'text' ? (
                              <>
                                <textarea
                                  value={el.content[activeLang]}
                                  onChange={(e) =>
                                    updateElement(s.id, el.id, 'content', {
                                      ...el.content,
                                      [activeLang]: e.target.value,
                                    })
                                  }
                                />
                                <div className={styles.general__field}>
                                  <label>Font / Size / Color</label>
                                  <div style={{ display: 'flex', gap: '3px' }}>
                                    <select
                                      value={est.fontFamily}
                                      onChange={(e) =>
                                        updateElementStyle(
                                          s.id,
                                          el.id,
                                          'fontFamily',
                                          e.target.value
                                        )
                                      }
                                    >
                                      {FONTS.map((f) => (
                                        <option key={f} value={f}>
                                          {f}
                                        </option>
                                      ))}
                                    </select>
                                    <input
                                      type="number"
                                      value={est.fontSize}
                                      onChange={(e) =>
                                        updateElementStyle(
                                          s.id,
                                          el.id,
                                          'fontSize',
                                          Number(e.target.value)
                                        )
                                      }
                                    />
                                    <input
                                      type="color"
                                      value={est.color}
                                      onChange={(e) =>
                                        updateElementStyle(
                                          s.id,
                                          el.id,
                                          'color',
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <div className={styles.general__field}>
                                  <label>Custom Shadow (CSS)</label>
                                  <input
                                    type="text"
                                    placeholder="2px 2px 5px rgba(0,0,0,0.5)"
                                    value={est.textShadow || ''}
                                    onChange={(e) =>
                                      updateElementStyle(
                                        s.id,
                                        el.id,
                                        'textShadow',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div className={styles.general__field}>
                                  <label>Z-Index / Selection Color</label>
                                  <div style={{ display: 'flex', gap: '3px' }}>
                                    <input
                                      type="number"
                                      value={est.zIndex || 1}
                                      onChange={(e) =>
                                        updateElementStyle(
                                          s.id,
                                          el.id,
                                          'zIndex',
                                          Number(e.target.value)
                                        )
                                      }
                                    />
                                    <input
                                      type="color"
                                      title="Selection Color"
                                      onChange={(e) =>
                                        document.execCommand(
                                          'foreColor',
                                          false,
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = () =>
                                        updateElement(s.id, el.id, 'content', {
                                          ...el.content,
                                          [activeLang]: reader.result,
                                        });
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                <div className={styles.general__field}>
                                  <label>Border (Width / Color / Radius)</label>
                                  <div style={{ display: 'flex', gap: '3px' }}>
                                    <input
                                      type="number"
                                      value={est.borderWidth || 0}
                                      onChange={(e) =>
                                        updateElementStyle(
                                          s.id,
                                          el.id,
                                          'borderWidth',
                                          Number(e.target.value)
                                        )
                                      }
                                    />
                                    <input
                                      type="color"
                                      value={est.borderColor || '#ffffff'}
                                      onChange={(e) =>
                                        updateElementStyle(
                                          s.id,
                                          el.id,
                                          'borderColor',
                                          e.target.value
                                        )
                                      }
                                    />
                                    <input
                                      type="number"
                                      value={est.borderRadius}
                                      onChange={(e) =>
                                        updateElementStyle(
                                          s.id,
                                          el.id,
                                          'borderRadius',
                                          Number(e.target.value)
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                                <div className={styles.general__field}>
                                  <label>Z-Index</label>
                                  <input
                                    type="number"
                                    value={est.zIndex || 1}
                                    onChange={(e) =>
                                      updateElementStyle(
                                        s.id,
                                        el.id,
                                        'zIndex',
                                        Number(e.target.value)
                                      )
                                    }
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
