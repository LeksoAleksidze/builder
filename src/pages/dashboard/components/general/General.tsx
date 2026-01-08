'use client';

import React, { useState } from 'react';
import styles from './General.module.scss';
import clsx from 'clsx';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const FONTS = [
  'Arial',
  'Helvetica',
  'Inter',
  'BPG Nino Mtavruli',
  'Times New Roman',
  'Courier New',
];

// --- 1. SORTABLE ITEM COMPONENT (აღდგენილი სრული ფუნქციონალით) ---
function SortableSection({
  s,
  activeView,
  activeLang,
  openSections,
  setOpenSections,
  sections,
  setSections,
  updateSectionStyle,
  updateElementStyle,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: s.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const st = s.styles[activeView];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        styles.general__sectionCard,
        openSections.includes(s.id) && styles['general__sectionCard--active']
      )}
    >
      <div className={styles.general__cardHeader}>
        <div
          {...attributes}
          {...listeners}
          style={{
            cursor: 'grab',
            padding: '0 10px',
            color: '#6272a4',
            fontSize: '18px',
          }}
        >
          ⠿
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flex: 1,
            cursor: 'pointer',
          }}
          onClick={() =>
            setOpenSections((prev: any) =>
              prev.includes(s.id)
                ? prev.filter((i: any) => i !== s.id)
                : [...prev, s.id]
            )
          }
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
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt=""
              />
            )}
          </div>
          <strong>{s.title}</strong>
        </div>
        <button
          onClick={() =>
            setSections(sections.filter((sec: any) => sec.id !== s.id))
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
                  updateSectionStyle(s.id, 'height', Number(e.target.value))
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
                  updateSectionStyle(s.id, 'marginTop', Number(e.target.value))
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
                value={
                  st.backgroundColor === 'transparent'
                    ? '#000000'
                    : st.backgroundColor
                }
                onChange={(e) =>
                  updateSectionStyle(s.id, 'backgroundColor', e.target.value)
                }
              />
              <button
                onClick={() =>
                  updateSectionStyle(s.id, 'backgroundColor', 'transparent')
                }
                style={{ fontSize: '8px' }}
              >
                X
              </button>
              <input
                type="color"
                value={st.borderColor}
                onChange={(e) =>
                  updateSectionStyle(s.id, 'borderColor', e.target.value)
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
                  updateSectionStyle(s.id, 'backgroundImage', r.result);
                r.readAsDataURL(f);
              }
            }}
          />

          {/* ADD ELEMENTS */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
            <button
              className={styles.general__addButton}
              style={{ background: '#007aff' }}
              onClick={() => updateElementStyle(s.id, null, 'add', 'text')}
            >
              + T
            </button>
            <button
              className={styles.general__addButton}
              style={{ background: '#50fa7b', color: '#000' }}
              onClick={() => updateElementStyle(s.id, null, 'add', 'image')}
            >
              + I
            </button>
          </div>

          {/* ELEMENTS LISTING (აღდგენილი ფუნქციონალი) */}
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
                  <button
                    onClick={() =>
                      updateElementStyle(s.id, el.id, 'delete', null)
                    }
                  >
                    ✕
                  </button>
                </div>

                {el.type === 'text' ? (
                  <>
                    <textarea
                      value={el.content[activeLang] || ''}
                      onChange={(e) =>
                        updateElementStyle(
                          s.id,
                          el.id,
                          'content',
                          e.target.value
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
                            updateElementStyle(
                              s.id,
                              el.id,
                              'content',
                              r.result
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
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- 2. MAIN COMPONENT ---
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
    elId: number | null,
    field: string,
    value: any
  ) => {
    setSections((prev: any) =>
      prev.map((s: any) => {
        if (s.id !== sId) return s;
        if (field === 'add') {
          const newEl = {
            id: Date.now(),
            type: value,
            content: { GE: '', EN: '', RU: '', TR: '' },
            styles: {
              WEB:
                value === 'text'
                  ? {
                      x: 50,
                      y: 50,
                      width: 200,
                      height: 50,
                      fontSize: 24,
                      fontFamily: 'Arial',
                      color: '#fff',
                    }
                  : { x: 50, y: 150, width: 200, height: 200, borderRadius: 0 },
              MOB:
                value === 'text'
                  ? {
                      x: 20,
                      y: 20,
                      width: 150,
                      height: 40,
                      fontSize: 18,
                      fontFamily: 'Arial',
                      color: '#fff',
                    }
                  : { x: 20, y: 100, width: 150, height: 150, borderRadius: 0 },
            },
          };
          return { ...s, elements: [...s.elements, newEl] };
        }
        if (field === 'delete')
          return {
            ...s,
            elements: s.elements.filter((el: any) => el.id !== elId),
          };

        return {
          ...s,
          elements: s.elements.map((el: any) => {
            if (el.id !== elId) return el;
            if (field === 'content')
              return { ...el, content: { ...el.content, [activeLang]: value } };
            return {
              ...el,
              styles: {
                ...el.styles,
                [activeView]: { ...el.styles[activeView], [field]: value },
              },
            };
          }),
        };
      })
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items: any) => {
        const oldIndex = items.findIndex((i: any) => i.id === active.id);
        const newIndex = items.findIndex((i: any) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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

      {/* SECTIONS BLOCK */}
      <div
        className={clsx(
          styles.general__block,
          !openBlocks.includes('sections') && styles['general__block--closed']
        )}
      >
        <div
          className={styles.general__header}
          onClick={() =>
            setOpenBlocks((p) =>
              p.includes('sections')
                ? p.filter((b) => b !== 'sections')
                : [...p, 'sections']
            )
          }
        >
          <span className={styles['general__main-title']}>
            Sections & Reorder
          </span>
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

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s: any) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                {sections.map((s: any) => (
                  <SortableSection
                    key={s.id}
                    s={s}
                    updateSectionStyle={updateSectionStyle}
                    updateElementStyle={updateElementStyle}
                    {...{
                      activeView,
                      activeLang,
                      openSections,
                      setOpenSections,
                      sections,
                      setSections,
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
