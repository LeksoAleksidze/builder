import type { LandingData } from '../hooks/useLocalStorage';
import type { Section, Popup, Element, BoxChildElement, PopupChildElement } from '../types';
import type { Language, Viewport } from '../types';

export interface ExtractResult {
  cleanedData: LandingData;
  assets: Map<string, string>;
}

const LANGUAGES: Language[] = ['GE', 'EN', 'RU', 'TR'];
const VIEWPORTS: Viewport[] = ['WEB', 'MOB'];

function getExtension(dataUri: string): string {
  const match = dataUri.match(/^data:image\/(\w+);/);
  if (match) {
    const ext = match[1].toLowerCase();
    return ext === 'jpeg' ? 'jpg' : ext;
  }
  return 'png';
}

function isBase64DataUri(value: string): boolean {
  return typeof value === 'string' && value.startsWith('data:image/');
}

function stripDataUriPrefix(dataUri: string): string {
  const idx = dataUri.indexOf(',');
  return idx >= 0 ? dataUri.substring(idx + 1) : dataUri;
}

export function extractAssets(data: LandingData): ExtractResult {
  const assets = new Map<string, string>();
  const cleanedData: LandingData = JSON.parse(JSON.stringify(data));

  // 1. Global backgrounds
  for (const lang of LANGUAGES) {
    for (const vp of VIEWPORTS) {
      const vpKey = vp.toLowerCase() as 'web' | 'mob';
      const value = cleanedData.globalBG[lang]?.[vpKey];
      if (value && isBase64DataUri(value)) {
        const ext = getExtension(value);
        const path = `assets/bg-${lang}-${vpKey}.${ext}`;
        assets.set(path, stripDataUriPrefix(value));
        cleanedData.globalBG[lang][vpKey] = path;
      }
    }
  }

  // 2. Sections
  cleanedData.sections = cleanedData.sections.map((section: Section) => {
    const s = { ...section };

    // Section background images (per viewport)
    for (const vp of VIEWPORTS) {
      const style = s.styles[vp];
      if (style.backgroundImage && isBase64DataUri(style.backgroundImage)) {
        const ext = getExtension(style.backgroundImage);
        const path = `assets/section-${s.id}-bg-${vp}.${ext}`;
        assets.set(path, stripDataUriPrefix(style.backgroundImage));
        s.styles = {
          ...s.styles,
          [vp]: { ...style, backgroundImage: path },
        };
      }
    }

    // Section elements
    s.elements = s.elements.map((el: Element) => extractElementAssets(el, s.id, assets));

    return s;
  });

  // 3. Popups
  cleanedData.popups = cleanedData.popups.map((popup: Popup) => {
    const p = { ...popup };

    // Popup background images (per viewport)
    for (const vp of VIEWPORTS) {
      const style = p.styles[vp];
      if (style.backgroundImage && isBase64DataUri(style.backgroundImage)) {
        const ext = getExtension(style.backgroundImage);
        const path = `assets/popup-${p.id}-bg-${vp}.${ext}`;
        assets.set(path, stripDataUriPrefix(style.backgroundImage));
        p.styles = {
          ...p.styles,
          [vp]: { ...style, backgroundImage: path },
        };
      }
    }

    // Popup close button images
    if (p.closeButton) {
      for (const lang of LANGUAGES) {
        const value = p.closeButton.image[lang];
        if (value && isBase64DataUri(value)) {
          const ext = getExtension(value);
          const path = `assets/popup-${p.id}-close-${lang}.${ext}`;
          assets.set(path, stripDataUriPrefix(value));
          p.closeButton = {
            ...p.closeButton,
            image: { ...p.closeButton.image, [lang]: path },
          };
        }
      }
    }

    // Popup children
    p.children = p.children.map((child: PopupChildElement) => {
      if (child.type === 'image') {
        const c = { ...child };
        for (const lang of LANGUAGES) {
          const value = c.content[lang];
          if (value && isBase64DataUri(value)) {
            const ext = getExtension(value);
            const path = `assets/popup-${p.id}-el-${c.id}-${lang}.${ext}`;
            assets.set(path, stripDataUriPrefix(value));
            c.content = { ...c.content, [lang]: path };
          }
        }
        return c;
      }
      return child;
    });

    return p;
  });

  return { cleanedData, assets };
}

