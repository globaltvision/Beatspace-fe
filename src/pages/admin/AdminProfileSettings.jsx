import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ConfirmModal from "../../components/ConfirmModal";
import CategoryAPI from "../../services/category.service";
import SettingsAPI from "../../services/settings.service";
import custAxios from "../../configs/axios.config";
import { useSettings } from "../../contexts/SettingsContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getBeats } from "../../store/actions/beatActions";
import { me, changeEmail, changePassword } from "../../store/actions/authActions";
const VolumeSlider = ({ value = 70, onChange }) => {
  const { t } = useTranslation();
  const handleSliderChange = (event) => {
    const newValue = parseInt(event.target.value);
    onChange?.(newValue);
  };

  return (
    <div className="w-full">
      <div className="flex w-full items-center gap-4 sm:gap-5 flex-wrap justify-between mt-[13px] max-md:max-w-full">
        <div className="flex items-center flex-1 relative min-w-[200px]">
          {/* Background track */}
          <div className="bg-[#191A22] flex w-full h-3 my-auto relative rounded-full">
            {/* Progress fill */}
            <div
              className="bg-[rgba(228,218,52,1)] h-full transition-all duration-200 rounded-full"
              style={{ width: `${value}%` }}
            />
          </div>
          {/* Hidden input for accessibility */}
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
            aria-label={t('settings.audio.volume')}
          />
          {/* Visual handle */}
          <div
            className="bg-white flex w-6 h-6 sm:w-8 sm:h-8 rounded-[50%] absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 cursor-pointer shadow-lg border-2 border-[rgba(228,218,52,1)]"
            style={{ left: `${value}%` }}
          />
        </div>
        <div className="text-[rgba(255,239,46,1)] text-lg sm:text-xl alexandria-font leading-none text-center my-auto min-w-[3ch]">
          {value}%
        </div>
      </div>
      <div className="flex w-full items-stretch gap-5 text-sm sm:text-base text-[rgba(255,249,153,1)] alexandria-font whitespace-nowrap text-center leading-7 justify-between pr-[40px] sm:pr-[52px] mt-2">
        <div>0%</div>
        <div>50%</div>
        <div>100%</div>
      </div>
    </div>
  );
};

// SettingsRow Component for consistent layout
const SettingsRow = ({
  icon,
  title,
  description,
  children,
  titleClassName = "text-white sm:text-md lg:text-lg pixel-font uppercase block mb-2",
}) => (
  <div className="flex items-start gap-4 sm:gap-6 lg:gap-[30px] w-full mt-[45px] max-md:mt-10">
    {icon !== undefined && (
      <div className="shrink-0 mt-0.5 sm:mt-1 flex justify-center w-[40px] sm:w-[46px]">
        {icon}
      </div>
    )}
    <div className="grow min-w-0 text-left">
      {title && <h1 className={titleClassName}>{title}</h1>}
      {description && (
        <div className="text-[rgba(255,249,153,1)] text-sm sm:text-base alexandria-font mb-4">
          {description}
        </div>
      )}
      {children}
    </div>
  </div>
);

// ToggleOption Component
const ToggleOption = ({
  title,
  description,
  checkedIcon,
  uncheckedIcon,
  defaultChecked = false,
  onChange,
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <div className="flex items-start gap-4 sm:gap-6 lg:gap-[30px] w-full mt-[55px] max-md:mt-10">
      <div
        className="shrink-0 mt-0.5 sm:mt-1 cursor-pointer transition-transform hover:scale-105 w-[40px] sm:w-[46px] flex justify-center"
        onClick={handleToggle}
        role="checkbox"
        aria-checked={isChecked}
        tabIndex={0}
      >
        {isChecked ? checkedIcon : uncheckedIcon || checkedIcon}
      </div>
      <div className="grow min-w-0 text-left">
        <h1
          className="text-white sm:text-md lg:text-lg pixel-font uppercase block mb-1 sm:mb-2 cursor-pointer"
          onClick={handleToggle}
        >
          {title}
        </h1>
        <span className="text-[rgba(255,249,153,1)] text-sm sm:text-base alexandria-font block mt-1">
          {description}
        </span>
      </div>
    </div>
  );
};

