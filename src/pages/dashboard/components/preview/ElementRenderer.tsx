'use client';

import { Rnd } from 'react-rnd';
import { useLandingContext } from '../../context';
import type { Element } from '../../types';

interface ElementRendererProps {
  sectionId: number;
  element: Element;
}

export function ElementRenderer({ sectionId, element }: ElementRendererProps) {
  const {
    activeView,
    activeLang,
    isPreview,
    updateElementStyles,
    updateElementContent,
    setElementEditing,
    deleteElement,
  } = useLandingContext();

  const est = element.styles[activeView];

  const handleDragStop = (_: unknown, d: { x: number; y: number }) => {
    updateElementStyles(sectionId, element.id, {
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
    updateElementStyles(sectionId, element.id, {
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
      disableDragging={element.isEditing || isPreview}
      disableResizing={isPreview}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      style={{
        zIndex: est.zIndex || 1,
        border: !isPreview && element.isEditing ? '1px solid #00f2ff' : 'none',
        boxShadow: !isPreview && element.isEditing ? '0 0 10px #00f2ff' : 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {!isPreview && element.isEditing && (
          <button
            onClick={() => deleteElement(sectionId, element.id)}
            style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: 'none',
              background: '#ff4757',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            X
          </button>
        )}
        <div
          onDoubleClick={() =>
            !isPreview && setElementEditing(sectionId, element.id, true)
          }
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
              onBlur={(e) => {
                updateElementContent(sectionId, element.id, e.currentTarget.innerHTML);
                setElementEditing(sectionId, element.id, false);
              }}
              style={{
                fontSize: `${(est as { fontSize: number }).fontSize}px`,
                fontFamily: (est as { fontFamily: string }).fontFamily,
                color: (est as { color: string }).color,
                textShadow: (est as { textShadow?: string }).textShadow || 'none',
                outline: 'none',
                width: '100%',
                height: '100%',
              }}
              dangerouslySetInnerHTML={{
                __html: element.content[activeLang] || '',
              }}
            />
          ) : (
            <img
              src={element.content[activeLang] || ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: `${(est as { borderRadius: number }).borderRadius || 0}px`,
              }}
              draggable={false}
              alt="*"
            />
          )}
        </div>
      </div>
    </Rnd>
  );
}
