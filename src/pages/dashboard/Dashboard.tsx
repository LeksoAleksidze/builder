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
  const [globalBG, setGlobalBG] = useState<any>({
    GE: { web: '' },
    EN: { web: '' },
    RU: { web: '' },
    TR: { web: '' },
  });
  const [authStyles, setAuthStyles] = useState({
    WEB: { marginTop: '700px', backgroundColor: 'transparent' },
    MOB: { marginTop: '300px', backgroundColor: 'transparent' },
  });
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('landing_data');

    if (saved) {
      const parsed = JSON.parse(saved);

      setSections(parsed.sections);
      setAuthStyles(parsed.authStyles);
      setGlobalBG(parsed.globalBG);
    }
  }, []);

  const saveAllConfig = () => {
    localStorage.setItem(
      'landing_data',
      JSON.stringify({ sections, authStyles, globalBG })
    );
    alert('✅ კონფიგურაცია შენახულია!');
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
            backgroundImage: `url(${globalBG[activeLang]?.[activeView.toLowerCase()] || ''})`,
          }}
        >
          <Authorization stylesProp={authStyles[activeView]} />

          <div className={styles.dashboard__builder}>
            {sections.map((s) => {
              const st = s.styles[activeView] || {};
              return (
                <div
                  key={s.id}
                  style={{
                    width: st.width || '100%',
                    height: st.height ? `${st.height}px` : 'auto',
                    marginTop: `${st.marginTop || 0}px`,
                    marginBottom: `${st.marginBottom || 0}px`,
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    backgroundColor: st.backgroundColor || 'transparent',
                    border: `${st.borderWidth || 0}px solid ${st.borderColor || 'transparent'}`,
                    borderRadius: `${st.borderRadius || 0}px`,
                    backgroundImage: st.backgroundImage
                      ? `url(${st.backgroundImage})`
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    zIndex: st.zIndex || 1,
                  }}
                >
                  {s.elements?.map((el: any) => {
                    const est = el.styles[activeView] || {};
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
                        style={{
                          zIndex: est.zIndex || 1,
                          border: el.isEditing ? '1px solid #00f2ff' : 'none',
                          boxShadow: el.isEditing ? '0 0 10px #00f2ff' : 'none',
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            position: 'relative',
                          }}
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
                            style={{
                              width: '100%',
                              height: '100%',
                              cursor: el.isEditing ? 'text' : 'move',
                            }}
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
                                  textShadow: est.textShadow || 'none',
                                  outline: 'none',
                                  width: '100%',
                                  height: '100%',
                                }}
                                dangerouslySetInnerHTML={{
                                  __html: el.content[activeLang] || '',
                                }}
                              />
                            ) : (
                              <img
                                src={el.content[activeLang] || ''}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: `${est.borderRadius || 0}px`,
                                  border: `${est.borderWidth || 0}px solid ${est.borderColor || 'transparent'}`,
                                }}
                                draggable={false}
                                alt="*"
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
              saveAllConfig,
              setIsPreview,
            }}
          />
        </div>
      )}
    </div>
  );
}
