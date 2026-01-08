'use client';

import React, { useState } from 'react';
import styles from './General.module.scss';
import clsx from 'clsx';
import Checkbox from '../../../../shared/components/checkbox/Checkbox.tsx';

export default function General({
  isScaled,
  setScaled,
  authStyles,
  setAuthStyles,
  sections,
  setSections,
  addSection,
  addElement,
  saveAllConfig,
}: any) {
  const [activeLang, setActiveLang] = useState('GE');
  const [openStates, setOpenStates] = useState({
    general: false,
    auth: false,
    builder: true,
  });

  const LANGUAGES = [
    { code: 'GE', label: 'GE' },
    { code: 'EN', label: 'EN' },
    { code: 'RU', label: 'RU' },
    { code: 'TR', label: 'TR' },
  ];

  const updateSection = (id: number, field: string, value: any) => {
    setSections(
      sections.map((s: any) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const updateElement = (
    sectionId: number,
    elId: number,
    field: string,
    value: any
  ) => {
    setSections(
      sections.map((s: any) =>
        s.id === sectionId
          ? {
              ...s,
              elements: s.elements.map((el: any) =>
                el.id === elId ? { ...el, [field]: value } : el
              ),
            }
          : s
      )
    );
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    sectionId: number,
    elId: number | null = null,
    isBG = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isBG) updateSection(sectionId, 'backgroundImage', reader.result);
        else if (elId) updateElement(sectionId, elId, 'content', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.general}>
      <button
        className={styles.general__saveBtn}
        style={{ margin: '10px', width: 'calc(100% - 20px)' }}
        onClick={saveAllConfig}
      >
        💾 SAVE ALL CONFIG
      </button>

      {/* General Settings */}
      <div
        className={clsx(
          styles.general__block,
          !openStates.general && styles['general__block--closed']
        )}
      >
        <div
          className={styles.general__header}
          onClick={() =>
            setOpenStates({ ...openStates, general: !openStates.general })
          }
        >
          <h2 className={styles['general__main-title']}>General Settings</h2>
        </div>
        {openStates.general && (
          <div className={styles.general__content}>
            <div className={styles['general__lang-grid']}>
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  className={clsx(
                    styles['general__lang-item'],
                    activeLang === lang.code &&
                      styles['general__lang-item--active']
                  )}
                >
                  {lang.label}
                </div>
              ))}
            </div>
            <Checkbox
              id="scale-bg"
              label="Scale Background"
              checked={isScaled}
              onChange={setScaled}
            />
          </div>
        )}
      </div>

      {/* Authorization block */}
      <div
        className={clsx(
          styles.general__block,
          !openStates.auth && styles['general__block--closed']
        )}
      >
        <div
          className={styles.general__header}
          onClick={() =>
            setOpenStates({ ...openStates, auth: !openStates.auth })
          }
        >
          <h2 className={styles['general__main-title']}>Authorization block</h2>
        </div>
        {openStates.auth && (
          <div className={styles.general__content}>
            <label>Margin Top</label>
            <input
              type="range"
              min="0"
              max="2000"
              value={parseInt(authStyles.marginTop)}
              onChange={(e) =>
                setAuthStyles({
                  ...authStyles,
                  marginTop: `${e.target.value}px`,
                })
              }
            />
            <input
              type="color"
              value={authStyles.backgroundColor}
              onChange={(e) =>
                setAuthStyles({
                  ...authStyles,
                  backgroundColor: e.target.value,
                })
              }
            />
          </div>
        )}
      </div>

      {/* Sections Builder */}
      <div
        className={clsx(
          styles.general__block,
          !openStates.builder && styles['general__block--closed']
        )}
      >
        <div
          className={styles.general__header}
          onClick={() =>
            setOpenStates({ ...openStates, builder: !openStates.builder })
          }
        >
          <h2 className={styles['general__main-title']}>Sections Builder</h2>
        </div>
        {openStates.builder && (
          <div className={styles.general__content}>
            <button className={styles.general__addButton} onClick={addSection}>
              + Add New Section
            </button>
            {sections.map((s: any) => (
              <div key={s.id} className={styles.general__sectionCard}>
                <div className={styles.general__cardHeader}>
                  <strong>{s.title}</strong>
                  <button
                    onClick={() =>
                      setSections(sections.filter((sec) => sec.id !== s.id))
                    }
                  >
                    Delete
                  </button>
                </div>

                <div className={styles.general__field}>
                  <label>Width</label>
                  <input
                    type="text"
                    value={s.width}
                    onChange={(e) =>
                      updateSection(s.id, 'width', e.target.value)
                    }
                  />
                </div>
                <div className={styles.general__field}>
                  <label>Height</label>
                  <input
                    type="number"
                    value={s.height}
                    onChange={(e) =>
                      updateSection(s.id, 'height', Number(e.target.value))
                    }
                  />
                </div>
                <div className={styles.general__field}>
                  <label>Margin-T</label>
                  <input
                    type="number"
                    value={s.marginTop}
                    onChange={(e) =>
                      updateSection(s.id, 'marginTop', Number(e.target.value))
                    }
                  />
                </div>
                <div className={styles.general__field}>
                  <label>Radius</label>
                  <input
                    type="number"
                    value={s.borderRadius}
                    onChange={(e) =>
                      updateSection(
                        s.id,
                        'borderRadius',
                        Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div className={styles.general__field}>
                  <label>Border</label>
                  <input
                    type="number"
                    value={s.borderWidth}
                    onChange={(e) =>
                      updateSection(s.id, 'borderWidth', Number(e.target.value))
                    }
                  />
                  <input
                    type="color"
                    value={s.borderColor}
                    onChange={(e) =>
                      updateSection(s.id, 'borderColor', e.target.value)
                    }
                  />
                </div>

                <div className={styles.general__section}>
                  <label>Background</label>
                  <select
                    value={s.bgType}
                    onChange={(e) =>
                      updateSection(s.id, 'bgType', e.target.value)
                    }
                    className={styles.general__select}
                  >
                    <option value="none">None</option>
                    <option value="color">Color</option>
                    <option value="image">Upload Image</option>
                  </select>
                  {s.bgType === 'color' && (
                    <input
                      type="color"
                      value={s.backgroundColor}
                      onChange={(e) =>
                        updateSection(s.id, 'backgroundColor', e.target.value)
                      }
                    />
                  )}
                  {s.bgType === 'image' && (
                    <input
                      type="file"
                      onChange={(e) => handleFileUpload(e, s.id, null, true)}
                    />
                  )}
                </div>

                <div className={styles.general__elementActions}>
                  <button onClick={() => addElement(s.id, 'text')}>
                    + Text
                  </button>
                  <button onClick={() => addElement(s.id, 'image')}>
                    + Image
                  </button>
                </div>

                {s.elements.map((el: any) => (
                  <div key={el.id} className={styles.general__elItem}>
                    <div className={styles.general__cardHeader}>
                      <small>{el.type.toUpperCase()}</small>
                      <button
                        onClick={() =>
                          updateSection(
                            s.id,
                            'elements',
                            s.elements.filter((e: any) => e.id !== el.id)
                          )
                        }
                      >
                        X
                      </button>
                    </div>
                    {el.type === 'text' ? (
                      <>
                        <textarea
                          value={el.content}
                          onChange={(e) =>
                            updateElement(
                              s.id,
                              el.id,
                              'content',
                              e.target.value
                            )
                          }
                          rows={2}
                        />
                        <div className={styles.general__field}>
                          <input
                            type="number"
                            value={el.fontSize}
                            onChange={(e) =>
                              updateElement(
                                s.id,
                                el.id,
                                'fontSize',
                                Number(e.target.value)
                              )
                            }
                          />
                          <input
                            type="color"
                            value={el.color}
                            onChange={(e) =>
                              updateElement(
                                s.id,
                                el.id,
                                'color',
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
                          onChange={(e) => handleFileUpload(e, s.id, el.id)}
                        />
                        <div className={styles.general__field}>
                          <label>Radius</label>
                          <input
                            type="number"
                            value={el.borderRadius}
                            onChange={(e) =>
                              updateElement(
                                s.id,
                                el.id,
                                'borderRadius',
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