function isAssetPath(value: string): boolean {
  return typeof value === 'string' && value.startsWith('assets/');
}

function toRawUrl(path: string, branch: string): string {
  return `https://raw.githubusercontent.com/LeksoAleksidze/builder/${branch}/public/${path}`;
}

const RAW_URL_ASSET_PATTERN = /https:\/\/raw\.githubusercontent\.com\/LeksoAleksidze\/builder\/[^/]+\/(?:public\/)?(assets\/[^"]+)/g;

export function normalizeRawUrls(data: LandingData): LandingData {
  const json = JSON.stringify(data);
  const normalized = json.replace(RAW_URL_ASSET_PATTERN, '$1');
  return JSON.parse(normalized);
}

export function collectReferencedAssets(data: LandingData): Set<string> {
  const json = JSON.stringify(data);
  const paths = new Set<string>();
  const regex = /"(assets\/[^"]+)"/g;
  let match;
  while ((match = regex.exec(json)) !== null) {
    paths.add(match[1]);
  }
  return paths;
}

export function restoreAssetUrls(data: LandingData, branch: string): LandingData {
  const restored: LandingData = JSON.parse(JSON.stringify(data));

  // 1. Global backgrounds
  for (const lang of LANGUAGES) {
    for (const vp of VIEWPORTS) {
      const vpKey = vp.toLowerCase() as 'web' | 'mob';
      const value = restored.globalBG[lang]?.[vpKey];
      if (value && isAssetPath(value)) {
        restored.globalBG[lang][vpKey] = toRawUrl(value, branch);
      }
    }
  }

  // 2. Sections
  restored.sections = restored.sections.map((section: Section) => {
    const s = { ...section };

    // Section background images
    for (const vp of VIEWPORTS) {
      const style = s.styles[vp];
      if (style.backgroundImage && isAssetPath(style.backgroundImage)) {
        s.styles = {
          ...s.styles,
          [vp]: { ...style, backgroundImage: toRawUrl(style.backgroundImage, branch) },
        };
      }
    }

    // Section elements
    s.elements = s.elements.map((el: Element) => restoreElementAssetUrls(el, branch));

    return s;
  });

  // 3. Popups
  restored.popups = restored.popups.map((popup: Popup) => {
    const p = { ...popup };

    // Popup background images
    for (const vp of VIEWPORTS) {
      const style = p.styles[vp];
      if (style.backgroundImage && isAssetPath(style.backgroundImage)) {
        p.styles = {
          ...p.styles,
          [vp]: { ...style, backgroundImage: toRawUrl(style.backgroundImage, branch) },
        };
      }
    }

    // Popup close button images
    if (p.closeButton) {
      for (const lang of LANGUAGES) {
        const value = p.closeButton.image[lang];
        if (value && isAssetPath(value)) {
          p.closeButton = {
            ...p.closeButton,
            image: { ...p.closeButton.image, [lang]: toRawUrl(value, branch) },
          };
        }
      }
    }

    // Popup children
    p.children = p.children.map((child: PopupChildElement) => {
      if (child.type === 'image') {
        const c = { ...child };
        for (const lang of LANGUAGES) {
          const value = c.content[lang];
          if (value && isAssetPath(value)) {
            c.content = { ...c.content, [lang]: toRawUrl(value, branch) };
          }
        }
        return c;
      }
      return child;
    });

    return p;
  });

  return restored;
}

