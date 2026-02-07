import { useState, useEffect } from 'react';
import styles from './Rules.module.scss';

interface IRule {
  title: string;
  content: string;
}

interface RulesData {
  mainRules: IRule[];
  additionalRule: IRule | undefined;
}

interface RulesItemProps {
  title: string | undefined;
  isSubRule?: boolean;
  rulesBackground: string;
  children?: React.ReactNode;
}

function RulesItem({
  title,
  isSubRule,
  rulesBackground,
  children,
}: RulesItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`${styles.rulesItem} ${isSubRule ? styles.rulesItemSubRule : ''}`}
    >
      <div
        className={styles.rulesItem__header}
        style={{ backgroundColor: rulesBackground }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.rulesItem__headerTitle}>{title}</div>
        <div
          className={`${styles.rulesItem__arrow} ${isOpen ? styles.rulesItem__arrowRotated : ''}`}
        >
          &#9660;
        </div>
      </div>
      <div
        className={`${styles.rulesItem__body} ${isOpen ? styles.rulesItem__bodyOpen : ''}`}
      >
        <div className={styles.rulesItem__bodyInner}>
          <div className={styles.rulesItem__bodyInnerContent}>{children}</div>
        </div>
      </div>
    </div>
  );
}

interface RulesProps {
  rulesKey: string;
  rulesBackground: string;
  lang: string;
  paddingTop?: number;
  paddingBottom?: number;
}

export default function Rules({
  rulesKey,
  rulesBackground,
  lang,
  paddingTop = 20,
  paddingBottom = 20,
}: RulesProps) {
  const [rulesData, setRulesData] = useState<RulesData | null>(null);

  useEffect(() => {
    if (!rulesKey) return;

    const correctLang = lang === 'ge' ? 'ka' : lang;
    const path = `https://cms.crocobet.com/ui/policy/${correctLang}/categories/promotions/${rulesKey}`;

    fetch(path)
      .then((res) => res.json())
      .then((json) => {
        const rules: IRule[] = json.data || json;
        if (!Array.isArray(rules) || rules.length === 0) {
          setRulesData(null);
          return;
        }
        const additionalRule = rules[rules.length - 1];
        const mainRules = rules.slice(0, -1);
        setRulesData({ mainRules, additionalRule });
      })
      .catch(() => {
        setRulesData(null);
      });
  }, [rulesKey, lang]);

  const rulesTitle: Record<string, string> = {
    ge: 'წესები',
    en: 'Rules',
    ru: 'Правила',
    tr: 'Kurallar',
  };

  if (!rulesData) return null;

  return (
    <div
      className={styles.rules}
      style={{
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
      }}
    >
      <RulesItem title={rulesTitle[lang] || 'Rules'} rulesBackground={rulesBackground}>
        {rulesData.mainRules.map((rule, idx) => (
          <RulesItem
            key={idx}
            title={rule.title}
            isSubRule
            rulesBackground={rulesBackground}
          >
            <div dangerouslySetInnerHTML={{ __html: rule.content }} />
          </RulesItem>
        ))}
      </RulesItem>

      {rulesData.additionalRule && (
        <RulesItem
          title={rulesData.additionalRule.title}
          rulesBackground={rulesBackground}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: rulesData.additionalRule.content,
            }}
          />
        </RulesItem>
      )}
    </div>
  );
}
