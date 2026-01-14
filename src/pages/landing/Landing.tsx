import { useState, useEffect, useRef } from 'react';
import { Rnd } from 'react-rnd';
import Authorization from '../../shared/modules/authorization/Authorization';
import type { Section, Element, Language, ViewMode, GlobalBackground, AuthStyles } from '../../shared/types';
import styles from './Landing.module.scss';

interface LandingProps {
  sections: Section[];
  globalBG: GlobalBackground;
  authStyles: AuthStyles;
  activeLang: Language;
  activeView: ViewMode;
  isPreview: boolean;
  selectedElementId?: number | null;
  onElementUpdate?: (sectionId: number, elementId: number, field: string, value: unknown) => void;
  onElementSelect?: (sectionId: number | null, elementId: number | null) => void;
}

export default function Landing({
  sections,
  globalBG,
  authStyles,
  activeLang,
  activeView,
  isPreview,
  selectedElementId,
  onElementUpdate,
  onElementSelect,
}: LandingProps) {
  const bgUrl = globalBG[activeLang]?.[activeView.toLowerCase() as 'web' | 'mob'] || '';
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isPreview && landingRef.current && !landingRef.current.contains(e.target as Node)) {
        onElementSelect?.(null, null);
      }
    };

    if (!isPreview) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPreview, onElementSelect]);

  return (
    <div
      ref={landingRef}
      className={styles.landing}
      style={{
        backgroundImage: bgUrl ? `url(${bgUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'top center',
        backgroundAttachment: 'scroll',
      }}
    >
      <Authorization stylesProp={authStyles[activeView]} />

      <div className={styles.landing__content}>
        {sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            activeView={activeView}
            activeLang={activeLang}
            isPreview={isPreview}
            selectedElementId={selectedElementId}
            onElementUpdate={onElementUpdate}
            onElementSelect={onElementSelect}
          />
        ))}
      </div>
    </div>
  );
}

interface SectionRendererProps {
  section: Section;
  activeView: ViewMode;
  activeLang: Language;
  isPreview: boolean;
  selectedElementId?: number | null;
  onElementUpdate?: (sectionId: number, elementId: number, field: string, value: unknown) => void;
  onElementSelect?: (sectionId: number | null, elementId: number | null) => void;
}

function SectionRenderer({
  section,
  activeView,
  activeLang,
  isPreview,
  selectedElementId,
  onElementUpdate,
  onElementSelect,
}: SectionRendererProps) {
  const st = section.styles[activeView];

  return (
    <div
      className={styles.landing__section}
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
        backgroundImage: st.backgroundImage ? `url(${st.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        zIndex: st.zIndex || 1,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {section.elements.map((element) => (
        <ElementRenderer
          key={element.id}
          element={element}
          sectionId={section.id}
          activeView={activeView}
          activeLang={activeLang}
          isPreview={isPreview}
          isSelected={selectedElementId === element.id}
          onUpdate={onElementUpdate}
          onSelect={onElementSelect}
        />
      ))}
    </div>
  );
}

interface ElementRendererProps {
  element: Element;
  sectionId: number;
  activeView: ViewMode;
  activeLang: Language;
  isPreview: boolean;
  isSelected?: boolean;
  onUpdate?: (sectionId: number, elementId: number, field: string, value: unknown) => void;
  onSelect?: (sectionId: number | null, elementId: number | null) => void;
}

function ElementRenderer({
  element,
  sectionId,
  activeView,
  activeLang,
  isPreview,
  isSelected,
  onUpdate,
  onSelect,
}: ElementRendererProps) {
  const [isHovered, setIsHovered] = useState(false);
  const est = element.styles[activeView];
  const showBorder = !isPreview && (element.isEditing || isHovered || isSelected);

  const handleDragStop = (_: unknown, d: { x: number; y: number }) => {
    onUpdate?.(sectionId, element.id, 'styles', {
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
    onUpdate?.(sectionId, element.id, 'styles', {
      ...element.styles,
      [activeView]: {
        ...est,
        width: ref.offsetWidth,
        height: ref.offsetHeight,
        ...pos,
      },
    });
  };

  const handleContentBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    onUpdate?.(sectionId, element.id, 'content', {
      ...element.content,
      [activeLang]: e.currentTarget.innerHTML,
    });
    onUpdate?.(sectionId, element.id, 'isEditing', false);
  };

  const handleDoubleClick = () => {
    if (!isPreview) {
      onUpdate?.(sectionId, element.id, 'isEditing', true);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isPreview && !element.isEditing) {
      e.stopPropagation();
      onSelect?.(sectionId, element.id);
    }
  };

  return (
    <Rnd
      size={{ width: est.width, height: est.height }}
      position={{ x: est.x, y: est.y }}
      bounds="parent"
      disableDragging={element.isEditing || isPreview}
      disableResizing={isPreview}
      enableResizing={!isPreview}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onMouseEnter={() => !isPreview && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        zIndex: est.zIndex || 1,
        border: showBorder ? '1px solid #00f2ff' : 'none',
        boxShadow: showBorder ? '0 0 10px #00f2ff' : 'none',
        pointerEvents: isPreview ? 'none' : 'auto',
      }}
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <div
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          style={{
            width: '100%',
            height: '100%',
            cursor: isPreview ? 'default' : element.isEditing ? 'text' : 'move',
          }}
        >
          {element.type === 'text' ? (
            <div
              contentEditable={!isPreview && element.isEditing}
              suppressContentEditableWarning
              onBlur={handleContentBlur}
              style={{
                fontSize: `${est.fontSize}px`,
                fontFamily: est.fontFamily,
                color: est.color,
                textShadow: est.textShadow || 'none',
                outline: 'none',
                width: '100%',
                height: '100%',
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
                borderRadius: `${est.borderRadius || 0}px`,
              }}
              draggable={false}
              alt=""
            />
          )}
        </div>
      </div>
    </Rnd>
  );
}