function restoreElementAssetUrls(el: Element, branch: string): Element {
  if (el.type === 'image') {
    const e = { ...el };
    for (const lang of LANGUAGES) {
      const value = e.content[lang];
      if (value && isAssetPath(value)) {
        e.content = { ...e.content, [lang]: toRawUrl(value, branch) };
      }
    }
    return e;
  }

  if (el.type === 'button') {
    const e = { ...el };
    for (const lang of LANGUAGES) {
      const value = e.image[lang];
      if (value && isAssetPath(value)) {
        e.image = { ...e.image, [lang]: toRawUrl(value, branch) };
      }
    }
    return e;
  }

  if (el.type === 'box') {
    const e = { ...el };

    // Box background images
    for (const vp of VIEWPORTS) {
      const style = e.styles[vp];
      if (style.backgroundImage && isAssetPath(style.backgroundImage)) {
        e.styles = {
          ...e.styles,
          [vp]: { ...style, backgroundImage: toRawUrl(style.backgroundImage, branch) },
        };
      }
    }

    // Box children
    e.children = e.children.map((child: BoxChildElement) => {
      if (child.type === 'image') {
        const c = { ...child };
        for (const lang of LANGUAGES) {
          const value = c.content[lang];
          if (value && isAssetPath(value)) {
            c.content = { ...c.content, [lang]: toRawUrl(value, branch) };
          }
        }
        return c;
      }
      if (child.type === 'button') {
        const c = { ...child };
        for (const lang of LANGUAGES) {
          const value = c.image[lang];
          if (value && isAssetPath(value)) {
            c.image = { ...c.image, [lang]: toRawUrl(value, branch) };
          }
        }
        return c;
      }
      return child;
    });

    return e;
  }

  return el;
}

function extractElementAssets(
  el: Element,
  sectionId: number,
  assets: Map<string, string>,
): Element {
  if (el.type === 'image') {
    const e = { ...el };
    for (const lang of LANGUAGES) {
      const value = e.content[lang];
      if (value && isBase64DataUri(value)) {
        const ext = getExtension(value);
        const path = `assets/section-${sectionId}-el-${e.id}-${lang}.${ext}`;
        assets.set(path, stripDataUriPrefix(value));
        e.content = { ...e.content, [lang]: path };
      }
    }
    return e;
  }

  if (el.type === 'button') {
    const e = { ...el };
    for (const lang of LANGUAGES) {
      const value = e.image[lang];
      if (value && isBase64DataUri(value)) {
        const ext = getExtension(value);
        const path = `assets/section-${sectionId}-el-${e.id}-btn-${lang}.${ext}`;
        assets.set(path, stripDataUriPrefix(value));
        e.image = { ...e.image, [lang]: path };
      }
    }
    return e;
  }

  if (el.type === 'box') {
    const e = { ...el };

    // Box background images (per viewport)
    for (const vp of VIEWPORTS) {
      const style = e.styles[vp];
      if (style.backgroundImage && isBase64DataUri(style.backgroundImage)) {
        const ext = getExtension(style.backgroundImage);
        const path = `assets/section-${sectionId}-box-${e.id}-bg-${vp}.${ext}`;
        assets.set(path, stripDataUriPrefix(style.backgroundImage));
        e.styles = {
          ...e.styles,
          [vp]: { ...style, backgroundImage: path },
        };
      }
    }

    // Box children
    e.children = e.children.map((child: BoxChildElement) => {
      if (child.type === 'image') {
        const c = { ...child };
        for (const lang of LANGUAGES) {
          const value = c.content[lang];
          if (value && isBase64DataUri(value)) {
            const ext = getExtension(value);
            const path = `assets/section-${sectionId}-box-${e.id}-child-${c.id}-${lang}.${ext}`;
            assets.set(path, stripDataUriPrefix(value));
            c.content = { ...c.content, [lang]: path };
          }
        }
        return c;
      }
      if (child.type === 'button') {
        const c = { ...child };
        for (const lang of LANGUAGES) {
          const value = c.image[lang];
          if (value && isBase64DataUri(value)) {
            const ext = getExtension(value);
            const path = `assets/section-${sectionId}-box-${e.id}-child-${c.id}-btn-${lang}.${ext}`;
            assets.set(path, stripDataUriPrefix(value));
            c.image = { ...c.image, [lang]: path };
          }
        }
        return c;
      }
      return child;
    });

    return e;
  }

  return el;
}
