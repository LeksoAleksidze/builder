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
  saveAllConfig,
}: any) {
  const [openSections, setOpenSections] = useState<number[]>([]);
  const [openBlocks, setOpenBlocks] = useState<string[]>([
    'bg',
    'auth',
    'sections',
  ]);

  const toggleBlock = (id: string) => {
    setOpenBlocks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

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
        💾 PUBLISH CONFIG
      </button>

      {/* GLOBAL BACKGROUND */}
      <div
        className={clsx(
          styles.general__block,
          !openBlocks.includes('bg') && styles['general__block--closed']
        )}
      >
        <div
          className={styles.general__header}
          onClick={() => toggleBlock('bg')}
        >
          <span className={styles['general__main-title']}>
            Global Background
          </span>
          <span>{openBlocks.includes('bg') ? '−' : '+'}</span>
        </div>
        <div className={styles.general__content}>
          <div className={styles.general__field}>
            <label>Thumbnail</label>
            <div
              style={{
                width: '40px',
                height: '25px',
                background: '#000',
                border: '1px solid #333',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              {globalBG[activeLang]?.[activeView.toLowerCase()] && (
                <img
                  src={globalBG[activeLang][activeView.toLowerCase()]}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
          </div>
          <input
            type="file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                const r = new FileReader();
                r.onload = () =>
                  setGlobalBG({
                    ...globalBG,
                    [activeLang]: {
                      ...globalBG[activeLang],
                      [activeView.toLowerCase()]: r.result,
                    },
                  });
                r.readAsDataURL(f);
              }
            }}
          />
        </div>
      </div>

      {/* AUTHORIZATION */}
      <div
        className={clsx(
          styles.general__block,
          !openBlocks.includes('auth') && styles['general__block--closed']
        )}
      >
        <div
          className={styles.general__header}
          onClick={() => toggleBlock('auth')}
        >
          <span className={styles['general__main-title']}>Auth Style</span>
          <span>{openBlocks.includes('auth') ? '−' : '+'}</span>
        </div>
        <div className={styles.general__content}>
          <div className={styles.general__field}>
            <label>Margin-T</label>
            <input
              type="number"
              value={parseInt(authStyles[activeView].marginTop)}
              onChange={(e) =>
                setAuthStyles({
                  ...authStyles,
                  [activeView]: {
                    ...authStyles[activeView],
                    marginTop: `${e.target.value}px`,
                  },
                })
              }
            />
          </div>
          <div className={styles.general__field}>
            <label>BG Color</label>
            <input
              type="color"
              value={
                authStyles[activeView].backgroundColor === 'transparent'
                  ? '#000000'
                  : authStyles[activeView].backgroundColor | 0
              }
              onChange={(e) =>
                setAuthStyles({
                  ...authStyles,
                  [activeView]: {
                    ...authStyles[activeView],
                    backgroundColor: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* SECTIONS */}
      <div
        className={clsx(
          styles.general__block,
          !openBlocks.includes('sections') && styles['general__block--closed']
        )}
      >
        <div
          className={styles.general__header}
          onClick={() => toggleBlock('sections')}
        >
          <span className={styles['general__main-title']}>Sections</span>
          <span>{openBlocks.includes('sections') ? '−' : '+'}</span>
        </div>
        <div className={styles.general__content}>
          <button
            className={styles.general__addButton}
            onClick={() =>
              setSections([
                ...sections,
                {
                  id: Date.now(),
                  title: `Sec ${sections.length + 1}`,
                  styles: {
                    WEB: {
                      width: '100%',
                      height: 400,
                      marginTop: 0,
                      marginBottom: 0,
                      backgroundColor: '#161925',
                      borderWidth: 0,
                      borderRadius: 0,
                      borderColor: '#333',
                    },
                    MOB: {
                      width: '100%',
                      height: 300,
                      marginTop: 0,
                      marginBottom: 0,
                      backgroundColor: '#161925',
                      borderWidth: 0,
                      borderRadius: 0,
                      borderColor: '#333',
                    },
                  },
                  elements: [],
                },
              ])
            }
          >
            + New Section
          </button>

          {sections.map((s) => {
            const st = s.styles[activeView];
            return (
              <div
                key={s.id}
                className={clsx(
                  styles.general__sectionCard,
                  openSections.includes(s.id) &&
                    styles['general__sectionCard--active']
                )}
              >
                <div
                  className={styles.general__cardHeader}
                  onClick={() =>
                    setOpenSections((prev) =>
                      prev.includes(s.id)
                        ? prev.filter((i) => i !== s.id)
                        : [...prev, s.id]
                    )
                  }
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '10px',
                        background: st.backgroundColor,
                        border: '1px solid #444',
                      }}
                    >
                      {st.backgroundImage && (
                        <img
                          src={st.backgroundImage}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                    </div>
                    <strong>{s.title}</strong>
                  </div>
                  <button
                    onClick={() =>
                      setSections(sections.filter((sec) => sec.id !== s.id))
                    }
                  >
                    ✕
                  </button>
                </div>

                {openSections.includes(s.id) && (
                  <div className={styles.general__content}>
                    <div className={styles.general__field}>
                      <label>W / H</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input
                          type="text"
                          value={st.width}
                          onChange={(e) =>
                            updateSectionStyle(s.id, 'width', e.target.value)
                          }
                        />
                        <input
                          type="number"
                          value={st.height}
                          onChange={(e) =>
                            updateSectionStyle(
                              s.id,
                              'height',
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className={styles.general__field}>
                      <label>Margin T/B</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
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
                      <label>Border W/R</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
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
                      <label>BG / Border Color</label>
                      <div style={{ display: 'flex', gap: '4px' }}>
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
                        <button
                          onClick={() =>
                            updateSectionStyle(
                              s.id,
                              'backgroundColor',
                              'transparent'
                            )
                          }
                          style={{ fontSize: '8px' }}
                        >
                          X
                        </button>
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
                      </div>
                    </div>
                    <input
                      type="file"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const r = new FileReader();
                          r.onload = () =>
                            updateSectionStyle(
                              s.id,
                              'backgroundImage',
                              r.result
                            );
                          r.readAsDataURL(f);
                        }
                      }}
                    />

                    <div
                      style={{ display: 'flex', gap: '4px', marginTop: '10px' }}
                    >
                      <button
                        className={styles.general__addButton}
                        style={{ background: '#007aff' }}
                        onClick={() =>
                          setSections(
                            sections.map((sec) =>
                              sec.id === s.id
                                ? {
                                    ...sec,
                                    elements: [
                                      ...sec.elements,
                                      {
                                        id: Date.now(),
                                        type: 'text',
                                        content: {
                                          GE: 'ტექსტი',
                                          EN: 'Text',
                                          RU: 'Текст',
                                          TR: 'Metin',
                                        },
                                        styles: {
                                          WEB: {
                                            x: 50,
                                            y: 50,
                                            width: 200,
                                            height: 50,
                                            fontSize: 24,
                                            fontFamily: 'Arial',
                                            color: '#fff',
                                            textShadow: '',
                                          },
                                          MOB: {
                                            x: 20,
                                            y: 20,
                                            width: 150,
                                            height: 40,
                                            fontSize: 18,
                                            fontFamily: 'Arial',
                                            color: '#fff',
                                            textShadow: '',
                                          },
                                        },
                                      },
                                    ],
                                  }
                                : sec
                            )
                          )
                        }
                      >
                        + T
                      </button>
                      <button
                        className={styles.general__addButton}
                        style={{ background: '#50fa7b', color: '#000' }}
                        onClick={() =>
                          setSections(
                            sections.map((sec) =>
                              sec.id === s.id
                                ? {
                                    ...sec,
                                    elements: [
                                      ...sec.elements,
                                      {
                                        id: Date.now(),
                                        type: 'image',
                                        content: { GE: '' },
                                        styles: {
                                          WEB: {
                                            x: 50,
                                            y: 150,
                                            width: 200,
                                            height: 200,
                                            borderRadius: 0,
                                            borderWidth: 0,
                                            borderColor: '#fff',
                                          },
                                          MOB: {
                                            x: 20,
                                            y: 100,
                                            width: 150,
                                            height: 150,
                                            borderRadius: 0,
                                            borderWidth: 0,
                                            borderColor: '#fff',
                                          },
                                        },
                                      },
                                    ],
                                  }
                                : sec
                            )
                          )
                        }
                      >
                        + I
                      </button>
                    </div>

                    {s.elements.map((el: any) => {
                      const est = el.styles[activeView];
                      return (
                        <div key={el.id} className={styles.general__elItem}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '8px',
                            }}
                          >
                            <span style={{ fontSize: '10px', fontWeight: 700 }}>
                              {el.type.toUpperCase()}
                            </span>
                            {el.type === 'image' && el.content[activeLang] && (
                              <img
                                src={el.content[activeLang]}
                                style={{
                                  width: '15px',
                                  height: '15px',
                                  borderRadius: '2px',
                                }}
                                alt="*"
                              />
                            )}
                          </div>
                          {el.type === 'text' ? (
                            <>
                              <textarea
                                value={el.content[activeLang]}
                                onChange={(e) =>
                                  setSections(
                                    sections.map((sec) =>
                                      sec.id === s.id
                                        ? {
                                            ...sec,
                                            elements: sec.elements.map(
                                              (item) =>
                                                item.id === el.id
                                                  ? {
                                                      ...item,
                                                      content: {
                                                        ...item.content,
                                                        [activeLang]:
                                                          e.target.value,
                                                      },
                                                    }
                                                  : item
                                            ),
                                          }
                                        : sec
                                    )
                                  )
                                }
                              />
                              <div className={styles.general__field}>
                                <label>Size / Color</label>
                                <div style={{ display: 'flex', gap: '4px' }}>
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
                                <label>Font</label>
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
                              </div>
                              <div className={styles.general__field}>
                                <label>Shadow CSS</label>
                                <input
                                  type="text"
                                  style={{ width: '80px' }}
                                  value={est.textShadow}
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
                            </>
                          ) : (
                            <>
                              <input
                                type="file"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) {
                                    const r = new FileReader();
                                    r.onload = () =>
                                      setSections(
                                        sections.map((sec) =>
                                          sec.id === s.id
                                            ? {
                                                ...sec,
                                                elements: sec.elements.map(
                                                  (item) =>
                                                    item.id === el.id
                                                      ? {
                                                          ...item,
                                                          content: {
                                                            ...item.content,
                                                            [activeLang]:
                                                              r.result,
                                                          },
                                                        }
                                                      : item
                                                ),
                                              }
                                            : sec
                                        )
                                      );
                                    r.readAsDataURL(f);
                                  }
                                }}
                              />
                              <div className={styles.general__field}>
                                <label>W / H / Rad</label>
                                <div style={{ display: 'flex', gap: '3px' }}>
                                  <input
                                    type="number"
                                    value={est.width}
                                    onChange={(e) =>
                                      updateElementStyle(
                                        s.id,
                                        el.id,
                                        'width',
                                        Number(e.target.value)
                                      )
                                    }
                                  />
                                  <input
                                    type="number"
                                    value={est.height}
                                    onChange={(e) =>
                                      updateElementStyle(
                                        s.id,
                                        el.id,
                                        'height',
                                        Number(e.target.value)
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
                                <label>Border W/C</label>
                                <div style={{ display: 'flex', gap: '3px' }}>
                                  <input
                                    type="number"
                                    value={est.borderWidth}
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
                                    value={est.borderColor}
                                    onChange={(e) =>
                                      updateElementStyle(
                                        s.id,
                                        el.id,
                                        'borderColor',
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
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
      </div>
    </div>
  );
}
