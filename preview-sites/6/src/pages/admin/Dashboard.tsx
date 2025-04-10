import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.welcome')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-lg mb-2">{t('common.pages')}</h2>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-lg mb-2">{t('common.menu')}</h2>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-lg mb-2">{t('common.languages')}</h2>
          <p className="text-3xl font-bold text-primary-600">3</p>
        </div>
      </div>
    </div>
  );
}
