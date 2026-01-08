'use client';

import { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import clsx from 'clsx';
import styles from './dashboard.module.scss';
import General from './components/general/General';
import Authorization from '../../shared/modules/authorization/Authorization.tsx';

export default function DashboardPage() {
  const [activeLang, setActiveLang] = useState('GE');
  const [activeView, setActiveView] = useState<'WEB' | 'MOB'>('WEB');
  const [isPreview, setIsPreview] = useState(false);

  // საწყისი მონაცემები, რომ არაფერი გაქრეს
  const [globalBG, setGlobalBG] = useState<any>({
    GE: { web: '', mob: '' },
    EN: { web: '', mob: '' },
    RU: { web: '', mob: '' },
    TR: { web: '', mob: '' },
  });
  const [authStyles, setAuthStyles] = useState<any>({
    WEB: { marginTop: '700px' },
    MOB: { marginTop: '300px' },
  });
  const [sections, setSections] = useState<any[]>([]);

  // მონაცემების ჩატვირთვა
  useEffect(() => {
    const saved = localStorage.getItem('landing_v_stable_final');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.sections) setSections(parsed.sections);
      if (parsed.authStyles) setAuthStyles(parsed.authStyles);
      if (parsed.globalBG) setGlobalBG(parsed.globalBG);
    }
  }, []);

  const saveAllConfig = () => {
    localStorage.setItem(
      'landing_v_stable_final',
      JSON.stringify({ sections, authStyles, globalBG })
    );
    alert('✅ შენახულია!');
  };

  const updateElement = (
    sId: number,
    elId: number,
    field: string,
    value: any
  ) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sId
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

  return (
    <div
      className={clsx(
        styles.dashboard,
        isPreview && styles['dashboard--preview']
      )}
    >
      <div
        className={styles.dashboard__content}
        style={{
          width: activeView === 'MOB' ? '375px' : '100%',
          margin: '0 auto',
        }}
      >
        <div
          className={styles.dashboard__landing}
          style={{
            backgroundImage: `url(${globalBG[activeLang][activeView.toLowerCase()]})`,
            minHeight: '100vh',
            backgroundSize: 'cover',
          }}
        >
          <Authorization stylesProp={authStyles[activeView]} />

          <div className={styles.dashboard__builder}>
            {sections.map((s) => {
              const st = s.styles[activeView];
              return (
                <div
                  key={s.id}
                  style={{
                    width: st.width,
                    height: `${st.height}px`,
                    marginTop: `${st.marginTop}px`,
                    marginBottom: `${st.marginBottom}px`,
                    backgroundColor: st.backgroundColor,
                    border: `${st.borderWidth}px solid ${st.borderColor}`,
                    borderRadius: `${st.borderRadius}px`,
                    backgroundImage: st.backgroundImage
                      ? `url(${st.backgroundImage})`
                      : 'none',
                    backgroundSize: 'cover',
                    position: 'relative',
                    margin: '0 auto',
                    zIndex: st.zIndex || 1,
                  }}
                >
                  {s.elements.map((el: any) => {
                    const est = el.styles[activeView];
                    return (
                      <Rnd
                        key={el.id}
                        size={{ width: est.width, height: est.height }}
                        position={{ x: est.x, y: est.y }}
                        disableDragging={el.isEditing}
                        onDragStop={(_, d) =>
                          updateElement(s.id, el.id, 'styles', {
                            ...el.styles,
                            [activeView]: { ...est, x: d.x, y: d.y },
                          })
                        }
                        onResizeStop={(_, __, ref, ___, pos) =>
                          updateElement(s.id, el.id, 'styles', {
                            ...el.styles,
                            [activeView]: {
                              ...est,
                              width: ref.offsetWidth,
                              height: ref.offsetHeight,
                              ...pos,
                            },
                          })
                        }
                        style={{ zIndex: est.zIndex || 1 }}
                      >
                        <div
                          className={clsx(
                            styles.elementWrapper,
                            el.isEditing && styles.editingBorder
                          )}
                          style={{ width: '100%', height: '100%' }}
                        >
                          {!isPreview && (
                            <button
                              className={styles.deleteElBtn}
                              onClick={() =>
                                setSections(
                                  sections.map((sec) =>
                                    sec.id === s.id
                                      ? {
                                          ...sec,
                                          elements: sec.elements.filter(
                                            (item: any) => item.id !== el.id
                                          ),
                                        }
                                      : sec
                                  )
                                )
                              }
                            >
                              ×
                            </button>
                          )}
                          <div
                            onDoubleClick={() =>
                              updateElement(s.id, el.id, 'isEditing', true)
                            }
                            style={{ width: '100%', height: '100%' }}
                          >
                            {el.type === 'text' ? (
                              <div
                                contentEditable={el.isEditing}
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  updateElement(s.id, el.id, 'content', {
                                    ...el.content,
                                    [activeLang]: e.currentTarget.innerHTML,
                                  });
                                  updateElement(
                                    s.id,
                                    el.id,
                                    'isEditing',
                                    false
                                  );
                                }}
                                style={{
                                  fontSize: `${est.fontSize}px`,
                                  fontFamily: est.fontFamily,
                                  color: est.color,
                                  textShadow: est.textShadow || 'none', // Shadow დაემატა
                                  outline: 'none',
                                  width: '100%',
                                  height: '100%',
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: el.content[activeLang],
                                }}
                              />
                            ) : (
                              <img
                                src={el.content[activeLang]}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: `${est.borderRadius}px`,
                                  border: `${est.borderWidth || 0}px solid ${est.borderColor || 'transparent'}`, // Image Border დაემატა
                                }}
                                draggable={false}
                              />
                            )}
                          </div>
                        </div>
                      </Rnd>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {!isPreview && (
        <div className={styles.dashboard__aside}>
          <General
            {...{
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
              addSection: () =>
                setSections([
                  ...sections,
                  {
                    id: Date.now(),
                    title: `Section ${sections.length + 1}`,
                    styles: {
                      WEB: {
                        width: '100%',
                        height: 400,
                        marginTop: 0,
                        marginBottom: 0,
                        backgroundColor: '#111',
                        borderWidth: 0,
                        borderColor: '#fff',
                        borderRadius: 0,
                        backgroundImage: '',
                        zIndex: 1,
                      },
                      MOB: {
                        width: '100%',
                        height: 300,
                        marginTop: 0,
                        marginBottom: 0,
                        backgroundColor: '#111',
                        borderWidth: 0,
                        borderColor: '#fff',
                        borderRadius: 0,
                        backgroundImage: '',
                        zIndex: 1,
                      },
                    },
                    elements: [],
                  },
                ]),
              deleteSection: (id: any) =>
                setSections(sections.filter((s) => s.id !== id)),
              addElement: (sId: any, type: any) =>
                setSections(
                  sections.map((s) =>
                    s.id === sId
                      ? {
                          ...s,
                          elements: [
                            ...s.elements,
                            {
                              id: Date.now(),
                              type,
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
                                  height: 100,
                                  fontSize: 24,
                                  fontFamily: 'Arial',
                                  color: '#fff',
                                  zIndex: 1,
                                  borderRadius: 0,
                                },
                                MOB: {
                                  x: 20,
                                  y: 20,
                                  width: 150,
                                  height: 80,
                                  fontSize: 18,
                                  fontFamily: 'Arial',
                                  color: '#fff',
                                  zIndex: 1,
                                  borderRadius: 0,
                                },
                              },
                              isEditing: false,
                            },
                          ],
                        }
                      : s
                  )
                ),
              updateElement,
              saveAllConfig,
              setIsPreview,
            }}
          />
        </div>
      )}
    </div>
  );
}
