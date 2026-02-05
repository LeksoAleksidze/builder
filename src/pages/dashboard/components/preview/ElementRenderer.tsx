'use client';

import { useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { useLandingContext } from '../../context';
import type { Element, BoxElement, TextElement, ImageElement, BoxChildElement } from '../../types';

interface AlignmentGuides {
  horizontal: boolean;
  vertical: boolean;
}

interface ElementRendererProps {
  sectionId: number;
  element: Element;
  parentWidth?: number;
  parentHeight?: number;
}

// Separate component for box children to avoid prop drilling
function BoxChildRenderer({
  sectionId,
  boxId,
  child,
  parentWidth,
  parentHeight,
}: {
  sectionId: number;
  boxId: number;
  child: BoxChildElement;
  parentWidth: number;
  parentHeight: number;
}) {
  const {
    activeView,
    activeLang,
    isPreview,
    updateElementStyles,
    updateElementContent,
    setElementEditing,
    deleteBoxChild,
    duplicateBoxChild,
  } = useLandingContext();

  const [guides, setGuides] = useState<AlignmentGuides>({ horizontal: false, vertical: false });

  const est = child.styles[activeView];

  const checkAlignment = useCallback((x: number, y: number, width: number, height: number) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const parentCenterX = parentWidth / 2;
    const parentCenterY = parentHeight / 2;

    const threshold = 5;
    setGuides({
      horizontal: Math.abs(centerY - parentCenterY) < threshold,
      vertical: Math.abs(centerX - parentCenterX) < threshold,
    });
  }, [parentWidth, parentHeight]);

  const handleDrag = (_: unknown, d: { x: number; y: number }) => {
    checkAlignment(d.x, d.y, est.width, est.height);
  };

  const handleDragStop = (_: unknown, d: { x: number; y: number }) => {
    setGuides({ horizontal: false, vertical: false });
    updateElementStyles(sectionId, child.id, {
      ...child.styles,
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
    updateElementStyles(sectionId, child.id, {
      ...child.styles,
      [activeView]: {
        ...est,
        width: ref.offsetWidth,
        height: ref.offsetHeight,
        ...pos,
      },
    });
  };

  return (
    <>
      {/* Alignment guides */}
      {guides.horizontal && !isPreview && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '1px',
            backgroundColor: '#ff00ff',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}
      {guides.vertical && !isPreview && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: '1px',
            backgroundColor: '#ff00ff',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}

      <Rnd
        size={{ width: est.width, height: est.height }}
        position={{ x: est.x, y: est.y }}
        bounds="parent"
        disableDragging={child.isEditing || isPreview}
        disableResizing={isPreview}
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        style={{
          zIndex: est.zIndex || 1,
          border: !isPreview && child.isEditing ? '1px solid #00f2ff' : 'none',
          boxShadow: !isPreview && child.isEditing ? '0 0 10px #00f2ff' : 'none',
        }}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {!isPreview && child.isEditing && (
            <div style={{ position: 'absolute', top: '-10px', right: '-30px', display: 'flex', gap: '4px', zIndex: 10 }}>
              <button
                onClick={() => duplicateBoxChild(sectionId, boxId, child.id)}
                style={{
                  width: '20px', height: '20px', borderRadius: '50%', border: 'none',
                  background: '#667eea', color: 'white', fontSize: '10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                +
              </button>
              <button
                onClick={() => deleteBoxChild(sectionId, boxId, child.id)}
                style={{
                  width: '20px', height: '20px', borderRadius: '50%', border: 'none',
                  background: '#ff4757', color: 'white', fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                X
              </button>
            </div>
          )}
          <div
            onDoubleClick={() => !isPreview && setElementEditing(sectionId, child.id, true)}
            style={{ width: '100%', height: '100%', cursor: isPreview ? 'default' : child.isEditing ? 'text' : 'move' }}
          >
            {child.type === 'text' ? (
              <div
                contentEditable={!isPreview && child.isEditing}
                suppressContentEditableWarning
                onBlur={(e) => {
                  updateElementContent(sectionId, child.id, e.currentTarget.innerHTML);
                  setElementEditing(sectionId, child.id, false);
                }}
                style={{
                  fontSize: `${(est as TextElement['styles']['WEB']).fontSize}px`,
                  fontFamily: (est as TextElement['styles']['WEB']).fontFamily,
                  color: (est as TextElement['styles']['WEB']).color,
                  textShadow: (est as TextElement['styles']['WEB']).textShadow || 'none',
                  outline: 'none', width: '100%', height: '100%',
                }}
                dangerouslySetInnerHTML={{ __html: child.content[activeLang] || '' }}
              />
            ) : (
              <img
                src={child.content[activeLang] || ''}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  borderRadius: `${(est as ImageElement['styles']['WEB']).borderRadius || 0}px`,
                }}
                draggable={false}
                alt=""
              />
            )}
          </div>
        </div>
      </Rnd>
    </>
  );
}

export function ElementRenderer({ sectionId, element, parentWidth = 0, parentHeight = 0 }: ElementRendererProps) {
  const {
    activeView,
    activeLang,
    isPreview,
    updateElementStyles,
    updateElementContent,
    setElementEditing,
    deleteElement,
    duplicateElement,
  } = useLandingContext();

  const [guides, setGuides] = useState<AlignmentGuides>({ horizontal: false, vertical: false });

  const est = element.styles[activeView];

  const checkAlignment = useCallback((x: number, y: number, width: number, height: number) => {
    if (!parentWidth || !parentHeight) return;

    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const parentCenterX = parentWidth / 2;
    const parentCenterY = parentHeight / 2;

    const threshold = 5;
    setGuides({
      horizontal: Math.abs(centerY - parentCenterY) < threshold,
      vertical: Math.abs(centerX - parentCenterX) < threshold,
    });
  }, [parentWidth, parentHeight]);

  const handleDrag = (_: unknown, d: { x: number; y: number }) => {
    checkAlignment(d.x, d.y, est.width, est.height);
  };

  const handleDragStop = (_: unknown, d: { x: number; y: number }) => {
    setGuides({ horizontal: false, vertical: false });
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

  // Render Box element
  if (element.type === 'box') {
    const boxEl = element as BoxElement;
    const boxStyle = boxEl.styles[activeView];

    return (
      <>
        {/* Alignment guides for box */}
        {guides.horizontal && !isPreview && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: '1px',
              backgroundColor: '#ff00ff',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}
        {guides.vertical && !isPreview && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              width: '1px',
              backgroundColor: '#ff00ff',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}

        <Rnd
          size={{ width: boxStyle.width, height: boxStyle.height }}
          position={{ x: boxStyle.x, y: boxStyle.y }}
          bounds="parent"
          disableDragging={boxEl.isEditing || isPreview}
          disableResizing={isPreview}
          onDrag={handleDrag}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          style={{
            zIndex: boxStyle.zIndex || 1,
            border: !isPreview && boxEl.isEditing
              ? '2px solid #667eea'
              : !isPreview
              ? `${boxStyle.borderWidth}px dashed ${boxStyle.borderColor}`
              : `${boxStyle.borderWidth}px solid ${boxStyle.borderColor}`,
            borderRadius: `${boxStyle.borderRadius}px`,
            backgroundColor: boxStyle.backgroundColor,
            boxShadow: !isPreview && boxEl.isEditing ? '0 0 15px rgba(102, 126, 234, 0.5)' : 'none',
          }}
        >
          <div
            style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
            onClick={() => !isPreview && setElementEditing(sectionId, element.id, true)}
          >
            {/* Box controls */}
            {!isPreview && boxEl.isEditing && (
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', display: 'flex', gap: '4px', zIndex: 10 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateElement(sectionId, element.id); }}
                  style={{
                    width: '20px', height: '20px', borderRadius: '50%', border: 'none',
                    background: '#667eea', color: 'white', fontSize: '10px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  +
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteElement(sectionId, element.id); }}
                  style={{
                    width: '20px', height: '20px', borderRadius: '50%', border: 'none',
                    background: '#ff4757', color: 'white', fontSize: '12px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  X
                </button>
              </div>
            )}

            {/* Box title badge */}
            {!isPreview && (
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  background: 'rgba(102, 126, 234, 0.8)',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  zIndex: 5,
                }}
              >
                {boxEl.title}
              </div>
            )}

            {/* Render children */}
            {boxEl.children.map((child) => (
              <BoxChildRenderer
                key={child.id}
                sectionId={sectionId}
                boxId={boxEl.id}
                child={child}
                parentWidth={boxStyle.width}
                parentHeight={boxStyle.height}
              />
            ))}
          </div>
        </Rnd>
      </>
    );
  }

  // Render text/image elements
  return (
    <>
      {/* Alignment guides */}
      {guides.horizontal && !isPreview && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '1px',
            backgroundColor: '#ff00ff',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}
      {guides.vertical && !isPreview && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: '1px',
            backgroundColor: '#ff00ff',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}

      <Rnd
        size={{ width: est.width, height: est.height }}
        position={{ x: est.x, y: est.y }}
        bounds="parent"
        disableDragging={element.isEditing || isPreview}
        disableResizing={isPreview}
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        onResizeStop={handleResizeStop}
        style={{
          zIndex: est.zIndex || 1,
          border: !isPreview && element.isEditing ? '1px solid #00f2ff' : 'none',
          boxShadow: !isPreview && element.isEditing ? '0 0 10px #00f2ff' : 'none',
        }}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {!isPreview && element.isEditing && (
            <div style={{ position: 'absolute', top: '-10px', right: '-30px', display: 'flex', gap: '4px', zIndex: 10 }}>
              <button
                onClick={() => duplicateElement(sectionId, element.id)}
                style={{
                  width: '20px', height: '20px', borderRadius: '50%', border: 'none',
                  background: '#667eea', color: 'white', fontSize: '10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                +
              </button>
              <button
                onClick={() => deleteElement(sectionId, element.id)}
                style={{
                  width: '20px', height: '20px', borderRadius: '50%', border: 'none',
                  background: '#ff4757', color: 'white', fontSize: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                X
              </button>
            </div>
          )}
          <div
            onDoubleClick={() => !isPreview && setElementEditing(sectionId, element.id, true)}
            style={{ width: '100%', height: '100%', cursor: isPreview ? 'default' : element.isEditing ? 'text' : 'move' }}
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
                  fontSize: `${(est as TextElement['styles']['WEB']).fontSize}px`,
                  fontFamily: (est as TextElement['styles']['WEB']).fontFamily,
                  color: (est as TextElement['styles']['WEB']).color,
                  textShadow: (est as TextElement['styles']['WEB']).textShadow || 'none',
                  outline: 'none', width: '100%', height: '100%',
                }}
                dangerouslySetInnerHTML={{ __html: (element as TextElement).content[activeLang] || '' }}
              />
            ) : (
              <img
                src={(element as ImageElement).content[activeLang] || ''}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  borderRadius: `${(est as ImageElement['styles']['WEB']).borderRadius || 0}px`,
                }}
                draggable={false}
                alt=""
              />
            )}
          </div>
        </div>
      </Rnd>
    </>
  );
}
