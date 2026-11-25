import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Upload,
  X,
} from 'lucide-react';
import { AppLang, MicroTrend } from '../types';
import { parseSignalsCsv, SAMPLE_CSV_TEMPLATE } from '../utils/csvParser';
import { downloadTextFile } from '../utils/exportMarkdown';
import { CertaintyBadge, CategoryTag, MaturityBadge } from './SemanticBadges';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportTrends: (newTrends: MicroTrend[]) => void;
  lang?: AppLang;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImportTrends,
  lang = 'fr',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<MicroTrend[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;
  const isFr = lang === 'fr';

  const handleDownloadTemplate = () => {
    downloadTextFile(
      'mediawan-radar-signal-template.csv',
      SAMPLE_CSV_TEMPLATE,
      'text/csv;charset=utf-8;'
    );
  };

  const processCsvContent = (content: string, sourceName: string) => {
    const { trends, errors } = parseSignalsCsv(content);
    setParsedPreview(trends);
    setParseErrors(errors);
    setUploadedFileName(sourceName);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = String(e.target?.result ?? '');
      processCsvContent(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) return;
    onImportTrends(parsedPreview);
    setParsedPreview([]);
    setParseErrors([]);
    setUploadedFileName(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#22201D]/35 dark:bg-black/60 backdrop-blur-[2px] animate-backdrop-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-modal-title"
        className="w-full max-w-[660px] rounded-[20px] bg-[#FFFFFF] dark:bg-[#2E2C28] border border-[#EAE4D9] dark:border-[#3E3B35] shadow-elevated overflow-hidden animate-modal-in"
      >
        <div className="px-6 py-4.5 border-b border-[#EAE4D9] dark:border-[#3E3B35] bg-[#FBF9F4] dark:bg-[#24221F] flex items-center justify-between">
          <div>
            <h2
              id="csv-modal-title"
              className="font-display text-[16px] font-bold text-[#22201D] dark:text-[#F5F2EC]"
            >
              {isFr ? 'Importer des signaux (.csv)' : 'Import trends (.csv)'}
            </h2>
            <p className="text-[12px] text-[#625C53] dark:text-[#B5AFA4] mt-0.5">
              {isFr
                ? 'Les scores sont calculés automatiquement sous fenêtre ≤21 jours.'
                : 'Scores are calculated automatically inside the ≤21-day window.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-full text-[#625C53] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:bg-[#EAE4D9] dark:hover:bg-[#383632] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[76vh] overflow-y-auto">
          <div className="p-4 rounded-[14px] bg-[#FBF9F4] dark:bg-[#24221F] border border-[#EAE4D9] dark:border-[#3E3B35] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet
                className="w-5 h-5 text-[#1F6F43] dark:text-[#81B64C] shrink-0"
                strokeWidth={1.75}
              />
              <div>
                <div className="text-[13px] font-medium text-[#22201D] dark:text-[#F5F2EC]">
                  {isFr
                    ? '1. Modèle CSV exemple (3 tendances)'
                    : '1. Sample CSV template (3 trends)'}
                </div>
                <div className="text-[12px] text-[#625C53] dark:text-[#B5AFA4]">
                  {isFr
                    ? 'Téléchargez pour éditer ou prévisualisez directement'
                    : 'Download to edit or preview immediately'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#FFFFFF] dark:bg-[#2E2C28] hover:bg-[#F4F0E8] dark:hover:bg-[#383632] text-[#22201D] dark:text-[#F5F2EC] border border-[#EAE4D9] dark:border-[#3E3B35] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isFr ? 'Télécharger' : 'Download'}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  processCsvContent(
                    SAMPLE_CSV_TEMPLATE,
                    'mediawan-radar-signal-template.csv'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#EBF5EE] dark:bg-[#263628] hover:bg-[#DCECE1] dark:hover:bg-[#314734] text-[#1F6F43] dark:text-[#81B64C] transition-colors"
              >
                <span>{isFr ? 'Prévisualiser' : 'Preview rows'}</span>
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="csv-file-upload"
              className="block text-[12px] font-medium text-[#22201D] dark:text-[#F5F2EC] mb-2"
            >
              {isFr ? '2. Déposer ou choisir un fichier ' : '2. Upload or drop '}
              <code className="font-mono">.csv</code>
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-[14px] border border-dashed p-6 text-center transition-colors duration-150 ${
                isDragging
                  ? 'border-[#1F6F43] bg-[#EBF5EE] dark:bg-[#263628]'
                  : 'border-[#D5CEC0] dark:border-[#494640] bg-[#FFFFFF] dark:bg-[#24221F] hover:bg-[#FBF9F4] dark:hover:bg-[#33302B]'
              }`}
            >
              <input
                ref={fileInputRef}
                id="csv-file-upload"
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              <Upload
                className="w-5 h-5 text-[#625C53] dark:text-[#B5AFA4] mx-auto mb-2"
                strokeWidth={1.75}
              />
              <div className="text-[13px] font-medium text-[#22201D] dark:text-[#F5F2EC]">
                {uploadedFileName
                  ? `${isFr ? 'Chargé :' : 'Loaded:'} ${uploadedFileName}`
                  : isFr
                  ? 'Glissez un fichier .csv ici ou cliquez pour parcourir'
                  : 'Drop a .csv file here or click to browse'}
              </div>
              <div className="text-[11px] text-[#8E877D] mt-1 font-mono">
                title, category, primary_platform, days_since_t0, velocity_7d_pct, creator_count_7d, view_sub_anomaly_x
              </div>
            </div>
          </div>

          {parseErrors.length > 0 && (
            <div className="p-3 rounded-[12px] bg-[#FDF2F2] dark:bg-[#3A2727] border border-[#F3CFCF] dark:border-[#5D3838] text-[#991B1B] dark:text-[#F29C9C] text-[12px] space-y-1">
              {parseErrors.map((err, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {parsedPreview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#22201D] dark:text-[#F5F2EC] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1F6F43] dark:text-[#81B64C]" />
                  <span>
                    {parsedPreview.length}{' '}
                    {isFr
                      ? parsedPreview.length > 1
                        ? 'signaux prêts'
                        : 'signal prêt'
                      : parsedPreview.length > 1
                      ? 'trends ready'
                      : 'trend ready'}
                  </span>
                </span>
              </div>

              <div className="rounded-[12px] border border-[#EAE4D9] dark:border-[#3E3B35] overflow-hidden divide-y divide-[#EAE4D9] dark:divide-[#3E3B35]">
                {parsedPreview.map((item) => (
                  <div
                    key={item.id}
                    className="px-3.5 py-2.5 bg-[#FFFFFF] dark:bg-[#24221F] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-[#22201D] dark:text-[#F5F2EC] truncate">
                          {item.title}
                        </span>
                        <CategoryTag category={item.category} lang={lang} />
                      </div>
                      <div className="text-[11px] text-[#625C53] dark:text-[#B5AFA4] truncate mt-0.5 font-mono">
                        {item.viralVideo.creator.handle} · {item.daysSinceT0}d · +{item.velocity7d}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <MaturityBadge maturity={item.maturity} compact lang={lang} />
                      <CertaintyBadge certainty={item.certainty} lang={lang} />
                      <span className="font-mono text-[13px] font-semibold text-[#22201D] dark:text-[#F5F2EC] w-8 text-right">
                        {item.emergenceScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 bg-[#FBF9F4] dark:bg-[#24221F] border-t border-[#EAE4D9] dark:border-[#3E3B35] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-[13px] font-medium text-[#625C53] dark:text-[#B5AFA4] hover:text-[#22201D] dark:hover:text-[#F5F2EC] hover:bg-[#EAE4D9] dark:hover:bg-[#383632] transition-colors"
          >
            {isFr ? 'Annuler' : 'Cancel'}
          </button>
          <button
            type="button"
            disabled={parsedPreview.length === 0}
            onClick={handleConfirmImport}
            className="px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[#1F6F43] hover:bg-[#185B36] dark:bg-[#81B64C] dark:hover:bg-[#93C75D] text-[#FFFFFF] dark:text-[#191815] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isFr
              ? `Importer ${parsedPreview.length > 0 ? `${parsedPreview.length} signaux` : ''}`
              : `Import ${parsedPreview.length > 0 ? `${parsedPreview.length} signals` : 'signals'}`}
          </button>
        </div>
      </div>
    </div>
  );
};