// QualitySelector Component
const QualitySelector = ({
  options,
  defaultValue = "high",
  onChange,
}) => {
  const { t } = useTranslation();
  
  const displayOptions = options || [
    { value: "high", label: t('settings.audio.high') },
    { value: "medium", label: t('settings.audio.medium') },
    { value: "low", label: t('settings.audio.low') },
  ];

  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = displayOptions.find(
    (option) => option.value === selectedValue,
  );

  const handleSelect = (value) => {
    setSelectedValue(value);
    setIsOpen(false);
    onChange?.(value);
  };

  return (
    <div className="relative alexandria-font">
      <button
        className="bg-[rgba(25,26,34,1)] border w-full flex items-stretch gap-5 text-lg text-[rgba(156,150,58,1)] font-medium leading-loose justify-between px-[18px] py-4 border-[rgba(203,200,149,1)] border-solid max-md:max-w-full"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        role="combobox"
      >
        <span>{selectedOption?.label}</span>
        <img
          src="https://api.builder.io/api/v1/image/assets/8194e458f3d34aa4833822b7adb041ea/f0860431e613dd0cdb778835bef44a350aeaaa0d?placeholderIfAbsent=true"
          className={`aspect-[1.83] object-contain w-[22px] shrink-0 my-auto transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          alt={t('common.dropdown_arrow') || "Dropdown arrow"}
        />
      </button>

      {isOpen && (
        <div className="absolute alexandria-font top-full left-0 right-0 bg-[rgba(25,26,34,1)] border border-[rgba(203,200,149,1)] border-solid mt-1">
          <ul role="listbox" className="py-2">
            {displayOptions.map((option) => (
              <li key={option.value}>
                <button
                  className={`w-full text-left px-[18px] py-2 text-lg font-medium leading-loose hover:bg-[rgba(203,200,149,0.1)] transition-colors ${
                    selectedValue === option.value
                      ? "text-[rgba(228,218,52,1)] bg-[rgba(203,200,149,0.1)]"
                      : "text-[rgba(156,150,58,1)]"
                  }`}
                  onClick={() => handleSelect(option.value)}
                  role="option"
                  aria-selected={selectedValue === option.value}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// FileUpload Component
const FileUpload = ({
  onFileSelect,
  currentImage,
  accept = "image/*",
  maxSize = 2 * 1024 * 1024,
  className = "",
}) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      setError(null);

      const files = Array.from(e.dataTransfer.files);
      const file = files[0];

      if (file) {
        if (file.size > maxSize) {
          setError(t('settings.general.logo_help') || `File size must be less than ${maxSize / (1024 * 1024)}MB`);
          return;
        }
        onFileSelect?.(file);
      }
    },
    [maxSize, onFileSelect],
  );

  const handleFileInput = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > maxSize) {
          setError(t('settings.general.logo_help') || `File size must be less than ${maxSize / (1024 * 1024)}MB`);
          return;
        }
        setError(null);
        onFileSelect?.(file);
      }
    },
    [maxSize, onFileSelect],
  );

  return (
    <div className={`relative ${className}`}>
      <div
        className={`w-full min-h-[280px] sm:min-h-[320px] lg:min-h-[358px] border-[3px] border-dashed border-[#CBC895] bg-[#525132] flex flex-col items-center justify-center cursor-pointer transition-colors p-4 sm:p-6 lg:p-8 ${isDragOver ? "bg-[#5a5a3a]" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={t('settings.general.logo_upload')}
      >
        <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col items-center">
          {currentImage ? (
            <div className="relative group">
              <img
                src={currentImage}
                alt={t('settings.general.logo') || "Logo Preview"}
                className="max-h-[180px] w-auto object-contain transition-opacity group-hover:opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white alexandria-font text-xs bg-black/50 px-2 py-1">
                  {t('settings.general.change_logo') || "CHANGE LOGO"}
                </p>
              </div>
            </div>
          ) : ( 
            <svg
              className="w-16 h-20 sm:w-20 sm:h-24 lg:w-20 lg:h-[115px]"
              viewBox="0 0 80 115"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M61.045 0.063H0.245V98.863H80.045V19.063L61.045 0.063Z"
                fill="#056BF1"
              />
              <path
                d="M72.444 98.864V106.463H-7.355V7.664H0.245V98.864H72.444Z"
                fill="#124BF2"
              />
              <path
                d="M64.844 106.463V114.063H-14.955V15.264H-7.355V106.463H64.844Z"
                fill="#023473"
              />
              <path
                d="M61.045 0.063V19.063H80.045L61.045 0.063Z"
                fill="#124BF2"
              />
              <path
                d="M54.869 36.81L41.569 21.61C40.847 20.793 39.441 20.793 38.7 21.61L25.4 36.81C24.906 37.38 24.792 38.159 25.096 38.843C25.4 39.527 26.084 39.964 26.825 39.964H32.525V53.264C32.525 54.309 33.38 55.164 34.425 55.164H45.825C46.87 55.164 47.725 54.309 47.725 53.264V39.964H53.425C54.166 39.964 54.85 39.527 55.154 38.843C55.458 38.159 55.344 37.361 54.85 36.81H54.869Z"
                fill="white"
              />
              <path
                d="M45.843 58.963H34.443C33.394 58.963 32.543 59.814 32.543 60.863V68.463C32.543 69.512 33.394 70.363 34.443 70.363H45.843C46.892 70.363 47.743 69.512 47.743 68.463V60.863C47.743 59.814 46.892 58.963 45.843 58.963Z"
                fill="white"
              />
              <path
                d="M45.843 74.164H34.443C33.398 74.164 32.543 75.019 32.543 76.064C32.543 77.109 33.398 77.964 34.443 77.964H45.843C46.888 77.964 47.743 77.109 47.743 76.064C47.743 75.019 46.888 74.164 45.843 74.164Z"
                fill="white"
              />
            </svg>
          )}
        </div>
        <div className="text-center alexandria-font">
          <p className="text-[#EBE23C] text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 lg:mb-4 max-w-md">
            {currentImage
              ? t('settings.general.logo_replace')
              : t('settings.general.logo_upload')}
          </p>
          <p className="text-white text-sm sm:text-base lg:text-lg">
            {t('settings.general.logo_help')}
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        aria-hidden="true"
      />
      {error && (
        <p className="text-red-500 text-sm mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// CategoryRow Component
const CategoryRow = ({ categoryName, type, onEdit, onDelete }) => {
  return (
    <div className="flex w-full min-h-[80px] sm:min-h-[90px] lg:min-h-[108px] border bg-[rgba(197,194,116,0.16)] px-4 sm:px-6 lg:px-[27px] py-4 sm:py-6 lg:py-0 border-solid border-[#CBC895] sm:flex-row flex-col sm:items-center items-start sm:gap-0 gap-3">
      <div className="text-white text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 min-w-0 sm:min-w-[200px] flex-shrink-0">
        {categoryName}
      </div>
      <div className="text-white text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 min-w-0 sm:min-w-[150px] flex-shrink-0">
        {type}
      </div>
      <div className="flex gap-4 sm:gap-6 lg:gap-[25px] sm:ml-auto sm:w-auto w-full sm:justify-end justify-start">
        <button
          onClick={onEdit}
          className="w-8 h-8 sm:w-9 sm:h-9 lg:w-[39px] lg:h-[39px] flex items-center justify-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#FFEF2E] focus:ring-offset-2 focus:ring-offset-[rgba(197,194,116,0.16)]"
          aria-label={`Edit ${categoryName}`}
        >
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M32.8969 1.54167C32.1159 0.760885 31.0567 0.322266 29.9524 0.322266C28.848 0.322266 27.7889 0.760885 27.0078 1.54167L23.5823 4.96931L34.6253 16.0123L38.0509 12.5888C38.4378 12.2021 38.7447 11.7429 38.9541 11.2375C39.1635 10.7321 39.2713 10.1903 39.2713 9.64327C39.2713 9.0962 39.1635 8.55448 38.9541 8.04908C38.7447 7.54367 38.4378 7.08447 38.0509 6.69771L32.8969 1.54167ZM31.6808 18.9568L20.6378 7.91383L2.23969 26.3119L-0.000976562 39.5977L13.2848 37.3549L31.6808 18.9568Z"
              fill="#FFEF2E"
            />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="w-8 h-8 sm:w-9 sm:h-9 lg:w-[45px] lg:h-[39px] flex items-center justify-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#EB181B] focus:ring-offset-2 focus:ring-offset-[rgba(197,194,116,0.16)]"
          aria-label={`Delete ${categoryName}`}
        >
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 lg:w-[46px] lg:h-10"
            viewBox="0 0 46 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="1.35603"
              y="1.40779"
              width="42.8316"
              height="37.104"
              fill="#EB181B"
              fillOpacity="0.13"
            />
            <rect
              x="1.35603"
              y="1.40779"
              width="42.8316"
              height="37.104"
              stroke="#EB181B"
              strokeWidth="2.17105"
            />
            <path
              d="M16.1047 10.9253L22.7718 17.5925L29.4044 10.9599C29.5509 10.8039 29.7274 10.6792 29.9233 10.5931C30.1192 10.5071 30.3304 10.4614 30.5444 10.459C31.0025 10.459 31.4418 10.641 31.7657 10.9649C32.0896 11.2888 32.2716 11.7281 32.2716 12.1862C32.2756 12.398 32.2364 12.6083 32.1562 12.8044C32.076 13.0004 31.9566 13.178 31.8053 13.3262L25.0863 19.9588L31.8053 26.6777C32.0899 26.9562 32.2569 27.3334 32.2716 27.7313C32.2716 28.1894 32.0896 28.6288 31.7657 28.9527C31.4418 29.2766 31.0025 29.4586 30.5444 29.4586C30.3242 29.4677 30.1046 29.431 29.8995 29.3507C29.6943 29.2704 29.5081 29.1483 29.3526 28.9922L22.7718 22.3251L16.122 28.975C15.976 29.1257 15.8017 29.246 15.609 29.3291C15.4163 29.4121 15.209 29.4561 14.9992 29.4586C14.5412 29.4586 14.1018 29.2766 13.7779 28.9527C13.454 28.6288 13.272 28.1894 13.272 27.7313C13.268 27.5196 13.3073 27.3092 13.3875 27.1132C13.4677 26.9172 13.5871 26.7396 13.7384 26.5914L20.4573 19.9588L13.7384 13.2398C13.4537 12.9613 13.2868 12.5842 13.272 12.1862C13.272 11.7281 13.454 11.2888 13.7779 10.9649C14.1018 10.641 14.5412 10.459 14.9992 10.459C15.4138 10.4642 15.811 10.6317 16.1047 10.9253Z"
              fill="#EB181B"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Icons Definitions
const SpeakerOnIcon = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 46 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="6" y="14" width="6" height="18" fill="#FFEF2E" />
    <rect x="12" y="10" width="6" height="26" fill="#FFEF2E" />
    <path d="M18 4H24V42H18V4Z" fill="#FFEF2E" />
    <rect x="30" y="18" width="4" height="10" fill="#FFEF2E" />
    <rect x="36" y="12" width="4" height="22" fill="#FFEF2E" />
    <rect x="42" y="6" width="4" height="34" fill="#FFEF2E" />
  </svg>
);

const SpeakerOffIcon = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 46 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="6" y="14" width="6" height="18" fill="#FFEF2E" />
    <rect x="12" y="10" width="6" height="26" fill="#FFEF2E" />
    <path d="M18 4H24V42H18V4Z" fill="#FFEF2E" />
    <path
      d="M30 14L42 32M42 14L30 32"
      stroke="#FFEF2E"
      strokeWidth="4"
      strokeLinecap="square"
    />
  </svg>
);

const AntennaIcon = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 46 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="23" cy="23" r="6" fill="#FFEF2E" />
    <path
      d="M13 13C7.5 18.5 7.5 27.5 13 33"
      stroke="#FFEF2E"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M33 13C38.5 18.5 38.5 27.5 33 33"
      stroke="#FFEF2E"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M7 7C-1.8 15.8 -1.8 30.2 7 39"
      stroke="#FFEF2E"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M39 7C47.8 15.8 47.8 30.2 39 39"
      stroke="#FFEF2E"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const PauseIcon = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 46 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="42" height="42" stroke="#FFEF2E" strokeWidth="2" />
    <rect x="14" y="12" width="6" height="22" fill="#FFEF2E" />
    <rect x="26" y="12" width="6" height="22" fill="#FFEF2E" />
  </svg>
);

const PlayIcon = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 46 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="42" height="42" stroke="#FFEF2E" strokeWidth="2" />
    <path d="M16 12L34 23L16 34V12Z" fill="#FFEF2E" />
  </svg>
);

const AudioVisualizerIcon = (
  <svg
    width="100"
    height="34"
    viewBox="0 0 100 46"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="0" y="16" width="4" height="14" fill="#FFEF2E" />
    <rect x="6" y="10" width="4" height="26" fill="#FFEF2E" />
    <rect x="12" y="4" width="4" height="38" fill="#FFEF2E" />
    <rect x="18" y="12" width="4" height="22" fill="#FFEF2E" />
    <rect x="24" y="2" width="4" height="42" fill="#FFEF2E" />
    <rect x="30" y="8" width="4" height="30" fill="#FFEF2E" />
    <rect x="36" y="18" width="4" height="10" fill="#FFEF2E" />
    <rect x="42" y="0" width="4" height="46" fill="#FFEF2E" />
    <rect x="48" y="14" width="4" height="18" fill="#FFEF2E" />
    <rect x="54" y="8" width="4" height="30" fill="#FFEF2E" />
    <rect x="60" y="20" width="4" height="6" fill="#FFEF2E" />
    <rect x="66" y="12" width="4" height="22" fill="#FFEF2E" />
    <rect x="72" y="4" width="4" height="38" fill="#FFEF2E" />
    <rect x="78" y="16" width="4" height="14" fill="#FFEF2E" />
    <rect x="84" y="8" width="4" height="30" fill="#FFEF2E" />
    <rect x="90" y="12" width="4" height="22" fill="#FFEF2E" />
  </svg>
);

// ── Live Audio Visualizer Preview ────────────────────────────────
const AudioVisualizerPreview = ({ volume = 70, quality = 'high' }) => {
  const NUM_BARS = 24;
  const dispatch = useDispatch();
  const beats = useSelector(state => state.beat?.beats || []);

  const [isPlaying, setIsPlaying] = useState(false);
  const [bars, setBars] = useState(new Array(NUM_BARS).fill(3));
  const [selectedBeatId, setSelectedBeatId] = useState('');

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const gainRef = useRef(null);
  const filterRef = useRef(null);
  const audioElRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const rafRef = useRef(null);

  // Load beats on mount if not already fetched
  useEffect(() => {
    if (!beats.length) dispatch(getBeats());
  }, []);

  // Live-sync volume — GainNode when Web Audio graph is active, audio.volume as fallback
  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setTargetAtTime(volume / 100, audioCtxRef.current.currentTime, 0.05);
    }
    if (audioElRef.current) {
      audioElRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Live-sync quality to lowpass filter cutoff
  useEffect(() => {
    if (filterRef.current && audioCtxRef.current) {
      const cutoff = quality === 'high' ? 20000 : quality === 'medium' ? 12000 : 5000;
      filterRef.current.frequency.setTargetAtTime(cutoff, audioCtxRef.current.currentTime, 0.1);
    }
  }, [quality]);

  const stopAudio = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.src = '';
    }
    try { mediaSourceRef.current?.disconnect(); } catch (e) {}
    if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    gainRef.current = null;
    filterRef.current = null;
    mediaSourceRef.current = null;
    audioElRef.current = null;
    setBars(new Array(NUM_BARS).fill(3));
    setIsPlaying(false);
  }, []);

  const startAudio = useCallback(async () => {
    const beat = beats.find(b => (b._id || b.id) === selectedBeatId);
    if (!beat?.mp3_url) return;

    // Build AudioContext and graph first
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = quality === 'high' ? 20000 : quality === 'medium' ? 12000 : 5000;
    filterRef.current = filter;

    const master = ctx.createGain();
    master.gain.value = volume / 100;
    gainRef.current = master;

    analyser.connect(filter);
    filter.connect(master);
    master.connect(ctx.destination);

    // IMPORTANT: crossOrigin MUST be set BEFORE src so the browser uses CORS mode
    // from the first request. new Audio(url) sets src in the constructor (too late),
    // so we create the element first, set crossOrigin, then assign src.
    // Cloudinary returns Access-Control-Allow-Origin: * so this works for our URLs.
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = beat.mp3_url;
    audio.volume = volume / 100;
    audioElRef.current = audio;

    // Connect to Web Audio graph for real frequency data
    let visualizerActive = false;
    try {
      const mediaSource = ctx.createMediaElementSource(audio);
      mediaSourceRef.current = mediaSource;
      mediaSource.connect(analyser);
      visualizerActive = true;
    } catch (corsErr) {
      console.warn('Visualizer: could not connect media source, using fallback.', corsErr.message);
    }

    // Play — wrap separately so audio still plays even if graph setup had issues
    try {
      await audio.play();
    } catch (playErr) {
      console.error('Audio play failed:', playErr);
      toast.error('Could not play this beat. Check network or browser permissions.');
      stopAudio();
      return;
    }

    setIsPlaying(true);
    audio.addEventListener('ended', stopAudio, { once: true });

    // Wave fallback: runs when visualizerActive=false, OR auto-activates if the
    // analyser outputs all zeroes (browser zeroing CORS-tainted data)
    let t = 0;
    const drawFallback = () => {
      t += 0.08;
      setBars(Array.from({ length: NUM_BARS }, (_, i) =>
        Math.max(4, Math.round(30 + Math.sin(t + i * 0.45) * 22 + Math.random() * 15))
      ));
      rafRef.current = requestAnimationFrame(drawFallback);
    };

    if (visualizerActive) {
      // Real frequency-driven bars, with zero-detection fallback
      let zeroFrames = 0;
      const draw = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const total = data.reduce((s, v) => s + v, 0);

        // If analyser outputs zeroes for >40 frames the data is CORS-tainted; switch to fallback
        if (total === 0) {
          zeroFrames++;
          if (zeroFrames > 40) {
            cancelAnimationFrame(rafRef.current);
            drawFallback();
            return;
          }
        } else {
          zeroFrames = 0;
        }

        const newBars = Array.from({ length: NUM_BARS }, (_, i) => {
          const s = Math.floor((i / NUM_BARS) * data.length);
          const e = Math.max(s + 1, Math.floor(((i + 1) / NUM_BARS) * data.length));
          let sum = 0;
          for (let j = s; j < e; j++) sum += data[j];
          return Math.max(3, Math.round((sum / (e - s)) / 255 * 100));
        });
        setBars(newBars);
        rafRef.current = requestAnimationFrame(draw);
      };
      draw();
    } else {
      drawFallback();
    }
  }, [volume, quality, selectedBeatId, beats, stopAudio]);

  useEffect(() => () => stopAudio(), [stopAudio]);

  const canPlay = !!selectedBeatId;

  return (
    <div style={{ background: '#141420', border: '1px solid rgba(203,200,149,0.6)', padding: '18px 22px', marginTop: '8px' }}>

      {/* Beat selector */}
      <div style={{ marginBottom: '14px' }}>
        <div className="viz-fs-7" style={{ color: '#a8a880', marginBottom: '8px', letterSpacing: '1px' }}>
          SELECT BEAT TO PREVIEW
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={selectedBeatId}
            onChange={e => { if (isPlaying) stopAudio(); setSelectedBeatId(e.target.value); }}
            className="viz-fs-8"
            style={{
              width: '100%',
              background: '#1c1c2a',
              border: '1px solid rgba(203,200,149,0.5)',
              color: selectedBeatId ? '#F6F4D3' : '#777',
              padding: '10px 32px 10px 12px',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            <option value="" style={{ background: '#1c1c2a', color: '#777' }}>— CHOOSE A BEAT —</option>
            {beats.map(beat => (
              <option key={beat._id || beat.id} value={beat._id || beat.id} style={{ background: '#1c1c2a', color: '#F6F4D3' }}>
                {beat.name}
              </option>
            ))}
          </select>
          <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M0 0L5 6L10 0H0Z" fill="#CBC895"/>
          </svg>
        </div>
      </div>

      {/* Status bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '14px' }}>
        <span className="viz-fs-8" style={{ color: '#a8a880' }}>
          VOL <span className="viz-fs-8" style={{ color: '#FFEF2E' }}>{volume}%</span>
        </span>
        <span className="viz-fs-8" style={{ color: '#a8a880' }}>
          QUAL <span className="viz-fs-8" style={{ color: '#FFEF2E' }}>{quality.toUpperCase()}</span>
        </span>
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{
            width: '9px', height: '9px', borderRadius: '50%', display: 'inline-block',
            background: isPlaying ? '#4CAF50' : '#444',
            boxShadow: isPlaying ? '0 0 10px #4CAF50' : 'none',
            transition: 'all 0.3s',
          }} />
          <span className="viz-fs-7" style={{ color: isPlaying ? '#4CAF50' : '#666' }}>
            {isPlaying ? 'LIVE' : 'IDLE'}
          </span>
        </span>
      </div>

      {/* Frequency bars */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', height: '88px', gap: '3px',
        background: '#0a0a16', padding: '6px 8px',
        border: '1px solid rgba(203,200,149,0.2)',
        marginBottom: '16px', position: 'relative', overflow: 'hidden',
      }}>
        {[25, 50, 75].map(pct => (
          <div key={pct} style={{
            position: 'absolute', left: 8, right: 8,
            bottom: `calc(${pct}% + 6px)`,
            borderTop: '1px solid rgba(203,200,149,0.1)',
            pointerEvents: 'none',
          }} />
        ))}
        {bars.map((bar, i) => {
          const ratio = bar / 100;
          const r = Math.round(203 + ratio * 52);
          const g = Math.round(200 + ratio * 18);
          const b = Math.round(149 - ratio * 109);
          return (
            <div key={i} style={{
              flex: 1, height: `${bar}%`, minHeight: '3px',
              background: `rgb(${r},${g},${b})`,
              boxShadow: ratio > 0.6 ? `0 0 4px rgba(${r},${g},${b},0.5)` : 'none',
              transition: 'height 0.07s ease',
            }} />
          );
        })}
      </div>

      {/* Play/Stop button */}
      <button
        onClick={isPlaying ? stopAudio : startAudio}
        disabled={!canPlay && !isPlaying}
        className="viz-fs-9"
        style={{
          background: isPlaying ? 'rgba(255,239,46,0.1)' : '#1c1c2a',
          border: `1px solid ${isPlaying ? 'rgba(255,239,46,0.75)' : canPlay ? 'rgba(203,200,149,0.65)' : 'rgba(203,200,149,0.2)'}`,
          color: canPlay || isPlaying ? '#F6F4D3' : '#555',
          padding: '10px 22px',
          cursor: canPlay || isPlaying ? 'pointer' : 'not-allowed',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          letterSpacing: '1px',
          transition: 'all 0.2s',
          outline: 'none',
        }}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 46 46" fill="none">
            <rect x="2" y="2" width="42" height="42" stroke="#FFEF2E" strokeWidth="2"/>
            <rect x="14" y="12" width="6" height="22" fill="#FFEF2E"/>
            <rect x="26" y="12" width="6" height="22" fill="#FFEF2E"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 46 46" fill="none">
            <rect x="2" y="2" width="42" height="42" stroke={canPlay ? '#CBC895' : '#444'} strokeWidth="2"/>
            <path d="M16 12L34 23L16 34V12Z" fill={canPlay ? '#CBC895' : '#444'}/>
          </svg>
        )}
        {isPlaying ? 'STOP PREVIEW' : 'PLAY PREVIEW'}
      </button>
    </div>
  );
};

