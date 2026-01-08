'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Rnd } from 'react-rnd';
import styles from './dashboard.module.scss';
import General from './components/general/General';
import Authorization from '../../shared/modules/authorization/Authorization.tsx';

export default function DashboardPage() {
  const imageUrl =
    'https://promotions.crocobet.com/crc/private/3oaks/assets/default/background/web/ge.jpg';
  const [isScaled, setScaled] = useState(false);
  const [authStyles, setAuthStyles] = useState({
    marginTop: '700px',
    backgroundColor: '#37445ee6',
  });
  const [sections, setSections] = useState<any[]>([]);

  // LocalStorage-დან წაკითხვა ჩატვირთვისას
  useEffect(() => {
    const savedData = localStorage.getItem('landing_config');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setSections(parsed.sections || []);
      setAuthStyles(
        parsed.authStyles || {
          marginTop: '700px',
          backgroundColor: '#37445ee6',
        }
      );
      setScaled(parsed.isScaled || false);
    }
  }, []);

  // ყველაფრის შენახვა LocalStorage-ში
  const saveAllConfig = () => {
    const config = { sections, authStyles, isScaled };
    localStorage.setItem('landing_config', JSON.stringify(config));
    console.log('Saved Configuration:', config);
    alert('კონფიგურაცია შენახულია!');
  };

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now(),
        title: `სექცია ${sections.length + 1}`,
        width: '100%',
        height: 400,
        marginTop: 0,
        borderRadius: 0,
        borderWidth: 0,
        borderColor: '#ffffff',
        bgType: 'none',
        backgroundColor: 'transparent',
        backgroundImage: '',
        elements: [],
      },
    ]);
  };

  const addElement = (sectionId: number, type: 'text' | 'image') => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              elements: [
                ...s.elements,
                {
                  id: Date.now(),
                  type,
                  content:
                    type === 'text'
                      ? 'ტექსტი <span style="color:red">აქ</span>'
                      : 'https://via.placeholder.com/150',
                  x: 0,
                  y: 0,
                  width: 'auto',
                  height: 'auto',
                  fontSize: 24,
                  color: '#ffffff',
                  borderRadius: 0,
                },
              ],
            }
          : s
      )
    );
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboard__content}>
        <div
          className={clsx(
            styles.dashboard__landing,
            isScaled && styles['dashboard__landing--scaled']
          )}
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <Authorization stylesProp={authStyles} />

          <div className={styles.dashboard__builder}>
            {sections.map((section) => (
              <div
                key={section.id}
                style={{
                  height: `${section.height}px`,
                  width: section.width,
                  marginTop: `${section.marginTop}px`,
                  borderRadius: `${section.borderRadius}px`,
                  border:
                    section.borderWidth > 0
                      ? `${section.borderWidth}px solid ${section.borderColor}`
                      : 'none',
                  backgroundColor:
                    section.bgType === 'color'
                      ? section.backgroundColor
                      : 'transparent',
                  backgroundImage:
                    section.bgType === 'image'
                      ? `url(${section.backgroundImage})`
                      : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  marginInline: 'auto',
                  padding: 0,
                }}
              >
                {section.elements.map((el: any) => (
                  <Rnd
                    key={el.id}
                    size={{ width: el.width, height: el.height }}
                    position={{ x: el.x, y: el.y }}
                    bounds="parent"
                    onDragStop={(_, d) => {
                      const updated = section.elements.map((e: any) =>
                        e.id === el.id ? { ...e, x: d.x, y: d.y } : e
                      );
                      setSections(
                        sections.map((s) =>
                          s.id === section.id ? { ...s, elements: updated } : s
                        )
                      );
                    }}
                    onResizeStop={(_, __, ref, ___, position) => {
                      const updated = section.elements.map((e: any) =>
                        e.id === el.id
                          ? {
                              ...e,
                              width: ref.offsetWidth,
                              height: ref.offsetHeight,
                              ...position,
                            }
                          : e
                      );
                      setSections(
                        sections.map((s) =>
                          s.id === section.id ? { ...s, elements: updated } : s
                        )
                      );
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        cursor: 'move',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {el.type === 'text' ? (
                        <div
                          style={{
                            fontSize: `${el.fontSize}px`,
                            color: el.color,
                            whiteSpace: 'nowrap',
                          }}
                          dangerouslySetInnerHTML={{ __html: el.content }}
                        />
                      ) : (
                        <img
                          src={el.content}
                          draggable={false}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: `${el.borderRadius}px`,
                          }}
                        />
                      )}
                    </div>
                  </Rnd>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.dashboard__aside}>
        <General
          isScaled={isScaled}
          setScaled={setScaled}
          authStyles={authStyles}
          setAuthStyles={setAuthStyles}
          sections={sections}
          setSections={setSections}
          addSection={addSection}
          addElement={addElement}
          saveAllConfig={saveAllConfig}
        />
      </div>
    </div>
  );
}
