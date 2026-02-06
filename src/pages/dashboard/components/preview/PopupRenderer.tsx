'use client';

import { useState, useEffect } from 'react';
import { useLandingContext } from '../../context';
import { LANGUAGES } from '../../constants';
import type { Language, PopupTextElement, PopupImageElement } from '../../types';

export function PopupRenderer() {
  const { activePopupId, popupTriggerSectionId, popups, activeLang, activeView, closePopup } = useLandingContext();
  const [previewLang, setPreviewLang] = useState<Language | null>(null);
  const lang = previewLang ?? activeLang;

  useEffect(() => {
    if (activePopupId === null) return;

    // Scroll triggering section into view
    if (popupTriggerSectionId !== null) {
      const sectionEl = document.querySelector(`[data-section-id="${popupTriggerSectionId}"]`);
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activePopupId, popupTriggerSectionId]);

  if (activePopupId === null) return null;

  const popup = popups.find((p) => p.id === activePopupId);
  if (!popup) return null;

  const pst = popup.styles[activeView];
  const closeBtn = popup.closeButton;
  const closeBtnStyle = closeBtn?.styles?.[activeView];

  // Fallback for old popup structure without closeButton
  if (!closeBtnStyle) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}
        onClick={closePopup}
      >
        <div
          style={{
            width: `${pst.width}px`,
            height: `${pst.height}px`,
            backgroundColor: pst.backgroundColor,
            borderRadius: `${pst.borderRadius}px`,
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={closePopup}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            X
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={closePopup}
    >
      {/* Language switcher bar */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '12px',
          padding: '6px 10px',
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '8px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {LANGUAGES.map((l) => (
          <button
            key={l}
            onClick={() => setPreviewLang(l)}
            style={{
              padding: '4px 10px',
              border: 'none',
              borderRadius: '4px',
              background: lang === l ? '#667eea' : 'rgba(255,255,255,0.1)',
              color: lang === l ? '#fff' : '#8e8e93',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      <div
        style={{
          width: `${pst.width}px`,
          height: `${pst.height}px`,
          backgroundColor: pst.backgroundColor,
          borderRadius: `${pst.borderRadius}px`,
          border: `${pst.borderWidth}px solid ${pst.borderColor}`,
          position: 'relative',
          overflow: 'hidden',
          animation: 'popIn 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Customizable Close button */}
        <button
          onClick={closePopup}
          style={{
            position: 'absolute',
            top: closeBtnStyle.x === -1 ? '10px' : `${closeBtnStyle.y}px`,
            right: closeBtnStyle.x === -1 ? '10px' : 'auto',
            left: closeBtnStyle.x === -1 ? 'auto' : `${closeBtnStyle.x}px`,
            width: `${closeBtnStyle.width}px`,
            height: `${closeBtnStyle.height}px`,
            borderRadius: `${closeBtnStyle.borderRadius}px`,
            border: 'none',
            background: closeBtn.useImage ? 'transparent' : closeBtnStyle.backgroundColor,
            color: closeBtnStyle.color,
            fontSize: `${closeBtnStyle.fontSize}px`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            overflow: 'hidden',
            padding: 0,
            transition: 'opacity 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {closeBtn.useImage && closeBtn.image[lang] ? (
            <img
              src={closeBtn.image[lang]}
              alt="close"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            'X'
          )}
        </button>

        {/* Popup children elements */}
        {popup.children.map((child) => {
          const est = child.styles[activeView];

          if (child.type === 'text') {
            const textStyle = est as PopupTextElement['styles']['WEB'];
            return (
              <div
                key={child.id}
                style={{
                  position: 'absolute',
                  left: `${textStyle.x}px`,
                  top: `${textStyle.y}px`,
                  width: `${textStyle.width}px`,
                  height: `${textStyle.height}px`,
                  fontSize: `${textStyle.fontSize}px`,
                  fontFamily: textStyle.fontFamily,
                  color: textStyle.color,
                  textShadow: textStyle.textShadow || 'none',
                  zIndex: textStyle.zIndex || 1,
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflow: 'hidden',
                }}
                dangerouslySetInnerHTML={{ __html: child.content[lang] || '' }}
              />
            );
          }

          // Image element
          const imgStyle = est as PopupImageElement['styles']['WEB'];
          return (
            <img
              key={child.id}
              src={child.content[lang] || ''}
              alt=""
              style={{
                position: 'absolute',
                left: `${imgStyle.x}px`,
                top: `${imgStyle.y}px`,
                width: `${imgStyle.width}px`,
                height: `${imgStyle.height}px`,
                objectFit: 'cover',
                borderRadius: `${imgStyle.borderRadius || 0}px`,
                zIndex: imgStyle.zIndex || 1,
              }}
            />
          );
        })}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes popIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
}
