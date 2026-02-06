'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLandingContext } from '../../context';
import { FONTS, LANGUAGES, VIEWPORTS } from '../../constants';
import type { Section, TextElement, ImageElement, BoxElement, ButtonElement, Popup } from '../../types';
import styles from './ConfigModal.module.scss';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function CollapsibleElement({
  sectionId,
  element,
  activeView,
  activeLang,
  updateElementStyle,
  updateElementContent,
  setElementSameForAllLangs,
  duplicateElement,
  deleteElement,
  addElementToBox,
  deleteBoxChild,
  updateBoxTitle,
  updateButtonAction,
  updateButtonImage,
  setButtonUseImage,
  popups,
}: {
  sectionId: number;
  element: Section['elements'][number];
  activeView: 'WEB' | 'MOB';
  activeLang: 'GE' | 'EN' | 'RU' | 'TR';
  updateElementStyle: (sId: number, elId: number, field: string, value: unknown) => void;
  updateElementContent: (sId: number, elId: number, content: string, targetLang?: 'GE' | 'EN' | 'RU' | 'TR') => void;
  setElementSameForAllLangs: (sId: number, elId: number, value: boolean) => void;
  duplicateElement: (sId: number, elId: number) => void;
  deleteElement: (sId: number, elId: number) => void;
  addElementToBox: (sId: number, boxId: number, type: 'text' | 'image' | 'button') => void;
  deleteBoxChild: (sId: number, boxId: number, childId: number) => void;
  updateBoxTitle: (sId: number, boxId: number, title: string) => void;
  updateButtonAction: (sId: number, elId: number, actionType: 'link' | 'popup', actionValue: string) => void;
  updateButtonImage: (sId: number, elId: number, imageData: string, targetLang?: 'GE' | 'EN' | 'RU' | 'TR') => void;
  setButtonUseImage: (sId: number, elId: number, useImage: boolean) => void;
  popups: Popup[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const label = element.type === 'box' ? `BOX: ${(element as BoxElement).title}` : element.type.toUpperCase();

  return (
    <div className={styles.elementItem}>
      <div
        className={styles.elementHeader}
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={styles.collapseArrow} style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
          <span className={styles.elementType}>{label}</span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={styles.duplicateBtn}
            onClick={(e) => { e.stopPropagation(); duplicateElement(sectionId, element.id); }}
            title="Duplicate"
          >
            ++
          </button>
          <button
            className={styles.deleteBtn}
            onClick={(e) => { e.stopPropagation(); deleteElement(sectionId, element.id); }}
          >
            X
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={styles.elementBody}>
          {element.type === 'text' ? (
            <TextElementForm
              sectionId={sectionId}
              element={element as TextElement}
              activeView={activeView}
              activeLang={activeLang}
              updateElementStyle={updateElementStyle}
              updateElementContent={updateElementContent}
              setElementSameForAllLangs={setElementSameForAllLangs}
            />
          ) : element.type === 'image' ? (
            <ImageElementForm
              sectionId={sectionId}
              element={element as ImageElement}
              activeView={activeView}
              activeLang={activeLang}
              updateElementStyle={updateElementStyle}
              updateElementContent={updateElementContent}
              setElementSameForAllLangs={setElementSameForAllLangs}
            />
          ) : element.type === 'button' ? (
            <ButtonElementForm
              sectionId={sectionId}
              element={element as ButtonElement}
              activeView={activeView}
              activeLang={activeLang}
              updateElementStyle={updateElementStyle}
              updateElementContent={updateElementContent}
              setElementSameForAllLangs={setElementSameForAllLangs}
              updateButtonAction={updateButtonAction}
              updateButtonImage={updateButtonImage}
              setButtonUseImage={setButtonUseImage}
              popups={popups}
            />
          ) : (
            <BoxElementForm
              sectionId={sectionId}
              element={element as BoxElement}
              activeView={activeView}
              activeLang={activeLang}
              updateElementStyle={updateElementStyle}
              updateElementContent={updateElementContent}
              setElementSameForAllLangs={setElementSameForAllLangs}
              addElementToBox={addElementToBox}
              deleteBoxChild={deleteBoxChild}
              updateBoxTitle={updateBoxTitle}
              updateButtonAction={updateButtonAction}
              updateButtonImage={updateButtonImage}
              setButtonUseImage={setButtonUseImage}
              popups={popups}
            />
          )}
        </div>
      )}
    </div>
  );
}

