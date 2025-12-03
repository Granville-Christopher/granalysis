// Internationalization utility
export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar';

export interface Translations {
  [key: string]: string | Translations;
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      upload: 'Upload',
      download: 'Download',
      export: 'Export',
      search: 'Search',
    },
    dashboard: {
      title: 'Dashboard',
      files: 'Files',
      insights: 'Insights',
      uploadFile: 'Upload File',
    },
  },
  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      upload: 'Subir',
      download: 'Descargar',
      export: 'Exportar',
      search: 'Buscar',
    },
    dashboard: {
      title: 'Panel',
      files: 'Archivos',
      insights: 'Perspectivas',
      uploadFile: 'Subir Archivo',
    },
  },
  fr: {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      upload: 'Télécharger',
      download: 'Télécharger',
      export: 'Exporter',
      search: 'Rechercher',
    },
    dashboard: {
      title: 'Tableau de bord',
      files: 'Fichiers',
      insights: 'Aperçus',
      uploadFile: 'Télécharger un fichier',
    },
  },
  de: {
    common: {
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      upload: 'Hochladen',
      download: 'Herunterladen',
      export: 'Exportieren',
      search: 'Suchen',
    },
    dashboard: {
      title: 'Dashboard',
      files: 'Dateien',
      insights: 'Einblicke',
      uploadFile: 'Datei hochladen',
    },
  },
  zh: {
    common: {
      save: '保存',
      cancel: '取消',
      delete: '删除',
      edit: '编辑',
      upload: '上传',
      download: '下载',
      export: '导出',
      search: '搜索',
    },
    dashboard: {
      title: '仪表板',
      files: '文件',
      insights: '洞察',
      uploadFile: '上传文件',
    },
  },
  ja: {
    common: {
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      upload: 'アップロード',
      download: 'ダウンロード',
      export: 'エクスポート',
      search: '検索',
    },
    dashboard: {
      title: 'ダッシュボード',
      files: 'ファイル',
      insights: 'インサイト',
      uploadFile: 'ファイルをアップロード',
    },
  },
  ar: {
    common: {
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      upload: 'رفع',
      download: 'تحميل',
      export: 'تصدير',
      search: 'بحث',
    },
    dashboard: {
      title: 'لوحة التحكم',
      files: 'الملفات',
      insights: 'رؤى',
      uploadFile: 'رفع ملف',
    },
  },
};

class I18n {
  private currentLanguage: Language = 'en';

  setLanguage(lang: Language) {
    this.currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }

  getLanguage(): Language {
    const stored = localStorage.getItem('language') as Language;
    return stored || 'en';
  }

  t(key: string, params?: Record<string, string>): string {
    const keys = key.split('.');
    let value: any = translations[this.currentLanguage];

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        // Fallback to English
        value = translations.en;
        for (const k2 of keys) {
          value = value?.[k2];
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return key; // Return key if translation not found
    }

    // Replace parameters
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
        return params[param] || match;
      });
    }

    return value;
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(this.getLanguage(), {
      style: 'currency',
      currency,
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.getLanguage()).format(date);
  }

  formatNumber(number: number): string {
    return new Intl.NumberFormat(this.getLanguage()).format(number);
  }
}

export const i18n = new I18n();

// React hook
export const useTranslation = () => {
  const [language, setLanguageState] = React.useState<Language>(i18n.getLanguage());

  React.useEffect(() => {
    i18n.setLanguage(language);
  }, [language]);

  return {
    t: i18n.t.bind(i18n),
    language,
    setLanguage: (lang: Language) => {
      setLanguageState(lang);
      i18n.setLanguage(lang);
    },
    formatCurrency: i18n.formatCurrency.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
  };
};

// Need to import React for the hook
import React from 'react';

