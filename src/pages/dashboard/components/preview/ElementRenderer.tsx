'use client';

import { useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { useLandingContext } from '../../context';
import type { Element, BoxElement, TextElement, ImageElement, ButtonElement, BoxChildElement } from '../../types';

interface AlignmentGuides {
  // Parent center alignment
  parentHorizontal: boolean;
  parentVertical: boolean;
  // Sibling alignment positions
  siblingHorizontalY?: number;
  siblingVerticalX?: number;
}

interface SiblingPosition {
  id: number;
  centerX: number;
  centerY: number;
}

interface ElementRendererProps {
  sectionId: number;
  element: Element;
  parentWidth?: number;
  parentHeight?: number;
  siblingPositions?: SiblingPosition[];
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
    openPopup,
  } = useLandingContext();

  const [guides, setGuides] = useState<AlignmentGuides>({ parentHorizontal: false, parentVertical: false });

  const est = child.styles[activeView];

  const checkAlignment = useCallback((x: number, y: number, width: number, height: number) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const parentCenterX = parentWidth / 2;
    const parentCenterY = parentHeight / 2;

    const threshold = 5;
    setGuides({
      parentHorizontal: Math.abs(centerY - parentCenterY) < threshold,
      parentVertical: Math.abs(centerX - parentCenterX) < threshold,
    });
  }, [parentWidth, parentHeight]);

  const handleDrag = (_: unknown, d: { x: number; y: number }) => {
    checkAlignment(d.x, d.y, est.width, est.height);
  };

  const handleDragStop = (_: unknown, d: { x: number; y: number }) => {
    setGuides({ parentHorizontal: false, parentVertical: false });
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
      {/* Alignment guides - parent center */}
      {guides.parentHorizontal && !isPreview && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '2px',
            backgroundColor: '#ff00ff',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}
      {guides.parentVertical && !isPreview && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: '2px',
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
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'visible' }}>
          {!isPreview && child.isEditing && (
            <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px', zIndex: 9999 }}>
              <button
                onClick={() => duplicateBoxChild(sectionId, boxId, child.id)}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white',
                  background: '#667eea', color: 'white', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                +
              </button>
              <button
                onClick={() => deleteBoxChild(sectionId, boxId, child.id)}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white',
                  background: '#ff4757', color: 'white', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
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
            ) : child.type === 'button' ? (
              <button
                onClick={(e) => {
                  if (!isPreview) return;
                  const btnEl = child as ButtonElement;
                  if (btnEl.action.type === 'link' && btnEl.action.value) {
                    window.open(btnEl.action.value, '_blank');
                  } else if (btnEl.action.type === 'popup' && btnEl.action.value) {
                    e.stopPropagation();
                    openPopup(Number(btnEl.action.value), sectionId);
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  fontSize: `${(est as ButtonElement['styles']['WEB']).fontSize}px`,
                  fontFamily: (est as ButtonElement['styles']['WEB']).fontFamily,
                  color: (est as ButtonElement['styles']['WEB']).color,
                  backgroundColor: (est as ButtonElement['styles']['WEB']).backgroundColor,
                  border: `${(est as ButtonElement['styles']['WEB']).borderWidth}px solid ${(est as ButtonElement['styles']['WEB']).borderColor}`,
                  borderRadius: `${(est as ButtonElement['styles']['WEB']).borderRadius}px`,
                  cursor: isPreview ? 'pointer' : 'move',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {(child as ButtonElement).useImage ? (
                  <img
                    src={(child as ButtonElement).image[activeLang] || ''}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    draggable={false}
                    alt=""
                  />
                ) : (
                  child.content[activeLang] || 'Button'
                )}
              </button>
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

export function ElementRenderer({ sectionId, element, parentWidth = 0, parentHeight = 0, siblingPositions = [] }: ElementRendererProps) {
  const {
    activeView,
    activeLang,
    isPreview,
    updateElementStyles,
    updateElementContent,
    setElementEditing,
    deleteElement,
    duplicateElement,
    openPopup,
  } = useLandingContext();

  const [guides, setGuides] = useState<AlignmentGuides>({ parentHorizontal: false, parentVertical: false });

  const est = element.styles[activeView];

  const checkAlignment = useCallback((x: number, y: number, width: number, height: number) => {
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const threshold = 5;

    let parentHorizontal = false;
    let parentVertical = false;
    let siblingHorizontalY: number | undefined;
    let siblingVerticalX: number | undefined;

    // Check alignment with parent center
    if (parentWidth && parentHeight) {
      const parentCenterX = parentWidth / 2;
      const parentCenterY = parentHeight / 2;

      if (Math.abs(centerY - parentCenterY) < threshold) {
        parentHorizontal = true;
      }
      if (Math.abs(centerX - parentCenterX) < threshold) {
        parentVertical = true;
      }
    }

    // Check alignment with sibling elements
    for (const sibling of siblingPositions) {
      // Horizontal alignment (same Y center)
      if (Math.abs(centerY - sibling.centerY) < threshold) {
        siblingHorizontalY = sibling.centerY;
      }
      // Vertical alignment (same X center)
      if (Math.abs(centerX - sibling.centerX) < threshold) {
        siblingVerticalX = sibling.centerX;
      }
    }

    setGuides({ parentHorizontal, parentVertical, siblingHorizontalY, siblingVerticalX });
  }, [parentWidth, parentHeight, siblingPositions]);

  const handleDrag = (_: unknown, d: { x: number; y: number }) => {
    checkAlignment(d.x, d.y, est.width, est.height);
  };

  const handleDragStop = (_: unknown, d: { x: number; y: number }) => {
    setGuides({ parentHorizontal: false, parentVertical: false, siblingHorizontalY: undefined, siblingVerticalX: undefined });
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
        {/* Alignment guides for box - parent center (magenta) */}
        {guides.parentHorizontal && !isPreview && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: '2px',
              backgroundColor: '#ff00ff',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}
        {guides.parentVertical && !isPreview && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              width: '2px',
              backgroundColor: '#ff00ff',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}
        {/* Alignment guides for box - sibling alignment (green) */}
        {guides.siblingHorizontalY !== undefined && !isPreview && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${guides.siblingHorizontalY}px`,
              height: '2px',
              backgroundColor: '#00ff00',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}
        {guides.siblingVerticalX !== undefined && !isPreview && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${guides.siblingVerticalX}px`,
              width: '2px',
              backgroundColor: '#00ff00',
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
            style={{ width: '100%', height: '100%', position: 'relative', overflow: 'visible' }}
            onClick={() => !isPreview && setElementEditing(sectionId, element.id, true)}
          >
            {/* Box controls */}
            {!isPreview && boxEl.isEditing && (
              <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px', zIndex: 9999 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateElement(sectionId, element.id); }}
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white',
                    background: '#667eea', color: 'white', fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  +
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteElement(sectionId, element.id); }}
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white',
                    background: '#ff4757', color: 'white', fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
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

  // Render button element
  if (element.type === 'button') {
    const btnEl = element as ButtonElement;
    const btnStyle = btnEl.styles[activeView];

    return (
      <>
        {/* Alignment guides for button - parent center (magenta) */}
        {guides.parentHorizontal && !isPreview && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '50%',
              height: '2px',
              backgroundColor: '#ff00ff',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}
        {guides.parentVertical && !isPreview && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: '50%',
              width: '2px',
              backgroundColor: '#ff00ff',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}
        {/* Alignment guides for button - sibling alignment (green) */}
        {guides.siblingHorizontalY !== undefined && !isPreview && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${guides.siblingHorizontalY}px`,
              height: '2px',
              backgroundColor: '#00ff00',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}
        {guides.siblingVerticalX !== undefined && !isPreview && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${guides.siblingVerticalX}px`,
              width: '2px',
              backgroundColor: '#00ff00',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        )}

        <Rnd
          size={{ width: btnStyle.width, height: btnStyle.height }}
          position={{ x: btnStyle.x, y: btnStyle.y }}
          bounds="parent"
          disableDragging={btnEl.isEditing || isPreview}
          disableResizing={isPreview}
          onDrag={handleDrag}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
          style={{
            zIndex: btnStyle.zIndex || 1,
            border: !isPreview && btnEl.isEditing ? '2px solid #38ef7d' : 'none',
            borderRadius: `${btnStyle.borderRadius}px`,
            boxShadow: !isPreview && btnEl.isEditing ? '0 0 15px rgba(56, 239, 125, 0.5)' : 'none',
          }}
        >
          <div
            style={{ width: '100%', height: '100%', position: 'relative', overflow: 'visible' }}
            onClick={() => !isPreview && setElementEditing(sectionId, element.id, true)}
          >
            {/* Button controls */}
            {!isPreview && btnEl.isEditing && (
              <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px', zIndex: 9999 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); duplicateElement(sectionId, element.id); }}
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white',
                    background: '#667eea', color: 'white', fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  +
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteElement(sectionId, element.id); }}
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white',
                    background: '#ff4757', color: 'white', fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  X
                </button>
              </div>
            )}

            {/* Button type badge */}
            {!isPreview && (
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  background: 'rgba(56, 239, 125, 0.8)',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  zIndex: 5,
                }}
              >
                BTN
              </div>
            )}

            <button
              onClick={(e) => {
                if (!isPreview) return;
                if (btnEl.action.type === 'link' && btnEl.action.value) {
                  window.open(btnEl.action.value, '_blank');
                } else if (btnEl.action.type === 'popup' && btnEl.action.value) {
                  e.stopPropagation();
                  openPopup(Number(btnEl.action.value), sectionId);
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                fontSize: `${btnStyle.fontSize}px`,
                fontFamily: btnStyle.fontFamily,
                color: btnStyle.color,
                backgroundColor: btnStyle.backgroundColor,
                border: `${btnStyle.borderWidth}px solid ${btnStyle.borderColor}`,
                borderRadius: `${btnStyle.borderRadius}px`,
                cursor: isPreview ? 'pointer' : 'move',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                padding: 0,
              }}
            >
              {btnEl.useImage ? (
                <img
                  src={btnEl.image[activeLang] || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  draggable={false}
                  alt=""
                />
              ) : (
                btnEl.content[activeLang] || 'Button'
              )}
            </button>
          </div>
        </Rnd>
      </>
    );
  }

  // Render text/image elements
  return (
    <>
      {/* Alignment guides - parent center (magenta) */}
      {guides.parentHorizontal && !isPreview && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: '2px',
            backgroundColor: '#ff00ff',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}
      {guides.parentVertical && !isPreview && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: '50%',
            width: '2px',
            backgroundColor: '#ff00ff',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}
      {/* Alignment guides - sibling alignment (green) */}
      {guides.siblingHorizontalY !== undefined && !isPreview && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${guides.siblingHorizontalY}px`,
            height: '2px',
            backgroundColor: '#00ff00',
            pointerEvents: 'none',
            zIndex: 1000,
          }}
        />
      )}
      {guides.siblingVerticalX !== undefined && !isPreview && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${guides.siblingVerticalX}px`,
            width: '2px',
            backgroundColor: '#00ff00',
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
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'visible' }}>
          {!isPreview && element.isEditing && (
            <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px', zIndex: 9999 }}>
              <button
                onClick={() => duplicateElement(sectionId, element.id)}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white',
                  background: '#667eea', color: 'white', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                +
              </button>
              <button
                onClick={() => deleteElement(sectionId, element.id)}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%', border: '2px solid white',
                  background: '#ff4757', color: 'white', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
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
