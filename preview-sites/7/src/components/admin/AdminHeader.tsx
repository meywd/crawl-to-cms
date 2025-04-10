import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AdminHeader() {
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow h-16 flex items-center px-6">
      <div className="flex flex-1 justify-between items-center">
        <h1 className="text-xl font-semibold">{t('common.admin')}</h1>
      </div>
    </header>
  );
}
