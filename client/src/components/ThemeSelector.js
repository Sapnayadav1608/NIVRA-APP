import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../store/slices/themeSlice';
import { getTheme } from '../utils/theme';

const ThemeSelector = ({ style }) => {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.theme?.mode || 'light');
  const themeConfig = getTheme(currentTheme);

  const themes = [
    { id: 'light', name: 'Corporate', emoji: '🏢' },
    { id: 'dark', name: 'Dark', emoji: '🌙' },
    { id: 'purple', name: 'Purple', emoji: '💜' },
    { id: 'pink', name: 'Minimal', emoji: '✨' }
  ];

  return (
    <div style={style}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px' 
      }}>
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => dispatch(setTheme(theme.id))}
            style={{
              padding: '12px',
              border: currentTheme === theme.id ? `2px solid ${themeConfig.colors.primary}` : `1px solid ${themeConfig.colors.border}`,
              borderRadius: '12px',
              background: currentTheme === theme.id ? themeConfig.colors.card : themeConfig.colors.background,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center',
              color: themeConfig.colors.text,
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{theme.emoji}</span>
            <span>{theme.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;