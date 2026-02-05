'use client';

import { useLandingContext } from '../../context';
import type { Section } from '../../types';
import { ElementRenderer } from './ElementRenderer';

interface SectionRendererProps {
  section: Section;
}

export function SectionRenderer({ section }: SectionRendererProps) {
  const { activeView, clearAllEditing } = useLandingContext();
  const st = section.styles[activeView];

  const handleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearAllEditing();
    }
  };

  return (
    <div
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
        position: 'relative',
        zIndex: st.zIndex || 1,
      }}
      onClick={handleClick}
    >
      {section.elements.map((el) => (
        <ElementRenderer key={el.id} sectionId={section.id} element={el} />
      ))}
    </div>
  );
}
