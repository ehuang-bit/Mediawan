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
import { isGoogleTrendsCsv, parseGoogleTrendsCsv } from '../utils/googleTrendsCsv';
import { downloadTextFile } from '../utils/exportMarkdown';
import { CertaintyBadge, CategoryTag, MaturityBadge } from './SemanticBadges';

import { tr } from '../i18n';

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
    const { trends, errors } = isGoogleTrendsCsv(content)
      ? parseGoogleTrendsCsv(content)
      : parseSignalsCsv(content);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/35 dark:bg-black/60 backdrop-blur-[2px] animate-backdrop-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-modal-title"
        className="w-full max-w-[660px] rounded-[20px] bg-surface border border-line shadow-elevated overflow-hidden animate-modal-in"
      >
        <div className="px-6 py-4.5 border-b border-line bg-soft flex items-center justify-between">
          <div>
            <h2
              id="csv-modal-title"
              className="font-display text-[16px] font-bold text-ink"
            >
              {isFr ? 'Importer des signaux (.csv)' : 'Import trends (.csv)'}
            </h2>
            <p className="text-[12px] text-ink-2 mt-0.5">
              {isFr
                ? 'Modèle Mediawan Radar ou export Google Trends (« Intérêt au fil du temps »), reconnu automatiquement.'
                : 'Mediawan Radar template or a Google Trends export (“Interest over time”), detected automatically.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr('Close modal', lang)}
            className="p-1.5 rounded-full text-ink-2 hover:text-ink hover:bg-line transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[76vh] overflow-y-auto">
          <div className="p-4 rounded-[14px] bg-soft border border-line flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileSpreadsheet
                className="w-5 h-5 text-accent shrink-0"
                strokeWidth={1.75}
              />
              <div>
                <div className="text-[13px] font-medium text-ink">
                  {isFr
                    ? '1. Modèle CSV exemple (3 tendances)'
                    : '1. Sample CSV template (3 trends)'}
                </div>
                <div className="text-[12px] text-ink-2">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-surface hover:bg-canvas text-ink border border-line transition-colors"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-accent-soft hover:bg-accent-soft text-accent transition-colors"
              >
                <span>{isFr ? 'Prévisualiser' : 'Preview rows'}</span>
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="csv-file-upload"
              className="block text-[12px] font-medium text-ink mb-2"
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
                  ? 'border-accent bg-accent-soft'
                  : 'border-line bg-surface hover:bg-soft'
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
                className="w-5 h-5 text-ink-2 mx-auto mb-2"
                strokeWidth={1.75}
              />
              <div className="text-[13px] font-medium text-ink">
                {uploadedFileName
                  ? `${isFr ? 'Chargé :' : 'Loaded:'} ${uploadedFileName}`
                  : isFr
                  ? 'Glissez un fichier .csv ici ou cliquez pour parcourir'
                  : 'Drop a .csv file here or click to browse'}
              </div>
              <div className="text-[11px] text-ink-3 mt-1 font-mono">
                title, category, primary_platform, days_since_t0, velocity_7d_pct, creator_count_7d, view_sub_anomaly_x
              </div>
            </div>
          </div>

          {parseErrors.length > 0 && (
            <div className="p-3 rounded-[12px] bg-danger-soft border border-danger-line text-danger text-[12px] space-y-1">
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
                <span className="text-[12px] font-semibold text-ink flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
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

              <div className="rounded-[12px] border border-line overflow-hidden divide-y divide-line">
                {parsedPreview.map((item) => (
                  <div
                    key={item.id}
                    className="px-3.5 py-2.5 bg-surface flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-ink truncate">
                          {item.title}
                        </span>
                        <CategoryTag category={item.category} lang={lang} />
                      </div>
                      <div className="text-[11px] text-ink-2 truncate mt-0.5 font-mono">
                        {item.viralVideo.creator.handle} · {item.daysSinceT0}d · +{item.velocity7d}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <MaturityBadge maturity={item.maturity} compact lang={lang} />
                      <CertaintyBadge certainty={item.certainty} lang={lang} />
                      <span className="font-mono text-[13px] font-semibold text-ink w-8 text-right">
                        {item.emergenceScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 bg-soft border-t border-line flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-[13px] font-medium text-ink-2 hover:text-ink hover:bg-line transition-colors"
          >
            {isFr ? 'Annuler' : 'Cancel'}
          </button>
          <button
            type="button"
            disabled={parsedPreview.length === 0}
            onClick={handleConfirmImport}
            className="px-4 py-1.5 rounded-full text-[13px] font-semibold bg-pop hover:bg-pop-hover text-on-pop disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