function SortableSectionCard({ section }: { section: Section }) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    activeView,
    activeLang,
    updateSectionStyle,
    deleteSection,
    addElement,
    addElementToBox,
    duplicateElement,
    updateElementStyle,
    updateElementContent,
    deleteElement,
    deleteBoxChild,
    setElementSameForAllLangs,
    updateBoxTitle,
    updateButtonAction,
    updateButtonImage,
    setButtonUseImage,
    popups,
  } = useLandingContext();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const st = section.styles[activeView];

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = () => updateSectionStyle(section.id, 'backgroundImage', r.result as string);
      r.readAsDataURL(f);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.sectionCard} ${isOpen ? styles['sectionCard--active'] : ''}`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.dragHandle} {...attributes} {...listeners}>
          :::
        </div>
        <div className={styles.cardTitle} onClick={() => setIsOpen(!isOpen)}>
          <div className={styles.colorDot} style={{ background: st.backgroundColor }} />
          <span className={styles.cardName}>{section.title}</span>
        </div>
        <button className={styles.deleteBtn} onClick={() => deleteSection(section.id)}>
          X
        </button>
      </div>

      {isOpen && (
        <div className={styles.cardContent}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Size (W / H)</label>
            <div className={styles.fieldRow}>
              <input
                type="text"
                className={styles.input}
                value={st.width}
                onChange={(e) => updateSectionStyle(section.id, 'width', e.target.value)}
                placeholder="100%"
              />
              <input
                type="number"
                className={`${styles.input} ${styles.inputSmall}`}
                value={st.height}
                onChange={(e) => updateSectionStyle(section.id, 'height', Number(e.target.value))}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Margin (Top / Bottom)</label>
            <div className={styles.fieldRow}>
              <input
                type="number"
                className={`${styles.input} ${styles.inputSmall}`}
                value={st.marginTop}
                onChange={(e) => updateSectionStyle(section.id, 'marginTop', Number(e.target.value))}
              />
              <input
                type="number"
                className={`${styles.input} ${styles.inputSmall}`}
                value={st.marginBottom}
                onChange={(e) => updateSectionStyle(section.id, 'marginBottom', Number(e.target.value))}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Border (Width / Radius)</label>
            <div className={styles.fieldRow}>
              <input
                type="number"
                className={`${styles.input} ${styles.inputSmall}`}
                value={st.borderWidth}
                onChange={(e) => updateSectionStyle(section.id, 'borderWidth', Number(e.target.value))}
              />
              <input
                type="number"
                className={`${styles.input} ${styles.inputSmall}`}
                value={st.borderRadius}
                onChange={(e) => updateSectionStyle(section.id, 'borderRadius', Number(e.target.value))}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Colors (BG / Border)</label>
            <div className={styles.fieldRow}>
              <input
                type="color"
                className={styles.colorInput}
                value={st.backgroundColor === 'transparent' ? '#000000' : st.backgroundColor}
                onChange={(e) => updateSectionStyle(section.id, 'backgroundColor', e.target.value)}
              />
              <button
                className={styles.clearBtn}
                onClick={() => updateSectionStyle(section.id, 'backgroundColor', 'transparent')}
              >
                Clear
              </button>
              <input
                type="color"
                className={styles.colorInput}
                value={st.borderColor}
                onChange={(e) => updateSectionStyle(section.id, 'borderColor', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Background Image</label>
            <input type="file" className={styles.fileInput} onChange={handleBgUpload} accept="image/*" />
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.btnText} onClick={() => addElement(section.id, 'text')}>
              + Text
            </button>
            <button className={styles.btnImage} onClick={() => addElement(section.id, 'image')}>
              + Image
            </button>
            <button className={styles.btnBox} onClick={() => addElement(section.id, 'box')}>
              + Box
            </button>
            <button className={styles.btnButton} onClick={() => addElement(section.id, 'button')}>
              + Button
            </button>
          </div>

          {section.elements.map((el) => (
            <CollapsibleElement
              key={el.id}
              sectionId={section.id}
              element={el}
              activeView={activeView}
              activeLang={activeLang}
              updateElementStyle={updateElementStyle}
              updateElementContent={updateElementContent}
              setElementSameForAllLangs={setElementSameForAllLangs}
              duplicateElement={duplicateElement}
              deleteElement={deleteElement}
              addElementToBox={addElementToBox}
              deleteBoxChild={deleteBoxChild}
              updateBoxTitle={updateBoxTitle}
              updateButtonAction={updateButtonAction}
              updateButtonImage={updateButtonImage}
              setButtonUseImage={setButtonUseImage}
              popups={popups}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TextElementForm({
  sectionId,
  element,
  activeView,
  activeLang,
  updateElementStyle,
  updateElementContent,
  setElementSameForAllLangs,
}: {
  sectionId: number;
  element: TextElement;
  activeView: 'WEB' | 'MOB';
  activeLang: 'GE' | 'EN' | 'RU' | 'TR';
  updateElementStyle: (sId: number, elId: number, field: string, value: unknown) => void;
  updateElementContent: (sId: number, elId: number, content: string, targetLang?: 'GE' | 'EN' | 'RU' | 'TR') => void;
  setElementSameForAllLangs: (sId: number, elId: number, value: boolean) => void;
}) {
  const est = element.styles[activeView];
  const isSameForAll = element.sameForAllLangs ?? false;

  return (
    <>
      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>
          <span className={styles.toggleIcon}>🌐</span>
          Same for all languages
        </span>
        <button
          className={`${styles.toggle} ${isSameForAll ? styles['toggle--active'] : ''}`}
          onClick={() => setElementSameForAllLangs(sectionId, element.id, !isSameForAll)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          Content {isSameForAll ? '(All)' : `(${activeLang})`}
        </label>
        <textarea
          className={styles.textarea}
          value={element.content[activeLang] || ''}
          onChange={(e) => updateElementContent(sectionId, element.id, e.target.value, activeLang)}
          placeholder="Enter text..."
        />
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Font Size / Color</label>
        <div className={styles.fieldRow}>
          <input
            type="number"
            className={`${styles.input} ${styles.inputSmall}`}
            value={est.fontSize}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'fontSize', Number(e.target.value))}
          />
          <input
            type="color"
            className={styles.colorInput}
            value={est.color}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'color', e.target.value)}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Font Family</label>
        <select
          className={styles.select}
          value={est.fontFamily}
          onChange={(e) => updateElementStyle(sectionId, element.id, 'fontFamily', e.target.value)}
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Text Shadow</label>
        <input
          type="text"
          className={styles.input}
          value={est.textShadow || ''}
          onChange={(e) => updateElementStyle(sectionId, element.id, 'textShadow', e.target.value)}
          placeholder="2px 2px 4px rgba(0,0,0,0.5)"
        />
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Z-Index</label>
        <input
          type="number"
          className={`${styles.input} ${styles.inputSmall}`}
          value={est.zIndex || 1}
          onChange={(e) => updateElementStyle(sectionId, element.id, 'zIndex', Number(e.target.value))}
        />
      </div>
    </>
  );
}

function ImageElementForm({
  sectionId,
  element,
  activeView,
  activeLang,
  updateElementStyle,
  updateElementContent,
  setElementSameForAllLangs,
}: {
  sectionId: number;
  element: ImageElement;
  activeView: 'WEB' | 'MOB';
  activeLang: 'GE' | 'EN' | 'RU' | 'TR';
  updateElementStyle: (sId: number, elId: number, field: string, value: unknown) => void;
  updateElementContent: (sId: number, elId: number, content: string, targetLang?: 'GE' | 'EN' | 'RU' | 'TR') => void;
  setElementSameForAllLangs: (sId: number, elId: number, value: boolean) => void;
}) {
  const est = element.styles[activeView];
  const isSameForAll = element.sameForAllLangs ?? false;
  const currentImage = element.content[activeLang] || '';

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = () => updateElementContent(sectionId, element.id, r.result as string, activeLang);
      r.readAsDataURL(f);
    }
  };

  return (
    <>
      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>
          <span className={styles.toggleIcon}>🌐</span>
          Same for all languages
        </span>
        <button
          className={`${styles.toggle} ${isSameForAll ? styles['toggle--active'] : ''}`}
          onClick={() => setElementSameForAllLangs(sectionId, element.id, !isSameForAll)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>
          Image {isSameForAll ? '(All)' : `(${activeLang})`}
        </label>
        <input type="file" className={styles.fileInput} onChange={handleUpload} accept="image/*" />
        {currentImage && (
          <div className={styles.imagePreview} style={{ marginTop: '8px' }}>
            <img src={currentImage} alt="Preview" />
          </div>
        )}
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Size (W / H / Radius)</label>
        <div className={styles.fieldRow}>
          <input
            type="number"
            className={`${styles.input} ${styles.inputSmall}`}
            value={est.width}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'width', Number(e.target.value))}
          />
          <input
            type="number"
            className={`${styles.input} ${styles.inputSmall}`}
            value={est.height}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'height', Number(e.target.value))}
          />
          <input
            type="number"
            className={`${styles.input} ${styles.inputSmall}`}
            value={est.borderRadius}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'borderRadius', Number(e.target.value))}
          />
        </div>
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Z-Index</label>
        <input
          type="number"
          className={`${styles.input} ${styles.inputSmall}`}
          value={est.zIndex || 1}
          onChange={(e) => updateElementStyle(sectionId, element.id, 'zIndex', Number(e.target.value))}
        />
      </div>
    </>
  );
}

function ButtonElementForm({
  sectionId,
  element,
  activeView,
  activeLang,
  updateElementStyle,
  updateElementContent,
  setElementSameForAllLangs,
  updateButtonAction,
  updateButtonImage,
  setButtonUseImage,
  popups,
}: {
  sectionId: number;
  element: ButtonElement;
  activeView: 'WEB' | 'MOB';
  activeLang: 'GE' | 'EN' | 'RU' | 'TR';
  updateElementStyle: (sId: number, elId: number, field: string, value: unknown) => void;
  updateElementContent: (sId: number, elId: number, content: string, targetLang?: 'GE' | 'EN' | 'RU' | 'TR') => void;
  setElementSameForAllLangs: (sId: number, elId: number, value: boolean) => void;
  updateButtonAction: (sId: number, elId: number, actionType: 'link' | 'popup', actionValue: string) => void;
  updateButtonImage: (sId: number, elId: number, imageData: string, targetLang?: 'GE' | 'EN' | 'RU' | 'TR') => void;
  setButtonUseImage: (sId: number, elId: number, useImage: boolean) => void;
  popups: Popup[];
}) {
  const est = element.styles[activeView];
  const isSameForAll = element.sameForAllLangs ?? false;
  const currentImage = element.image[activeLang] || '';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = () => updateButtonImage(sectionId, element.id, r.result as string, activeLang);
      r.readAsDataURL(f);
    }
  };

  return (
    <>
      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>
          <span className={styles.toggleIcon}>*</span>
          Same for all languages
        </span>
        <button
          className={`${styles.toggle} ${isSameForAll ? styles['toggle--active'] : ''}`}
          onClick={() => setElementSameForAllLangs(sectionId, element.id, !isSameForAll)}
        />
      </div>

      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>
          <span className={styles.toggleIcon}>IMG</span>
          Use Image
        </span>
        <button
          className={`${styles.toggle} ${element.useImage ? styles['toggle--active'] : ''}`}
          onClick={() => setButtonUseImage(sectionId, element.id, !element.useImage)}
        />
      </div>

      {element.useImage ? (
        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            Button Image {isSameForAll ? '(All)' : `(${activeLang})`}
          </label>
          <input type="file" className={styles.fileInput} onChange={handleImageUpload} accept="image/*" />
          {currentImage && (
            <div className={styles.imagePreview} style={{ marginTop: '8px' }}>
              <img src={currentImage} alt="Preview" />
            </div>
          )}
        </div>
      ) : (
        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            Button Text {isSameForAll ? '(All)' : `(${activeLang})`}
          </label>
          <input
            type="text"
            className={styles.input}
            value={element.content[activeLang] || ''}
            onChange={(e) => updateElementContent(sectionId, element.id, e.target.value, activeLang)}
            placeholder="Button text..."
          />
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Action Type</label>
        <select
          className={styles.select}
          value={element.action.type}
          onChange={(e) => updateButtonAction(sectionId, element.id, e.target.value as 'link' | 'popup', element.action.value)}
        >
          <option value="link">Link</option>
          <option value="popup">Popup</option>
        </select>
      </div>

      {element.action.type === 'link' ? (
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Link URL</label>
          <input
            type="text"
            className={styles.input}
            value={element.action.value}
            onChange={(e) => updateButtonAction(sectionId, element.id, 'link', e.target.value)}
            placeholder="https://..."
          />
        </div>
      ) : (
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Select Popup</label>
          <select
            className={styles.select}
            value={element.action.value}
            onChange={(e) => updateButtonAction(sectionId, element.id, 'popup', e.target.value)}
          >
            <option value="">-- Select Popup --</option>
            {popups.map((p) => (
              <option key={p.id} value={String(p.id)}>{p.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Size (W / H)</label>
        <div className={styles.fieldRow}>
          <input
            type="number"
            className={`${styles.input} ${styles.inputSmall}`}
            value={est.width}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'width', Number(e.target.value))}
          />
          <input
            type="number"
            className={`${styles.input} ${styles.inputSmall}`}
            value={est.height}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'height', Number(e.target.value))}
          />
        </div>
      </div>

      {!element.useImage && (
        <>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Font Size / Color</label>
            <div className={styles.fieldRow}>
              <input
                type="number"
                className={`${styles.input} ${styles.inputSmall}`}
                value={est.fontSize}
                onChange={(e) => updateElementStyle(sectionId, element.id, 'fontSize', Number(e.target.value))}
              />
              <input
                type="color"
                className={styles.colorInput}
                value={est.color}
                onChange={(e) => updateElementStyle(sectionId, element.id, 'color', e.target.value)}
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Font Family</label>
            <select
              className={styles.select}
              value={est.fontFamily}
              onChange={(e) => updateElementStyle(sectionId, element.id, 'fontFamily', e.target.value)}
            >
              {FONTS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Background Color</label>
        <div className={styles.fieldRow}>
          <input
            type="color"
            className={styles.colorInput}
            value={est.backgroundColor === 'transparent' ? '#000000' : est.backgroundColor}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'backgroundColor', e.target.value)}
          />
          <button
            className={styles.clearBtn}
            onClick={() => updateElementStyle(sectionId, element.id, 'backgroundColor', 'transparent')}
          >
            Clear
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Border (Width / Radius / Color)</label>
        <div className={styles.fieldRow}>
          <input
            type="number"
            className={`${styles.input} ${styles.inputSmall}`}
            value={est.borderWidth}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'borderWidth', Number(e.target.value))}
          />
          <input
            type="number"
            className={`${styles.input} ${styles.inputSmall}`}
            value={est.borderRadius}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'borderRadius', Number(e.target.value))}
          />
          <input
            type="color"
            className={styles.colorInput}
            value={est.borderColor}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'borderColor', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Z-Index</label>
        <input
          type="number"
          className={`${styles.input} ${styles.inputSmall}`}
          value={est.zIndex || 1}
          onChange={(e) => updateElementStyle(sectionId, element.id, 'zIndex', Number(e.target.value))}
        />
      </div>
    </>
  );
}

function CollapsibleBoxChild({
  sectionId,
  boxId,
  child,
  activeView,
  activeLang,
  updateElementStyle,
  updateElementContent,
  setElementSameForAllLangs,
  deleteBoxChild,
  updateButtonAction,
  updateButtonImage,
  setButtonUseImage,
  popups,
}: {
  sectionId: number;
  boxId: number;
  child: BoxElement['children'][number];
  activeView: 'WEB' | 'MOB';
  activeLang: 'GE' | 'EN' | 'RU' | 'TR';
  updateElementStyle: (sId: number, elId: number, field: string, value: unknown) => void;
  updateElementContent: (sId: number, elId: number, content: string, targetLang?: 'GE' | 'EN' | 'RU' | 'TR') => void;
  setElementSameForAllLangs: (sId: number, elId: number, value: boolean) => void;
  deleteBoxChild: (sId: number, boxId: number, childId: number) => void;
  updateButtonAction: (sId: number, elId: number, actionType: 'link' | 'popup', actionValue: string) => void;
  updateButtonImage: (sId: number, elId: number, imageData: string, targetLang?: 'GE' | 'EN' | 'RU' | 'TR') => void;
  setButtonUseImage: (sId: number, elId: number, useImage: boolean) => void;
  popups: Popup[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.boxChildItem}>
      <div
        className={styles.elementHeader}
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={styles.collapseArrow} style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', fontSize: '7px' }}>&#9654;</span>
          <span className={styles.elementType} style={{ fontSize: '9px' }}>{child.type}</span>
        </div>
        <button
          className={styles.deleteBtn}
          style={{ width: '18px', height: '18px', fontSize: '10px' }}
          onClick={(e) => { e.stopPropagation(); deleteBoxChild(sectionId, boxId, child.id); }}
        >
          X
        </button>
      </div>
      {isOpen && (
        <div className={styles.elementBody}>
          {child.type === 'text' ? (
            <TextElementForm
              sectionId={sectionId}
              element={child as TextElement}
              activeView={activeView}
              activeLang={activeLang}
              updateElementStyle={updateElementStyle}
              updateElementContent={updateElementContent}
              setElementSameForAllLangs={setElementSameForAllLangs}
            />
          ) : child.type === 'button' ? (
            <ButtonElementForm
              sectionId={sectionId}
              element={child as ButtonElement}
              activeView={activeView}
              activeLang={activeLang}
              updateElementStyle={updateElementStyle}
              updateElementContent={updateElementContent}
              setElementSameForAllLangs={setElementSameForAllLangs}
              updateButtonAction={updateButtonAction}
              updateButtonImage={updateButtonImage}
              setButtonUseImage={setButtonUseImage}
              popups={popups}
            />
          ) : (
            <ImageElementForm
              sectionId={sectionId}
              element={child as ImageElement}
              activeView={activeView}
              activeLang={activeLang}
              updateElementStyle={updateElementStyle}
              updateElementContent={updateElementContent}
              setElementSameForAllLangs={setElementSameForAllLangs}
            />
          )}
        </div>
      )}
    </div>
  );
}

function BoxElementForm({
  sectionId,
  element,
  activeView,
  activeLang,
  updateElementStyle,
  updateElementContent,
  setElementSameForAllLangs,
  addElementToBox,
  deleteBoxChild,
  updateBoxTitle,
  updateButtonAction,
  updateButtonImage,
  setButtonUseImage,
  popups,
}: {
  sectionId: number;
  element: BoxElement;
  activeView: 'WEB' | 'MOB';
  activeLang: 'GE' | 'EN' | 'RU' | 'TR';
  updateElementStyle: (sId: number, elId: number, field: string, value: unknown) => void;
  updateElementContent: (sId: number, elId: number, content: string, targetLang?: 'GE' | 'EN' | 'RU' | 'TR') => void;
  setElementSameForAllLangs: (sId: number, elId: number, value: boolean) => void;
  addElementToBox: (sId: number, boxId: number, type: 'text' | 'image' | 'button') => void;
  deleteBoxChild: (sId: number, boxId: number, childId: number) => void;
  updateBoxTitle: (sId: number, boxId: number, title: string) => void;
  updateButtonAction: (sId: number, elId: number, actionType: 'link' | 'popup', actionValue: string) => void;
  updateButtonImage: (sId: number, elId: number, imageData: string, targetLang?: 'GE' | 'EN' | 'RU' | 'TR') => void;
  setButtonUseImage: (sId: number, elId: number, useImage: boolean) => void;
  popups: Popup[];
}) {
  const est = element.styles[activeView];

  return (
    <>
      <div className={styles.field}>
        <label className={styles.fieldLabel}>Box Title</label>
        <input
          type="text"
          className={styles.input}
          value={element.title}
          onChange={(e) => updateBoxTitle(sectionId, element.id, e.target.value)}
          placeholder="Box name"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Size (W / H)</label>
        <div className={styles.fieldRow}>
          <input
            type="number"
            className={`${styles.input} ${styles.inputSmall}`}
            value={est.width}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'width', Number(e.target.value))}
          />
          <input
            type="number"
            className={`${styles.input} ${styles.inputSmall}`}
            value={est.height}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'height', Number(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Border (Width / Radius)</label>
        <div className={styles.fieldRow}>
          <input
            type="number"
            className={`${styles.input} ${styles.inputSmall}`}
            value={est.borderWidth}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'borderWidth', Number(e.target.value))}
          />
          <input
            type="number"
            className={`${styles.input} ${styles.inputSmall}`}
            value={est.borderRadius}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'borderRadius', Number(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Colors (BG / Border)</label>
        <div className={styles.fieldRow}>
          <input
            type="color"
            className={styles.colorInput}
            value={est.backgroundColor === 'transparent' ? '#000000' : est.backgroundColor}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'backgroundColor', e.target.value)}
          />
          <button
            className={styles.clearBtn}
            onClick={() => updateElementStyle(sectionId, element.id, 'backgroundColor', 'transparent')}
          >
            Clear
          </button>
          <input
            type="color"
            className={styles.colorInput}
            value={est.borderColor}
            onChange={(e) => updateElementStyle(sectionId, element.id, 'borderColor', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Z-Index</label>
        <input
          type="number"
          className={`${styles.input} ${styles.inputSmall}`}
          value={est.zIndex || 1}
          onChange={(e) => updateElementStyle(sectionId, element.id, 'zIndex', Number(e.target.value))}
        />
      </div>

      <div className={styles.boxChildren}>
        <label className={styles.fieldLabel}>Box Children ({element.children.length})</label>
        <div className={styles.buttonGroup} style={{ marginTop: '8px' }}>
          <button
            className={styles.btnText}
            style={{ fontSize: '11px', padding: '6px 10px' }}
            onClick={() => addElementToBox(sectionId, element.id, 'text')}
          >
            + Text
          </button>
          <button
            className={styles.btnImage}
            style={{ fontSize: '11px', padding: '6px 10px' }}
            onClick={() => addElementToBox(sectionId, element.id, 'image')}
          >
            + Image
          </button>
          <button
            className={styles.btnButton}
            style={{ fontSize: '11px', padding: '6px 10px' }}
            onClick={() => addElementToBox(sectionId, element.id, 'button')}
          >
            + Button
          </button>
        </div>

        {element.children.map((child) => (
          <CollapsibleBoxChild
            key={child.id}
            sectionId={sectionId}
            boxId={element.id}
            child={child}
            activeView={activeView}
            activeLang={activeLang}
            updateElementStyle={updateElementStyle}
            updateElementContent={updateElementContent}
            setElementSameForAllLangs={setElementSameForAllLangs}
            deleteBoxChild={deleteBoxChild}
            updateButtonAction={updateButtonAction}
            updateButtonImage={updateButtonImage}
            setButtonUseImage={setButtonUseImage}
            popups={popups}
          />
        ))}
      </div>
    </>
  );
}

function PopupCard({
  popup,
  activeView,
  deletePopup,
  onEdit,
}: {
  popup: Popup;
  activeView: 'WEB' | 'MOB';
  deletePopup: (popupId: number) => void;
  onEdit: (popupId: number) => void;
}) {
  const pst = popup.styles[activeView];

  return (
    <div className={styles.sectionCard}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle} onClick={() => onEdit(popup.id)}>
          <div className={styles.colorDot} style={{ background: pst.backgroundColor }} />
          <span className={styles.cardName}>{popup.title}</span>
          <span style={{ fontSize: '10px', color: '#6272a4', marginLeft: '8px' }}>
            ({popup.children?.length || 0} elements)
          </span>
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={styles.duplicateBtn}
            onClick={() => onEdit(popup.id)}
            title="Edit"
          >
            E
          </button>
          <button className={styles.deleteBtn} onClick={() => deletePopup(popup.id)}>
            X
          </button>
        </div>
      </div>
    </div>
  );
}

export function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const {
    activeLang,
    setActiveLang,
    activeView,
    setActiveView,
    globalBG,
    globalBGColor,
    updateGlobalBG,
    updateGlobalBGColor,
    clearGlobalBG,
    sameBackgroundForAllLangs,
    setSameBackgroundForAllLangs,
    backgroundMode,
    setBackgroundMode,
    authStyles,
    updateAuthStyle,
    sections,
    addSection,
    reorderSections,
    saveAllConfig,
    popups,
    addPopup,
    deletePopup,
    setEditingPopupId,
    headerText,
    updateHeaderTextContent,
    updateHeaderTextStyle,
    setHeaderTextSameForAllLangs,
  } = useLandingContext();

  const [openSections, setOpenSections] = useState<string[]>(['sections', 'popups']);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSections(active.id as number, over.id as number);
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => updateGlobalBG(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleSection = (name: string) => {
    setOpenSections((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const [wordColorWord, setWordColorWord] = useState('');
  const [wordColorValue, setWordColorValue] = useState('#ff0000');

  const applyWordColor = () => {
    if (!wordColorWord.trim()) return;
    const currentContent = headerText.content[activeLang] || '';
    // Escape special regex chars in the word
    const escaped = wordColorWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?!<[^>]*)(${escaped})(?![^<]*>)`, 'gi');
    const newContent = currentContent.replace(regex, `<span style="color:${wordColorValue}">${wordColorWord}</span>`);
    updateHeaderTextContent(newContent);
    setWordColorWord('');
  };

  const currentBG = globalBG[activeLang]?.[activeView.toLowerCase() as 'web' | 'mob'];

  if (!isOpen) return null;

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2>
          <span>*</span>
          Landing Builder
        </h2>
        <button className={styles.closeBtn} onClick={onClose}>
          X
        </button>
      </div>

        <div className={styles.tabs}>
          <div className={styles.tabGroup}>
            {VIEWPORTS.map((v) => (
              <button
                key={v}
                className={`${styles.tab} ${activeView === v ? styles['tab--active'] : ''}`}
                onClick={() => setActiveView(v)}
              >
                {v}
              </button>
            ))}
          </div>
          <div className={styles.tabGroup}>
            {LANGUAGES.map((l) => (
              <button
                key={l}
                className={`${styles.tab} ${activeLang === l ? styles['tab--active'] : ''}`}
                onClick={() => setActiveLang(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.body}>
          {/* Global Background Section */}
          <div className={styles.section}>
            <div
              className={`${styles.sectionHeader} ${openSections.includes('bg') ? styles['sectionHeader--open'] : ''}`}
              onClick={() => toggleSection('bg')}
            >
              <h3>
                <span className={styles.sectionIcon}>BG</span>
                Global Background
              </h3>
              <span className={`${styles.chevron} ${openSections.includes('bg') ? styles['chevron--open'] : ''}`}>
                v
              </span>
            </div>
            {openSections.includes('bg') && (
              <div className={styles.sectionContent}>
                <div className={styles.checkboxField}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={sameBackgroundForAllLangs}
                      onChange={(e) => setSameBackgroundForAllLangs(e.target.checked)}
                    />
                    <span>Same for all languages</span>
                  </label>
                </div>

                {sameBackgroundForAllLangs ? (
                  <>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>
                        Background ({activeView})
                      </label>
                      <input
                        type="file"
                        className={styles.fileInput}
                        onChange={handleBgUpload}
                        accept="image/*"
                      />
                    </div>
                    {currentBG && (
                      <div className={styles.imagePreview}>
                        <img src={currentBG} alt="Background" />
                        <button className={styles.removeImageBtn} onClick={clearGlobalBG}>
                          X
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className={styles.langTabs}>
                      {LANGUAGES.map((l) => (
                        <button
                          key={l}
                          className={`${styles.langTab} ${activeLang === l ? styles['langTab--active'] : ''}`}
                          onClick={() => setActiveLang(l)}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>
                        Background ({activeLang} - {activeView})
                      </label>
                      <input
                        type="file"
                        className={styles.fileInput}
                        onChange={handleBgUpload}
                        accept="image/*"
                      />
                    </div>
                    {currentBG && (
                      <div className={styles.imagePreview}>
                        <img src={currentBG} alt="Background" />
                        <button className={styles.removeImageBtn} onClick={clearGlobalBG}>
                          X
                        </button>
                      </div>
                    )}
                  </>
                )}

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    Background Color ({activeView})
                  </label>
                  <div className={styles.fieldRow}>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={globalBGColor[activeView]}
                      onChange={(e) => updateGlobalBGColor(e.target.value)}
                    />
                    <input
                      type="text"
                      className={styles.input}
                      value={globalBGColor[activeView]}
                      onChange={(e) => updateGlobalBGColor(e.target.value)}
                      placeholder="#1a1a2e"
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Background Mode</label>
                  <select
                    className={styles.select}
                    value={backgroundMode}
                    onChange={(e) => setBackgroundMode(e.target.value as 'cover' | 'contain' | 'natural')}
                  >
                    <option value="cover">Cover (სქეილებადი)</option>
                    <option value="natural">Natural (ორიგინალი ზომა)</option>
                    <option value="contain">Contain (მთლიანად ჩანს)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Header Text Section */}
          <div className={styles.section}>
            <div
              className={`${styles.sectionHeader} ${openSections.includes('headerText') ? styles['sectionHeader--open'] : ''}`}
              onClick={() => toggleSection('headerText')}
            >
              <h3>
                <span className={styles.sectionIcon}>TXT</span>
                Header Text
              </h3>
              <span className={`${styles.chevron} ${openSections.includes('headerText') ? styles['chevron--open'] : ''}`}>
                v
              </span>
            </div>
            {openSections.includes('headerText') && (
              <div className={styles.sectionContent}>
                <div className={styles.checkboxField}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={headerText.sameForAllLangs}
                      onChange={(e) => setHeaderTextSameForAllLangs(e.target.checked)}
                    />
                    <span>Same for all languages</span>
                  </label>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    Content {!headerText.sameForAllLangs ? `(${activeLang})` : ''}
                  </label>
                  <textarea
                    className={styles.input}
                    style={{ minHeight: '100px', resize: 'vertical', width: '100%' }}
                    value={headerText.content[activeLang] || ''}
                    onChange={(e) => updateHeaderTextContent(e.target.value)}
                    placeholder="Enter header text (supports HTML)"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Padding Top / Bottom (px)</label>
                  <div className={styles.fieldRow}>
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputSmall}`}
                      value={headerText.styles[activeView].paddingTop}
                      onChange={(e) => updateHeaderTextStyle('paddingTop', Number(e.target.value))}
                      placeholder="Top"
                    />
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputSmall}`}
                      value={headerText.styles[activeView].paddingBottom}
                      onChange={(e) => updateHeaderTextStyle('paddingBottom', Number(e.target.value))}
                      placeholder="Bottom"
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Width / Max Width (px)</label>
                  <div className={styles.fieldRow}>
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputSmall}`}
                      value={headerText.styles[activeView].width}
                      onChange={(e) => updateHeaderTextStyle('width', Number(e.target.value))}
                      placeholder="Width"
                    />
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputSmall}`}
                      value={headerText.styles[activeView].maxWidth}
                      onChange={(e) => updateHeaderTextStyle('maxWidth', Number(e.target.value))}
                      placeholder="Max Width"
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Font Size / Line Height</label>
                  <div className={styles.fieldRow}>
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputSmall}`}
                      value={headerText.styles[activeView].fontSize}
                      onChange={(e) => updateHeaderTextStyle('fontSize', Number(e.target.value))}
                      placeholder="Size"
                    />
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputSmall}`}
                      value={headerText.styles[activeView].lineHeight}
                      onChange={(e) => updateHeaderTextStyle('lineHeight', Number(e.target.value))}
                      placeholder="Line H"
                      step="0.1"
                      min="0.5"
                      max="5"
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Font Family</label>
                  <select
                    className={styles.select}
                    value={headerText.styles[activeView].fontFamily}
                    onChange={(e) => updateHeaderTextStyle('fontFamily', e.target.value)}
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Default Color</label>
                  <div className={styles.fieldRow}>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={headerText.styles[activeView].color}
                      onChange={(e) => updateHeaderTextStyle('color', e.target.value)}
                    />
                    <input
                      type="text"
                      className={styles.input}
                      value={headerText.styles[activeView].color}
                      onChange={(e) => updateHeaderTextStyle('color', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Word Color Tool</label>
                  <div className={styles.fieldRow}>
                    <input
                      type="text"
                      className={styles.input}
                      value={wordColorWord}
                      onChange={(e) => setWordColorWord(e.target.value)}
                      placeholder="Word"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={wordColorValue}
                      onChange={(e) => setWordColorValue(e.target.value)}
                    />
                    <button className={styles.addButton} style={{ padding: '6px 12px' }} onClick={applyWordColor}>
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Auth Section */}
          <div className={styles.section}>
            <div
              className={`${styles.sectionHeader} ${openSections.includes('auth') ? styles['sectionHeader--open'] : ''}`}
              onClick={() => toggleSection('auth')}
            >
              <h3>
                <span className={styles.sectionIcon}>AUTH</span>
                Authorization Block
              </h3>
              <span className={`${styles.chevron} ${openSections.includes('auth') ? styles['chevron--open'] : ''}`}>
                v
              </span>
            </div>
            {openSections.includes('auth') && (
              <div className={styles.sectionContent}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Position (Padding Top)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={authStyles[activeView].marginTop}
                    onChange={(e) => updateAuthStyle('marginTop', e.target.value)}
                    placeholder="700px"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Size (Height / Padding / Radius)</label>
                  <div className={styles.fieldRow}>
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputSmall}`}
                      value={authStyles[activeView].height}
                      onChange={(e) => updateAuthStyle('height', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputSmall}`}
                      value={authStyles[activeView].padding}
                      onChange={(e) => updateAuthStyle('padding', Number(e.target.value))}
                    />
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputSmall}`}
                      value={authStyles[activeView].borderRadius}
                      onChange={(e) => updateAuthStyle('borderRadius', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Block Background</label>
                  <div className={styles.fieldRow}>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={authStyles[activeView].backgroundColor === 'transparent' ? '#000000' : authStyles[activeView].backgroundColor.replace(/[^#\w]/g, '').slice(0, 7)}
                      onChange={(e) => updateAuthStyle('backgroundColor', e.target.value + 'e6')}
                    />
                    <button
                      className={styles.clearBtn}
                      onClick={() => updateAuthStyle('backgroundColor', 'transparent')}
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Text Color / Font Size</label>
                  <div className={styles.fieldRow}>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={authStyles[activeView].textColor}
                      onChange={(e) => updateAuthStyle('textColor', e.target.value)}
                    />
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputSmall}`}
                      value={authStyles[activeView].fontSize}
                      onChange={(e) => updateAuthStyle('fontSize', Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Text Background / Radius</label>
                  <div className={styles.fieldRow}>
                    <input
                      type="color"
                      className={styles.colorInput}
                      value={authStyles[activeView].textBgColor === 'transparent' ? '#000000' : authStyles[activeView].textBgColor}
                      onChange={(e) => updateAuthStyle('textBgColor', e.target.value)}
                    />
                    <button
                      className={styles.clearBtn}
                      onClick={() => updateAuthStyle('textBgColor', 'transparent')}
                    >
                      Clear
                    </button>
                    <input
                      type="number"
                      className={`${styles.input} ${styles.inputSmall}`}
                      value={authStyles[activeView].textBgBorderRadius}
                      onChange={(e) => updateAuthStyle('textBgBorderRadius', Number(e.target.value))}
                      placeholder="Radius"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Popups */}
          <div className={styles.section}>
            <div
              className={`${styles.sectionHeader} ${openSections.includes('popups') ? styles['sectionHeader--open'] : ''}`}
              onClick={() => toggleSection('popups')}
            >
              <h3>
                <span className={styles.sectionIcon}>POP</span>
                Popups
              </h3>
              <span className={`${styles.chevron} ${openSections.includes('popups') ? styles['chevron--open'] : ''}`}>
                v
              </span>
            </div>
            {openSections.includes('popups') && (
              <div className={styles.sectionContent}>
                <button className={styles.addButton} onClick={addPopup}>
                  + Add Popup
                </button>

                <div style={{ marginTop: '12px' }}>
                  {popups.map((popup) => (
                    <PopupCard
                      key={popup.id}
                      popup={popup}
                      activeView={activeView}
                      deletePopup={deletePopup}
                      onEdit={setEditingPopupId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sections */}
          <div className={styles.section}>
            <div
              className={`${styles.sectionHeader} ${openSections.includes('sections') ? styles['sectionHeader--open'] : ''}`}
              onClick={() => toggleSection('sections')}
            >
              <h3>
                <span className={styles.sectionIcon}>SEC</span>
                Sections
              </h3>
              <span className={`${styles.chevron} ${openSections.includes('sections') ? styles['chevron--open'] : ''}`}>
                v
              </span>
            </div>
            {openSections.includes('sections') && (
              <div className={styles.sectionContent}>
                <button className={styles.addButton} onClick={addSection}>
                  + Add Section
                </button>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sections.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div style={{ marginTop: '12px' }}>
                      {sections.map((s) => (
                        <SortableSectionCard key={s.id} section={s} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </div>

      <div className={styles.footer}>
        <button className={styles.publishBtn} onClick={saveAllConfig}>
          Publish Config
        </button>
      </div>
    </div>
  );
}
