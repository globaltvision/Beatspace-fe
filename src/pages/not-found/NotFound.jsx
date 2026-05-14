import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@mantine/core";
import { TbArrowBack } from "react-icons/tb";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#f6f6f6] to-[#e3e3e3] flex flex-col justify-center items-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center max-w-2xl w-full">
        <div className="mb-8">
          <h1 className="text-7xl md:text-9xl font-bold">
            <span className="bg-gradient-to-r from-[#050505] to-[#767676] bg-clip-text text-transparent">
              {t('not_found.title').charAt(0)}
            </span>
            <span className="bg-gradient-to-r from-[#009AAF] to-[#9157D1] bg-clip-text text-transparent">
              {t('not_found.title').charAt(1)}
            </span>
            <span className="bg-gradient-to-r from-[#050505] to-[#767676] bg-clip-text text-transparent">
              {t('not_found.title').charAt(2)}
            </span>
          </h1>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-medium mb-4">
          <span className="bg-gradient-to-r from-[#050505] to-[#767676] bg-clip-text text-transparent">
            {t('not_found.subtitle')}
          </span>
        </h2>
        
        <p className="text-slate-500 mb-8 text-lg">
          {t('not_found.message')}
        </p>
        
        <div className="flex justify-center">
          <Link to="/dashboard">
            <Button 
              size="lg" 
              radius="md" 
              leftSection={<TbArrowBack size={20} />}
              className="w-full md:w-auto"
            >
              {t('not_found.back_button')}
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-slate-500">
          {t('not_found.help')} <Link to="/dashboard/support" className="text-cyan-700 font-medium">{t('not_found.contact')}</Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound; 
