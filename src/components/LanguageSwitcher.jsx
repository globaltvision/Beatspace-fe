import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.split('-')[0] ?? 'en';

  return (
    <div style={{ display: 'flex', gap: '8px', padding: '8px' }}>
      {LANGUAGES.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          aria-pressed={current === code}
          title={label}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: current === code ? '1.5px solid currentColor' : '1px solid #ccc',
            background: current === code ? '#f0f0f0' : 'transparent',
            color: current === code ? '#111' : '#ccc',
            cursor: 'pointer',
            fontWeight: current === code ? 600 : 400,
            fontSize: '14px',
          }}
        >
          {flag} {label}
        </button>
      ))}
    </div>
  );
}