// Main Settings Component
const Settings = () => {
  const { t } = useTranslation();
  const { fetchSettings: refreshGlobalSettings } = useSettings();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth?.user);

  // Account & Login State
  const [newEmail, setNewEmail] = useState("");
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    dispatch(me());
  }, [dispatch]);

  // General Settings State
  const [siteTitle, setSiteTitle] = useState("Beatspace");
  const [language, setLanguage] = useState("English");

  // Logo Upload State
  const [uploadedFile, setUploadedFile] = useState(null);
  const [existingLogo, setExistingLogo] = useState("");
  const [settingsId, setSettingsId] = useState(null);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // Theme Settings State
  const [darkMode, setDarkMode] = useState(true);
  const [retroNeonMode, setRetroNeonMode] = useState(false);

  // Category Management State
  const [categories, setCategories] = useState([]);
  const [activeType, setActiveType] = useState("genre"); // genre or category
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "category",
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryDeleteConfirm, setCategoryDeleteConfirm] = useState({
    isOpen: false,
    id: null,
  });

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const [genresRes, categoriesRes] = await Promise.all([
        CategoryAPI.getAll("genre"),
        CategoryAPI.getAll("category"),
      ]);
      const combinedCategories = [
        ...genresRes.data.data,
        ...categoriesRes.data.data,
      ];
      setCategories(combinedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(t('settings.categories.loading_failed') || "Failed to load categories");
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await SettingsAPI.get();
      const settings = res.data.data;
      if (settings) {
        setSiteTitle(settings.site_title || "Beatspace");
        setExistingLogo(settings.site_logo || "");
        setLanguage(settings.language || "English");
        setDarkMode(settings.dark_mode ?? true);
        setRetroNeonMode(settings.retro_mode ?? false);
        setEnableRadio(settings.enable_radio ?? true);
        setDefaultVolume(settings.default_volume ?? 70);
        setAudioQuality(settings.audio_quality || "high");
        setSettingsId(settings._id);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSettings();
  }, [fetchCategories, fetchSettings]);

  // Security & Backup State
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Audio & Player Settings State
  const [enableRadio, setEnableRadio] = useState(true);
  const [defaultVolume, setDefaultVolume] = useState(70);
  const [audioQuality, setAudioQuality] = useState("high");

  // Confirmation Modals State
  const [resetConfirm, setResetConfirm] = useState(false);

  // Handlers
  const handleFileSelect = (file) => {
    setUploadedFile(file);
    // Create a preview for the UI
    const reader = new FileReader();
    reader.onloadend = () => {
      setExistingLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async () => {
    setIsSavingGeneral(true);
    try {
      const formData = new FormData();
      formData.append("site_title", siteTitle);
      formData.append("language", language);
      formData.append("dark_mode", darkMode);
      formData.append("retro_mode", retroNeonMode);
      formData.append("enable_radio", enableRadio);
      formData.append("default_volume", defaultVolume);
      formData.append("audio_quality", audioQuality);

      if (uploadedFile) {
        formData.append("logo", uploadedFile);
      }

      await SettingsAPI.update(settingsId || "undefined", formData);
      setUploadedFile(null);
      toast.success(t('settings.messages.save_success'));
      fetchSettings();
      refreshGlobalSettings();
    } catch (error) {
      console.error("Save error:", error);
      toast.error(t('settings.messages.save_failed'));
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, type: category.type });
    setIsAddingCategory(true);
  };

  const handleDeleteCategory = (id) => {
    setCategoryDeleteConfirm({ isOpen: true, id });
  };

  const confirmDeleteCategory = async () => {
    if (!categoryDeleteConfirm.id) return;
    try {
      await CategoryAPI.delete(categoryDeleteConfirm.id);
      toast.success(t('settings.messages.delete_success'));
      fetchCategories();
    } catch (error) {
      toast.error(t('settings.messages.delete_failed'));
    } finally {
      setCategoryDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name) {
      toast.error(t('settings.messages.name_required'));
      return;
    }
    try {
      if (editingCategory) {
        await CategoryAPI.update(editingCategory._id, {
          ...newCategory,
          type: activeType,
        });
        toast.success(
          activeType === "genre" 
            ? t('settings.messages.genre_updated') 
            : t('settings.messages.category_updated')
        );
      } else {
        await CategoryAPI.create({ ...newCategory, type: activeType });
        toast.success(
          activeType === "genre" 
            ? t('settings.messages.genre_added') 
            : t('settings.messages.category_added')
        );
      }
      setNewCategory({ name: "", type: activeType });
      setEditingCategory(null);
      setIsAddingCategory(false);
      fetchCategories();
    } catch (error) {
      toast.error(
        editingCategory
          ? t('settings.messages.update_failed')
          : t('settings.messages.add_failed')
      );
    }
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      // Pull the actual value out of an API response, tolerating both
      // { data: { data: ... } } and { data: ... } shapes.
      const pick = (r) => (r?.data?.data !== undefined ? r.data.data : r?.data ?? null);
      // Run each fetch in isolation so one failing endpoint never aborts the
      // whole backup — failed sections are recorded as { __error } instead.
      const safe = async (promise) => {
        try {
          return pick(await promise);
        } catch (e) {
          return { __error: e?.response?.data?.message || e?.message || "Failed to fetch" };
        }
      };

      const [
        settingsData,
        beats,
        merch,
        comics,
        games,
        orders,
        donations,
        assets,
        dashboard,
      ] = await Promise.all([
        safe(SettingsAPI.get()),
        safe(custAxios.get("/admin/getBeats")),
        safe(custAxios.get("/public/merchs")),
        safe(custAxios.get("/admin/getComics")),
        safe(custAxios.get("/admin/getGames")),
        safe(custAxios.get("/admin/orders")),
        safe(custAxios.get("/admin/donations")),
        safe(custAxios.get("/admin/assets")),
        safe(custAxios.get("/admin/dashboard")),
      ]);

      const count = (v) => (Array.isArray(v) ? v.length : 0);

      const data = {
        exportDate: new Date().toISOString(),
        exportedBy: "Beatspace Admin",
        version: 2,
        summary: {
          beats: count(beats),
          merch: count(merch),
          comics: count(comics),
          games: count(games),
          orders: count(orders),
          donations: count(donations),
          assets: count(assets),
          categories: count(categories),
        },
        preferences: { siteTitle, language, darkMode, retroNeonMode },
        settings: settingsData,
        categories,
        beats,
        merch,
        comics,
        games,
        orders,
        donations,
        assets,
        dashboard,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `beatspace-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('settings.security.export_success', 'Backup exported successfully'));
    } catch (error) {
      console.error("Export failed:", error);
      toast.error(t('settings.security.export_failed', 'Export failed'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetSettings = () => {
    setResetConfirm(true);
  };

  const confirmResetSettings = async () => {
    setIsResetting(true);
    setResetConfirm(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Settings reset to default");
    } catch (error) {
      console.error("Reset failed:", error);
    } finally {
      setIsResetting(false);
    }
  };

  // Account & Login Handlers
  const handleUpdateEmail = async () => {
    const trimmed = newEmail.trim();
    if (!trimmed) {
      toast.error(t('settings.account.email_required', 'Please enter a new email address'));
      return;
    }
    if (currentUser?.email && trimmed.toLowerCase() === currentUser.email.toLowerCase()) {
      toast.error(t('settings.account.email_same', 'New email must be different from your current email'));
      return;
    }

    setIsChangingEmail(true);
    try {
      const res = await changeEmail(trimmed);
      if (res.success) {
        toast.success(t('settings.account.email_change_pending', `Verification link sent to ${trimmed}. Confirm it to finish changing your email.`, { email: trimmed }));
        setNewEmail("");
      } else {
        toast.error(res.message || t('settings.account.email_change_failed', 'Failed to update email'));
      }
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error(t('settings.account.password_required', 'Please fill in all password fields'));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t('settings.account.password_too_short', 'Password must be at least 8 characters'));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error(t('settings.account.password_mismatch', 'New passwords do not match'));
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success(t('settings.account.password_updated', 'Password updated successfully'));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast.error(res.message || t('settings.account.password_update_failed', 'Failed to update password'));
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Audio & Player Settings Handlers
  const handleVolumeChange = (volume) => {
    setDefaultVolume(volume);
    console.log("Volume changed to:", volume);
  };

  const handleRadioToggle = (enabled) => {
    setEnableRadio(enabled);
    console.log("Radio enabled:", enabled);
  };

  const handleQualityChange = (quality) => {
    setAudioQuality(quality);
    console.log("Quality changed to:", quality);
  };

  return (
    <main className="min-h-screen w-full overflow-x-auto">
      <div className="max-w-none py-8 px-6 mb-3 border-1 border-[#CBC895] bg-[#2F2E24]  relative mx-auto">
        <h1 className="text-[#DFD74F] mb-10 text-lg sm:text-xl pixel-font">
          {t('settings.general.title')}
        </h1>
        <div className="space-y-6 mb-10">
          <div className="w-full">
            <label
              htmlFor="site-title"
              className="block text-white pixel-font  !text-sm  uppercase mb-4"
            >
              {t('settings.general.site_title')}
            </label>
            <div className="relative alexandria-font">
              <input
                id="site-title"
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full h-12 sm:h-14 lg:h-[60px] bg-[#191A22] border border-[#CBC895] px-4 sm:px-5 py-3 sm:py-3.5 text-[#9C963A] text-base sm:text-lg font-medium leading-6 sm:leading-7 focus:outline-none focus:ring-2 focus:ring-[#CBC895] transition-all"
                placeholder={t('settings.general.site_title_placeholder')}
                aria-describedby="site-title-help"
              />
            </div>
          </div>
        </div>
        {/* Logo Upload Section */}
        <div className="relative mb-10 z-10">
          <section className="w-full mx-auto">
            <h2 className="pixel-font text-[#fff] text-[12px] uppercase tracking-widest mb-4">
              {t('settings.general.logo_upload_title')}
            </h2>
            <div className="relative">
              <FileUpload
                onFileSelect={handleFileSelect}
                currentImage={existingLogo}
                accept="image/png,image/jpeg"
                maxSize={2 * 1024 * 1024}
                className="w-full"
              />

              {uploadedFile && (
                <div className="mt-4 p-4 bg-[#191A22] border border-[#CBC895] rounded">
                  <p className="text-[#9C963A] text-xs mb-2">{t('settings.general.file_selected')}</p>
                  <p className="text-[#9C963A] text-xs mt-2">
                    {t('settings.general.ready_to_upload', { name: uploadedFile.name, size: (uploadedFile.size / 1024).toFixed(1) })}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="relative z-10 mb-10 ">
          <div className="space-y-4 sm:space-y-6">
            <div className="w-full relative">
              <label className="block text-white text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 uppercase min-h-6 sm:min-h-7 cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only"
                  aria-describedby="dark-mode-description"
                />
                <span className="flex items-center">
                  <span
                    className={`w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#CBC895] mr-3 flex items-center justify-center ${darkMode ? "bg-[#CBC895]" : "bg-transparent"} transition-colors`}
                  >
                    {darkMode && (
                      <svg
                        className="w-3 h-3 sm:w-3 sm:h-3"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="#191A22"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    )}
                  </span>
                  {t('settings.general.dark_mode')}
                </span>
              </label>
              <p
                id="dark-mode-description"
                className="text-[#FFF999] text-start text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 min-h-6 sm:min-h-7 mt-2"
              >
                {t('settings.general.dark_mode_desc')}
              </p>
            </div>
            <div className="w-full relative">
              <label className="block text-white text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 uppercase min-h-6 sm:min-h-7 cursor-pointer">
                <input
                  type="checkbox"
                  checked={retroNeonMode}
                  onChange={(e) => setRetroNeonMode(e.target.checked)}
                  className="sr-only"
                  aria-describedby="retro-neon-description"
                />
                <span className="flex items-center">
                  <span
                    className={`w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#CBC895] mr-3 flex items-center justify-center ${retroNeonMode ? "bg-[#CBC895]" : "bg-transparent"} transition-colors`}
                  >
                    {retroNeonMode && (
                      <svg
                        className="w-3 h-3 sm:w-3 sm:h-3"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="#191A22"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    )}
                  </span>
                  {t('settings.general.retro_mode')}
                </span>
              </label>
              <p
                id="retro-neon-description"
                className="text-[#FFF999] text-start text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 min-h-6 sm:min-h-7 mt-2"
              >
                {t('settings.general.retro_mode_desc')}
              </p>
            </div>
          </div>
        </div>
        <div className="w-full">
          <label
            htmlFor="language"
            className="block text-white pixel-font  !text-sm  uppercase mb-4"
          >
            {t('settings.general.language')}
          </label>
          <div className="relative alexandria-font">
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full h-12 sm:h-14 lg:h-[60px] bg-[#191A22] border border-[#CBC895] px-4 sm:px-5 py-3 sm:py-3.5 text-[#9C963A] text-base sm:text-lg font-medium leading-6 sm:leading-7 appearance-none focus:outline-none focus:ring-2 focus:ring-[#CBC895] cursor-pointer transition-all"
              aria-describedby="language-help"
            >
              <option value="English">{t('settings.general.languages.english')}</option>
              <option value="French">{t('settings.general.languages.french')}</option>
              <option value="Spanish">{t('settings.general.languages.spanish')}</option>
              <option value="German">{t('settings.general.languages.german')}</option>
            </select>
            <div className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-3 sm:w-[22px] sm:h-[13px]"
                viewBox="0 0 23 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M19.3334 0.348354L22.4727 0.348354L22.4727 3.48758L19.3334 3.48758L19.3334 6.62681L16.1942 6.62681L16.1942 9.76604L13.055 9.76604L13.055 12.9053L9.91574 12.9053L9.91574 9.76604L6.77651 9.76604L6.77651 6.62681L3.63728 6.62681L3.63728 3.48758L0.498047 3.48758L0.498047 0.348352L3.63728 0.348353L3.63728 3.48758L6.77651 3.48758L6.77651 6.62681L9.91574 6.62681L9.91574 9.76604L13.055 9.76604L13.055 6.62681L16.1942 6.62681L16.1942 3.48758L19.3334 3.48758L19.3334 0.348354Z"
                  fill="#FFEF2E"
                />
              </svg>
            </div>
          </div>
        </div>
        <p className="text-[#FFF999] text-xs alexandria-font mt-6">
          💡 To change the background music or font, go to <strong>Asset Management</strong>.
        </p>

        <button
          onClick={handleSaveSettings}
          disabled={isSavingGeneral}
          className="mt-6 bg-[#DFD74F] alexandria-font text-[#191A22] px-8 py-3 rounded text-sm font-bold hover:bg-[#FFF999] transition-colors disabled:opacity-50"
        >
          {isSavingGeneral ? t('settings.general.saving') : t('settings.general.save')}
        </button>
      </div>

      {/* Category / Genre Management — moved to Beatmaker (#21) */}
      {false && <div><div className="relative py-8 px-6 mb-3 border-1 border-[#CBC895] bg-[#2F2E24]">
        <h1 className="text-[#DFD74F] mb-6 text-lg sm:text-xl pixel-font">
          {t('settings.categories.title')}
        </h1>
        <div className="w-full">
          <div className="w-full min-h-[60px] sm:min-h-[66px] lg:min-h-[72px] flex items-center bg-[#131319] px-4 sm:px-6 lg:px-[26px] py-4 sm:py-6 lg:py-0 hidden sm:flex">
            <div className="text-[#CBC895] text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 min-w-0 sm:min-w-[200px] flex-shrink-0">
              {activeType === "genre" ? t('settings.categories.genre_name') : t('settings.categories.category_name')}
            </div>
            <div className="text-[#CBC895] text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 min-w-0 sm:min-w-[150px] flex-shrink-0">
              {t('settings.categories.type')}
            </div>
            <div className="text-[#CBC895] text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 ml-auto flex items-center gap-6">
              {/* Type Filter Toggle */}
              <div className="flex bg-[#191A22] border border-[#CBC895] rounded">
                <button
                  onClick={() => setActiveType("genre")}
                  className={`px-3 py-1 text-xs font-bold transition-colors ${activeType === "genre" ? "bg-[#CBC895] text-[#191A22]" : "text-[#CBC895]"}`}
                >
                  {t('settings.categories.genres')}
                </button>
                <button
                  onClick={() => setActiveType("category")}
                  className={`px-3 py-1 text-xs font-bold transition-colors ${activeType === "category" ? "bg-[#CBC895] text-[#191A22]" : "text-[#CBC895]"}`}
                >
                  {t('settings.categories.categories')}
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingCategory(null);
                  setNewCategory({ name: "", type: activeType });
                  setIsAddingCategory(true);
                }}
                className="bg-[#CBC895] text-[#191A22] px-4 py-1 rounded text-sm font-bold hover:bg-[#FFF999] transition-colors"
              >
                ADD {activeType === "genre" ? t('settings.categories.genres') : t('settings.categories.categories')}
              </button>
              <span>{t('settings.categories.actions')}</span>
            </div>
          </div>

          {isAddingCategory && (
            <div className="bg-[#191A22] border border-[#CBC895] p-4 mb-4 mt-2">
              <form
                onSubmit={handleSaveCategory}
                className="flex flex-col sm:flex-row gap-4 items-end"
              >
                <div className="flex-1 w-full">
                  <label className="text-[#CBC895] text-xs font-bold mb-1 block alexandria-font">
                    {activeType === "genre" ? t('settings.categories.genre_name').toUpperCase() : t('settings.categories.category_name').toUpperCase()}
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-[#131319] border border-[#CBC895] px-3 py-2 text-white alexandria-font"
                    placeholder={
                      activeType === "genre"
                        ? t('settings.categories.placeholders.genre')
                        : t('settings.categories.placeholders.category')
                    }
                  />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none bg-[#DFD74F] text-[#191A22] px-6 py-2 font-bold hover:bg-[#FFF999]"
                  >
                     {editingCategory ? t('common.update') : t('common.save')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(false);
                      setEditingCategory(null);
                    }}
                    className="flex-1 sm:flex-none bg-red-600 text-white px-6 py-2 font-bold hover:bg-red-500"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-0">
            {isLoadingCategories ? (
              <div className="text-center py-10 text-[#CBC895]">
                {t('settings.categories.loading', { type: activeType })}
              </div>
            ) : categories.filter((c) => c.type === activeType).length === 0 ? (
              <div className="text-center py-10 text-[#CBC895]">
                {t('settings.categories.none_found', { type: activeType })}
              </div>
            ) : (
              categories
                .filter((c) => c.type === activeType)
                .map((category) => (
                  <CategoryRow
                    key={category._id}
                    categoryName={category.name}
                    type={category.type}
                    onEdit={() => handleEditCategory(category)}
                    onDelete={() => handleDeleteCategory(category._id)}
                  />
                ))
            )}
          </div>
        </div>
      </div></div>}

      {/* Audio Player Section */}
      <div className="relative py-8 px-6 mb-3 border-1 border-[#CBC895] bg-[#2F2E24] ">
        <section className="bg-[rgba(181,179,135,0.16)] border flex w-full flex-col pt-[42px] pb-[119px] px-[27px] border-[rgba(203,200,149,1)] border-solid max-md:max-w-full max-md:pb-[100px] max-md:px-5">
          <h1 className="text-[#DFD74F] text-lg sm:text-xl pixel-font">
            {t('settings.audio.title')}
          </h1>
          <fieldset className="border-0 p-0 m-0">
            <legend className="sr-only">{t('settings.audio.radio_settings')}</legend>

            <ToggleOption
              title={t('settings.audio.radio')}
              description={t('settings.audio.radio_desc')}
              checkedIcon={SpeakerOnIcon}
              uncheckedIcon={SpeakerOffIcon}
              defaultChecked={enableRadio}
              onChange={handleRadioToggle}
            />

            <SettingsRow icon={AntennaIcon} title={t('settings.audio.volume')}>
              <VolumeSlider
                value={defaultVolume}
                onChange={handleVolumeChange}
              />
            </SettingsRow>

            <SettingsRow
              icon={<div className="w-[40px] sm:w-[46px]" />}
              title={t('settings.audio.quality')}
              description={t('settings.audio.quality_desc')}
            >
              <QualitySelector
                defaultValue={audioQuality}
                onChange={handleQualityChange}
              />
            </SettingsRow>

            <SettingsRow
              icon={<div className="w-[40px] sm:w-[46px]" />}
              title={t('settings.audio.visualizer')}
              titleClassName="text-[rgba(255,239,46,1)] text-base sm:text-lg lg:text-xl alexandria-font leading-none block mb-3"
            >
              <AudioVisualizerPreview volume={defaultVolume} quality={audioQuality} />
            </SettingsRow>

            <button
              onClick={(e) => {
                e.preventDefault();
                handleSaveSettings();
              }}
              disabled={isSavingGeneral}
              className="mt-8 bg-[#DFD74F] alexandria-font text-[#191A22] px-8 py-3 rounded text-sm font-bold hover:bg-[#FFF999] transition-colors disabled:opacity-50"
            >
              {isSavingGeneral ? t('settings.general.saving') : t('settings.general.save')}
            </button>
          </fieldset>
        </section>
      </div>

      {/* Account & Login Section */}
      <div className="relative pt-8 sm:pt-12 lg:pt-[50px] py-8 px-6 mb-3 border-1 border-[#CBC895] bg-[#2F2E24] ">
        <section className="w-full mx-auto px-4 sm:px-6 lg:px-[27px]">
          <header className="mb-8 sm:mb-10 lg:mb-[50px]">
            <h1 className="text-[#DFD74F] sm:text-md lg:text-lg pixel-font uppercase block mb-1 sm:mb-2 cursor-pointer">
              {t('settings.account.title')}
            </h1>
          </header>

          <div className="space-y-12">
            {/* Change Email */}
            <div className="space-y-6">
              <div className="flex gap-6 sm:gap-8 lg:gap-[30px] sm:flex-row flex-col sm:items-center items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-10 h-11 sm:w-12 sm:h-13 lg:w-[53px] lg:h-[58px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFEF2E"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="1" />
                    <path d="M3 6l9 7 9-7" />
                  </svg>
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-white text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 uppercase mb-2">
                    {t('settings.account.email_label')}
                  </h3>
                  <p className="text-[#FFF999] text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7">
                    {currentUser?.email || t('settings.account.email_desc')}
                  </p>
                </div>
              </div>

              <div className="w-full max-w-xl">
                <label
                  htmlFor="new-email"
                  className="block text-white pixel-font !text-sm uppercase mb-4"
                >
                  {t('settings.account.new_email_label')}
                </label>
                <div className="alexandria-font flex flex-col sm:flex-row gap-3">
                  <input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder={t('settings.account.new_email_placeholder')}
                    autoComplete="email"
                    className="w-full h-12 sm:h-14 lg:h-[60px] bg-[#191A22] border border-[#CBC895] px-4 sm:px-5 py-3 sm:py-3.5 text-[#9C963A] text-base sm:text-lg font-medium leading-6 sm:leading-7 focus:outline-none focus:ring-2 focus:ring-[#CBC895] transition-all"
                  />
                  <button
                    onClick={handleUpdateEmail}
                    disabled={isChangingEmail}
                    className="flex-shrink-0 h-12 sm:h-14 lg:h-[60px] px-6 sm:px-8 shadow-[0_7px_2px_0_#000] bg-[#CBC895] hover:bg-[#b8b582] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#CBC895] focus:ring-offset-2 focus:ring-offset-[#1a1b22]"
                  >
                    <span className="text-[#191A22] alexandria-font text-base sm:text-lg font-semibold whitespace-nowrap">
                      {isChangingEmail ? t('settings.account.updating_email') : t('settings.account.update_email_button')}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="space-y-6">
              <div className="flex gap-6 sm:gap-8 lg:gap-[30px] sm:flex-row flex-col sm:items-center items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-10 h-11 sm:w-12 sm:h-13 lg:w-[53px] lg:h-[58px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFEF2E"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="4" y="11" width="16" height="10" rx="1" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-white text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 uppercase mb-2">
                    {t('settings.account.password_label')}
                  </h3>
                  <p className="text-[#FFF999] text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7">
                    {t('settings.account.password_desc')}
                  </p>
                </div>
              </div>

              <div className="w-full max-w-xl space-y-6">
                <div>
                  <label
                    htmlFor="current-password"
                    className="block text-white pixel-font !text-sm uppercase mb-4"
                  >
                    {t('settings.account.current_password_label')}
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    autoComplete="current-password"
                    className="alexandria-font w-full h-12 sm:h-14 lg:h-[60px] bg-[#191A22] border border-[#CBC895] px-4 sm:px-5 py-3 sm:py-3.5 text-[#9C963A] text-base sm:text-lg font-medium leading-6 sm:leading-7 focus:outline-none focus:ring-2 focus:ring-[#CBC895] transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-white pixel-font !text-sm uppercase mb-4"
                  >
                    {t('settings.account.new_password_label')}
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="alexandria-font w-full h-12 sm:h-14 lg:h-[60px] bg-[#191A22] border border-[#CBC895] px-4 sm:px-5 py-3 sm:py-3.5 text-[#9C963A] text-base sm:text-lg font-medium leading-6 sm:leading-7 focus:outline-none focus:ring-2 focus:ring-[#CBC895] transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-new-password"
                    className="block text-white pixel-font !text-sm uppercase mb-4"
                  >
                    {t('settings.account.confirm_password_label')}
                  </label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="alexandria-font w-full h-12 sm:h-14 lg:h-[60px] bg-[#191A22] border border-[#CBC895] px-4 sm:px-5 py-3 sm:py-3.5 text-[#9C963A] text-base sm:text-lg font-medium leading-6 sm:leading-7 focus:outline-none focus:ring-2 focus:ring-[#CBC895] transition-all"
                  />
                </div>

                <button
                  onClick={handleUpdatePassword}
                  disabled={isChangingPassword}
                  className="w-full sm:w-auto sm:min-w-[200px] lg:w-[246px] h-12 sm:h-14 lg:h-[53px] shadow-[0_7px_2px_0_#000] bg-[#CBC895] hover:bg-[#b8b582] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#CBC895] focus:ring-offset-2 focus:ring-offset-[#1a1b22]"
                >
                  <span className="text-[#191A22] alexandria-font text-base sm:text-lg font-semibold">
                    {isChangingPassword ? t('settings.account.updating_password') : t('settings.account.update_password_button')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Security & Backup Section */}
      <div className="relative pt-8 sm:pt-12 lg:pt-[50px] py-8 px-6 mb-3 border-1 border-[#CBC895] bg-[#2F2E24] ">
        <section className="w-full mx-auto px-4 sm:px-6 lg:px-[27px]">
          <header className="mb-8 sm:mb-10 lg:mb-[50px]">
            <h1 className="text-[#DFD74F] sm:text-md lg:text-lg pixel-font uppercase block mb-1 sm:mb-2 cursor-pointer">
              {t('settings.security.title')}
            </h1>
          </header>

          <div className="space-y-12">
            <div className="space-y-8 ">
              <div className="flex gap-6 sm:gap-8 lg:gap-[30px] sm:flex-row flex-col sm:items-center items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-10 h-11 sm:w-12 sm:h-13 lg:w-[53px] lg:h-[58px]"
                    viewBox="0 0 55 59"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M8.93271 24.1849H6.2748V18.869H11.5906V21.527H14.2485V24.1849H16.9064V26.8428H19.5644V29.5007H22.2223V32.1586H24.8802V0.263672H30.196V32.1586H32.8539V29.5007H35.5118V26.8428H38.1697V24.1849H40.8276V21.527H43.4855V18.869H48.8014V24.1849H46.1435V26.8428H43.4855V29.5007H40.8276V32.1586H38.1697V34.8165H35.5118V37.4744H32.8539V40.1323H30.196V42.7902H24.8802V40.1323H22.2223V37.4744H19.5644V34.8165H16.9064V32.1586H14.2485V29.5007H11.5906V26.8428H8.93271V24.1849ZM0.958984 53.4219H54.1172V58.7377H0.958984V53.4219Z"
                      fill="#FFEF2E"
                    />
                  </svg>
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-white text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 uppercase mb-2">
                    {t('settings.security.export')}
                  </h3>
                  <p className="text-[#FFF999] text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7">
                    {t('settings.security.export_desc')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportBackup}
                disabled={isExporting}
                className="flex w-full sm:w-auto sm:min-w-[200px] lg:w-[246px] h-12 sm:h-14 lg:h-[53px] justify-center items-center gap-2 sm:gap-2.5 shadow-[0_7px_2px_0_#000] bg-[#CBC895] px-3 sm:px-4 lg:px-[13px] py-3 sm:py-3.5 rounded-none hover:bg-[#b8b582] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#CBC895] focus:ring-offset-2 focus:ring-offset-[#1a1b22]"
                aria-describedby="export-description"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 lg:w-[19.914px] lg:h-[19.914px]"
                  viewBox="0 0 21 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12.0165 15.5327V0.0439453H9.80382V11.1073H7.59115V8.89464H5.37847V11.1073H7.59115V13.32H9.80382V15.5327H12.0165ZM20.8672 17.7453V13.32H18.6545V17.7453H3.1658V13.32H0.953125V19.958H20.8672V17.7453ZM12.0165 11.1073V13.32H14.2292V11.1073H16.4418V8.89464H14.2292V11.1073H12.0165Z"
                    fill="#191A22"
                  />
                </svg>
                <span className="text-[#191A22] alexandria-font text-base sm:text-lg font-semibold leading-6 sm:leading-7">
                  {isExporting ? t('settings.security.exporting') : t('settings.security.export_button')}
                </span>
              </button>
            </div>

            <div className="space-y-8 ">
              <div className="flex   gap-6 sm:gap-8 lg:gap-[30px] sm:flex-row flex-col sm:items-center items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="w-10 h-8 sm:w-12 sm:h-10 lg:w-[53px] lg:h-[44px]"
                    viewBox="0 0 55 45"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M24.0859 3.10352C27.9225 1.51439 32.1439 1.09809 36.2168 1.9082C40.2897 2.71836 44.0314 4.71788 46.9678 7.6543C49.9042 10.5907 51.9037 14.3324 52.7139 18.4053C53.524 22.4781 53.1077 26.6996 51.5186 30.5361C49.9294 34.3726 47.2388 37.6519 43.7861 39.959C40.6112 42.0804 36.9227 43.2894 33.1211 43.4707V41.8027C36.593 41.6228 39.9594 40.5126 42.8604 38.5742C46.0392 36.4502 48.5164 33.4306 49.9795 29.8984C51.4424 26.3664 51.8258 22.48 51.0801 18.7305C50.3342 14.9807 48.4925 11.5364 45.7891 8.83301C43.0857 6.1296 39.6413 4.28786 35.8916 3.54199C32.1421 2.79623 28.2556 3.17964 24.7236 4.64258C21.1915 6.10564 18.1719 8.5829 16.0479 11.7617C13.9239 14.9405 12.7901 18.6779 12.79 22.501V36.2803L20.3887 28.6816L21.54 29.833L11.957 39.417L2.37305 29.833L3.52539 28.6816L11.124 36.2803V22.501C11.1241 18.3484 12.356 14.2887 14.6631 10.8359C16.9702 7.3833 20.2495 4.69262 24.0859 3.10352Z"
                      fill="#FFEF2E"
                      stroke="#FFEF2E"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-white text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7 uppercase mb-2">
                    {t('settings.security.reset')}
                  </h3>
                  <p className="text-[#FFF999] text-base sm:text-lg lg:text-xl alexandria-font leading-6 sm:leading-7">
                    {t('settings.security.reset_desc')}
                  </p>
                </div>
              </div>

              <button
                onClick={handleResetSettings}
                disabled={isResetting}
                className="flex w-full sm:w-auto sm:min-w-[200px] lg:w-[246px] h-12 sm:h-14 lg:h-[53px] justify-center items-center gap-2 sm:gap-2.5 shadow-[0_7px_2px_0_#000] bg-[#CBC895] px-3 sm:px-4 lg:px-[13px] py-3 sm:py-3.5 rounded-none hover:bg-[#b8b582] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#CBC895] focus:ring-offset-2 focus:ring-offset-[#1a1b22]"
                aria-describedby="reset-description"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 lg:w-[19.914px] lg:h-[19.914px]"
                  viewBox="0 0 19 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M10.995 15.6077C12.4995 15.6077 13.9703 15.1616 15.2212 14.3257C16.4722 13.4898 17.4472 12.3018 18.023 10.9117C18.5988 9.52173 18.7494 7.9922 18.4559 6.51657C18.1624 5.04094 17.4379 3.68549 16.374 2.62162C15.3101 1.55775 13.9547 0.833247 12.479 0.539726C11.0034 0.246205 9.47387 0.396851 8.08386 0.972613C6.69385 1.54838 5.50578 2.52339 4.6699 3.77437C3.83403 5.02535 3.38788 6.4961 3.38788 8.00064V11.931L1.10575 9.64884L0.218262 10.5363L4.0218 14.3399L7.82535 10.5363L6.93785 9.64884L4.65573 11.931V8.00064C4.65573 6.74686 5.02752 5.52123 5.72408 4.47875C6.42065 3.43627 7.4107 2.62375 8.56904 2.14395C9.72739 1.66415 11.002 1.53861 12.2317 1.78321C13.4614 2.02781 14.5909 2.63157 15.4775 3.51812C16.364 4.40468 16.9678 5.53423 17.2124 6.76392C17.457 7.99361 17.3315 9.26822 16.8517 10.4266C16.3719 11.5849 15.5593 12.575 14.5169 13.2715C13.4744 13.9681 12.2487 14.3399 10.995 14.3399V15.6077Z"
                    fill="#191A22"
                  />
                </svg>
                <span className="text-[#191A22] alexandria-font text-base sm:text-lg font-semibold leading-6 sm:leading-7">
                  {isResetting ? t('settings.security.resetting') : t('settings.security.reset_button')}
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal
        isOpen={resetConfirm}
        title={t('settings.security.reset_modal_title')}
        message={t('settings.security.reset_modal_message')}
        onConfirm={confirmResetSettings}
        onCancel={() => setResetConfirm(false)}
      />

      <ConfirmModal
        isOpen={categoryDeleteConfirm.isOpen}
        title={t('settings.categories.delete_modal_title')}
        message={t('settings.categories.delete_modal_message')}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setCategoryDeleteConfirm({ isOpen: false, id: null })}
      />
    </main>
  );
};

export default Settings;
