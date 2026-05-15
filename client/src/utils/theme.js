export const getTheme = (mode) => {
  const themes = {
    light: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        text: '#F8FAFC',
        textSecondary: '#CBD5E1',
        textMuted: '#94A3B8',
        border: '#334155',
        primary: '#6366F1',
        danger: '#DC2626',
        success: '#16A34A',
        warning: '#F59E0B'
      },
      gradients: {
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        sos: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)'
      }
    },
    dark: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        text: '#F8FAFC',
        textSecondary: '#CBD5E1',
        textMuted: '#94A3B8',
        border: '#334155',
        primary: '#6366F1',
        danger: '#DC2626',
        success: '#16A34A',
        warning: '#F59E0B'
      },
      gradients: {
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        sos: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)'
      }
    },
    purple: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        text: '#F8FAFC',
        textSecondary: '#C4B5FD',
        textMuted: '#A78BFA',
        border: '#334155',
        primary: '#8B5CF6',
        danger: '#DC2626',
        success: '#16A34A',
        warning: '#F59E0B'
      },
      gradients: {
        background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
        sos: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)'
      }
    },
    pink: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        text: '#F8FAFC',
        textSecondary: '#CBD5E1',
        textMuted: '#94A3B8',
        border: '#334155',
        primary: '#6366F1',
        danger: '#DC2626',
        success: '#16A34A',
        warning: '#F59E0B'
      },
      gradients: {
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        sos: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)'
      }
    }
  };

  return themes[mode] || themes.light;
};