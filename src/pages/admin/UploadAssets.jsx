import React, { useState, useRef, useCallback, memo } from "react";
import { UploadIcon1, MusicIcons1 } from '../../customIcons';
import { useTranslation } from "react-i18next";

// Constants for better maintainability
const VALID_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'audio/mp3', 'audio/wav'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Simple SVG icons
const ChevronDownIcon = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ThreeDotsIcon = () => (
  <svg width="4" height="16" viewBox="0 0 4 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="2" cy="2" r="2" fill="currentColor"/>
    <circle cx="2" cy="8" r="2" fill="currentColor"/>
    <circle cx="2" cy="14" r="2" fill="currentColor"/>
  </svg>
);

// AssetUpload Component
const AssetUpload = memo(({ onFileUpload }) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      return VALID_FILE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE;
    });
    
    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileUpload(files);
    }
  }, [onFileUpload]);

  return (
    <section className="bg-[rgba(181,179,135,0.16)] border w-full px-4 sm:px-6 lg:px-[23px] py-6 sm:py-7 lg:py-[29px] border-[rgba(203,200,149,1)] border-solid overflow-hidden">
      <div className="flex w-full items-center gap-4 sm:gap-5 flex-col sm:flex-row justify-between">
        <h1 className="text-[rgba(223,215,79,1)] text-lg sm:text-xl lg:text-[23px] font-normal leading-tight">
          {t('assets.title')}
        </h1>
        <button className="bg-[rgba(203,200,149,1)] shadow-[0px_7px_2px_rgba(0,0,0,1)] flex min-h-[45px] sm:min-h-[53px] items-center gap-2 sm:gap-2.5 text-base sm:text-lg text-[rgba(25,26,34,1)] font-semibold leading-loose justify-center px-3 sm:px-[13px] py-2 sm:py-[13px] rounded-none hover:bg-[rgba(213,210,159,1)] transition-colors">
          <img
            src="https://api.builder.io/api/v1/image/assets/8194e458f3d34aa4833822b7adb041ea/9befb545c1f7036df55ef6ec8d09750635d056d2?placeholderIfAbsent=true"
            alt="Add icon"
            className="aspect-[1.07] object-contain w-3 sm:w-4 shrink-0"
          />
          <span className="whitespace-nowrap">
            {t('assets.add_merch')}
          </span>
        </button>
      </div>
      
      <div 
        className={`bg-[rgba(82,81,50,1)] flex flex-col items-center font-normal mt-6 sm:mt-7 lg:mt-[31px] py-8 sm:py-12 lg:py-16 px-4 sm:px-8 lg:px-20 border-[rgba(203,200,149,1)] border-dashed border-2 sm:border-[3px] transition-colors ${
          isDragOver ? 'bg-[rgba(102,101,70,1)]' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="region"
        aria-label={t('assets.drop_here')}
      >
        <div className="flex w-full max-w-lg flex-col items-center">
          <div className="mb-6">
            <UploadIcon1 />
          </div>
          <div className="text-[rgba(235,226,60,1)] text-lg sm:text-xl lg:text-[22px] leading-tight text-center border border-black border-solid px-2 py-1">
            {t('assets.drop_here')}
          </div>
          <div className="text-white text-base sm:text-lg lg:text-xl leading-tight text-center mt-3 sm:mt-4">
            {t('assets.supports')}
          </div>
          <button 
            onClick={handleFileSelect}
            className="bg-[rgba(221,209,177,1)] shadow-[0px_7px_2px_rgba(0,0,0,1)] flex min-h-[45px] sm:min-h-[53px] w-full sm:w-auto sm:min-w-[180px] lg:w-[202px] items-center gap-2 sm:gap-[5px] text-base sm:text-lg text-[rgba(25,26,34,1)] font-semibold leading-loose justify-center mt-8 sm:mt-12 lg:mt-[60px] px-3 sm:px-[13px] py-2 sm:py-[13px] rounded-none hover:bg-[rgba(231,219,187,1)] transition-colors"
            type="button"
            aria-label={t('assets.select_files')}
          >
            <span>{t('assets.select_files')}</span>
          </button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpeg,.jpg,.mp3,.wav"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
      </div>
    </section>
  );
});

AssetUpload.displayName = 'AssetUpload';

// AssetFilters Component
const AssetFilters = memo(({ onSearchChange, onTypeFilter, onCategoryFilter }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  }, [onSearchChange]);

  return (
    <section className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-5 text-base sm:text-lg text-[rgba(25,26,34,1)] font-semibold leading-loose mt-4 sm:mt-[18px]">
      <div className="bg-[rgba(156,150,58,1)] flex flex-col font-medium justify-center flex-1 min-w-0 px-4 sm:px-6 lg:px-[27px] py-3 sm:py-4 lg:py-[18px] rounded-none">
        <label htmlFor="asset-search" className="sr-only">{t('assets.search_placeholder')}</label>
        <input
          id="asset-search"
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={t('assets.search_placeholder')}
          className="bg-transparent border-none outline-none text-[rgba(25,26,34,1)] placeholder-[rgba(25,26,34,1)] w-full font-semibold"
          aria-label={t('assets.search_placeholder')}
        />
      </div>
      
      <div className="bg-[rgba(221,209,177,1)] shadow-[0px_7px_0px_rgba(140,129,0,1)] flex min-h-[50px] sm:min-h-[60px] items-center gap-3 sm:gap-[18px] justify-center w-full sm:w-auto sm:min-w-[180px] lg:w-[201px] px-3 sm:px-[13px] py-3 sm:py-4 rounded-none relative">
        <select 
          onChange={(e) => onTypeFilter(e.target.value)}
          className="bg-transparent border-none outline-none text-[rgba(25,26,34,1)] font-semibold cursor-pointer appearance-none w-full text-center pr-6"
          aria-label={t('assets.types.all')}
        >
          <option value="">{t('assets.types.all')}</option>
          <option value="audio">{t('assets.types.audio')}</option>
          <option value="image">{t('assets.types.image')}</option>
          <option value="other">{t('assets.types.other')}</option>
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon />
        </div>
      </div>
      
      <div className="bg-[rgba(221,209,177,1)] shadow-[0px_7px_0px_rgba(140,129,0,1)] flex min-h-[50px] sm:min-h-[60px] items-center gap-3 sm:gap-[18px] justify-center w-full sm:w-auto sm:min-w-[180px] lg:w-[201px] px-3 sm:px-[13px] py-3 sm:py-4 rounded-none relative">
        <select 
          onChange={(e) => onCategoryFilter(e.target.value)}
          className="bg-transparent border-none outline-none text-[rgba(25,26,34,1)] font-semibold cursor-pointer appearance-none w-full text-center pr-6"
          aria-label={t('assets.categories.all')}
        >
          <option value="">{t('assets.categories.all')}</option>
          <option value="Games">{t('assets.categories.games')}</option>
          <option value="Merch">{t('assets.categories.merch')}</option>
          <option value="Beats">{t('assets.categories.beats')}</option>
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDownIcon />
        </div>
      </div>
    </section>
  );
});

AssetFilters.displayName = 'AssetFilters';

// AssetRow Component
const AssetRow = memo(({ asset, onAction }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleMenuToggle = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const handleAction = useCallback((action) => {
    onAction(asset.id, action);
    setIsMenuOpen(false);
  }, [asset.id, onAction]);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div 
      className="bg-[rgba(197,194,116,0.16)] border grid grid-cols-[50px_1fr_50px] sm:grid-cols-[60px_1fr_120px_80px] lg:grid-cols-[60px_1fr_120px_100px_120px_120px_80px] gap-4 w-full items-center text-sm sm:text-base lg:text-lg text-white font-normal leading-tight px-3 sm:px-6 lg:px-[30px] py-3 sm:py-4 lg:py-5 border-[rgba(203,200,149,1)] border-solid"
      role="row"
    >
      <div className="flex items-center justify-start" role="cell">
        <div className="w-5 sm:w-6 lg:w-[27px] h-5 sm:h-6 lg:h-[27px] flex items-center justify-start">
          <MusicIcons1 />
        </div>
      </div>
      
      <div className="truncate text-left" role="cell" title={asset.fileName}>
        <span className="truncate block">{asset.fileName}</span>
      </div>
      
      <div className="hidden sm:block text-left" role="cell">
        {asset.category}
      </div>
      
      <div className="hidden lg:block text-left" role="cell">
        {asset.size}
      </div>
      
      <div className="hidden lg:block text-left" role="cell">
        {asset.uploadedBy}
      </div>
      
      <div className="hidden lg:block text-left" role="cell">
        {asset.dateAdded}
      </div>
      
      <div className="flex items-center justify-start relative" role="cell" ref={menuRef}>
        <button
          onClick={handleMenuToggle}
          className="text-[rgba(203,200,149,1)] hover:text-[rgba(223,220,169,1)] transition-colors p-1"
          aria-label={`Actions for ${asset.fileName}`}
          title={t('assets.table.actions')}
        >
          <ThreeDotsIcon />
        </button>
        
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-[rgba(19,19,25,1)] border border-[rgba(203,200,149,1)] rounded-none shadow-lg z-10 min-w-[120px]">
            <button
              onClick={() => handleAction('download')}
              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[rgba(197,194,116,0.16)] transition-colors first:rounded-t-lg"
            >
              {t('assets.actions.download')}
            </button>
            <button
              onClick={() => handleAction('edit')}
              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[rgba(197,194,116,0.16)] transition-colors"
            >
              {t('assets.actions.edit')}
            </button>
            <button
              onClick={() => handleAction('delete')}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-[rgba(197,194,116,0.16)] transition-colors last:rounded-b-lg"
            >
              {t('assets.actions.remove')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

AssetRow.displayName = 'AssetRow';

// AssetTable Component
const AssetTable = memo(({ assets, onAssetAction }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-4 sm:mt-[17px]" role="region" aria-label={t('assets.title')}>
      <div className="bg-[rgba(19,19,25,1)] grid grid-cols-[50px_1fr_50px] sm:grid-cols-[60px_1fr_120px_80px] lg:grid-cols-[60px_1fr_120px_100px_120px_120px_80px] gap-4 text-sm sm:text-base lg:text-lg text-[rgba(203,200,149,1)] font-normal leading-tight px-3 sm:px-6 lg:px-[26px] py-2 sm:py-3 lg:py-4">
        <div className="text-left">{t('assets.table.preview')}</div>
        <div className="text-left">{t('assets.table.file_name')}</div>
        <div className="hidden sm:block text-left">{t('assets.table.category')}</div>
        <div className="hidden lg:block text-left">{t('assets.table.size')}</div>
        <div className="hidden lg:block text-left">{t('assets.table.uploaded_by')}</div>
        <div className="hidden lg:block text-left">{t('assets.table.date_added')}</div>
        <div className="text-left">{t('assets.table.actions')}</div>
      </div>
      
      <div role="table" aria-label={t('assets.title')}>
        {assets.length === 0 ? (
          <div className="bg-[rgba(197,194,116,0.16)] border border-[rgba(203,200,149,1)] border-solid px-3 sm:px-6 lg:px-[30px] py-8 sm:py-10 lg:py-12 text-center text-white">
            <p className="text-lg sm:text-xl">{t('assets.no_assets')}</p>
            <p className="text-sm sm:text-base text-gray-300 mt-2">{t('assets.upload_started')}</p>
          </div>
        ) : (
          assets.map((asset) => (
            <AssetRow 
              key={asset.id} 
              asset={asset} 
              onAction={onAssetAction}
            />
          ))
        )}
      </div>
    </div>
  );
});

AssetTable.displayName = 'AssetTable';

// Utility functions
const formatFileSize = (bytes) => {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileType = (file) => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'other';
};

const generateAssetId = () => `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Main Assets Component
const Assets = () => {
  // Initial mock data
  const initialAssets = [
    {
      id: '1',
      fileName: 'game_soundtrack.wav',
      category: 'Games',
      size: '5.42 MB',
      uploadedBy: 'Producer',
      dateAdded: '2024-01-13',
      fileType: 'audio',
    },
    {
      id: '2',
      fileName: 'album_cover.png',
      category: 'Merch',
      size: '5.42 MB',
      uploadedBy: 'Designer',
      dateAdded: '2024-01-13',
      fileType: 'image',
    },
    {
      id: '3',
      fileName: 'game_soundtrack',
      category: 'Beats',
      size: '5.42 MB',
      uploadedBy: 'Admin',
      dateAdded: '2024-01-13',
      fileType: 'audio',
    },
    {
      id: '4',
      fileName: 'game_soundtrack.wav',
      category: 'Games',
      size: '5.42 MB',
      uploadedBy: 'Producer',
      dateAdded: '2024-01-13',
      fileType: 'audio',
    },
    {
      id: '5',
      fileName: 'album_cover.png',
      category: 'Merch',
      size: '5.42 MB',
      uploadedBy: 'Designer',
      dateAdded: '2024-01-13',
      fileType: 'image',
    }
  ];

  const [assets, setAssets] = useState(initialAssets);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Memoized filtered assets calculation
  const filteredAssets = React.useMemo(() => {
    let filtered = assets;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.fileName.toLowerCase().includes(searchLower) ||
        asset.category.toLowerCase().includes(searchLower) ||
        asset.uploadedBy.toLowerCase().includes(searchLower)
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(asset => asset.fileType === typeFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter(asset => asset.category === categoryFilter);
    }

    return filtered;
  }, [assets, searchTerm, typeFilter, categoryFilter]);

  const handleFileUpload = useCallback((files) => {
    const newAssets = files.map((file) => {
      const fileType = getFileType(file);
      
      return {
        id: generateAssetId(),
        fileName: file.name,
        category: 'Uncategorized',
        size: formatFileSize(file.size),
        uploadedBy: t('assets.current_user'),
        dateAdded: new Date().toISOString().split('T')[0],
        fileType
      };
    });

    setAssets(prev => [...prev, ...newAssets]);
  }, []);

  const handleSearchChange = useCallback((search) => {
    setSearchTerm(search);
  }, []);

  const handleTypeFilter = useCallback((type) => {
    setTypeFilter(type);
  }, []);

  const handleCategoryFilter = useCallback((category) => {
    setCategoryFilter(category);
  }, []);

  const handleAssetAction = useCallback((assetId, action) => {
    switch (action) {
      case 'download':
        console.log(`Downloading asset ${assetId}`);
        // TODO: Implement actual download functionality
        break;
      case 'edit':
        console.log(`Editing asset ${assetId}`);
        // TODO: Implement edit functionality
        break;
      case 'delete':
        setAssets(prev => prev.filter(asset => asset.id !== assetId));
        break;
      default:
        console.warn(`Unknown action ${action} for asset ${assetId}`);
    }
  }, []);

  return (
    <main className="w-full bg-[#1A1A23] p-2 sm:p-4 alexandria-font overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 sm:space-y-6">
          <AssetUpload onFileUpload={handleFileUpload} />
          
          <AssetFilters
            onSearchChange={handleSearchChange}
            onTypeFilter={handleTypeFilter}
            onCategoryFilter={handleCategoryFilter}
          />
          
          <AssetTable
            assets={filteredAssets}
            onAssetAction={handleAssetAction}
          />
        </div>
      </div>
    </main>
  );
};

export default Assets;
