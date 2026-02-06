'use client';

import { useLandingContext } from '../../context';

export function PopupRenderer() {
  const { activePopupId, popups, activeLang, activeView, closePopup } = useLandingContext();

  if (activePopupId === null) return null;

  const popup = popups.find((p) => p.id === activePopupId);
  if (!popup) return null;

  const pst = popup.styles[activeView];

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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={closePopup}
    >
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
        {/* Close button */}
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
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 71, 87, 0.5)')}
          onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
        >
          X
        </button>

        {/* Popup content */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          {popup.useImage && popup.image[activeLang] && (
            <img
              src={popup.image[activeLang]}
              alt=""
              style={{
                maxWidth: '100%',
                maxHeight: popup.content[activeLang] ? '60%' : '90%',
                objectFit: 'contain',
                borderRadius: '8px',
                marginBottom: popup.content[activeLang] ? '16px' : 0,
              }}
            />
          )}

          {popup.content[activeLang] && (
            <div
              style={{
                fontSize: `${pst.fontSize}px`,
                fontFamily: pst.fontFamily,
                color: pst.color,
                textAlign: 'center',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflow: 'auto',
                maxHeight: popup.useImage ? '40%' : '100%',
              }}
              dangerouslySetInnerHTML={{ __html: popup.content[activeLang] }}
            />
          )}
        </div>
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
