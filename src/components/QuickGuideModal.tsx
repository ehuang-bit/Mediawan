import React from 'react';
import {
  CheckCircle2,
  HelpCircle,
  History,
  Layers,
  Repeat,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { AppLang } from '../types';
import { UI_COPY, tr } from '../i18n';

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLang;
}

export const QuickGuideModal: React.FC<QuickGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  const c = UI_COPY[lang];
  const isFr = lang === 'fr';

  const pillars = isFr
    ? [
        {
          title: 'Taux de remix audio / format',
          weight: '30 pts',
          icon: Repeat,
          desc: 'Vitesse de reprise du son, du concept visuel ou narratif dans les 7 premiers jours.',
        },
        {
          title: 'Passage inter-plateformes',
          weight: '25 pts',
          icon: Share2,
          desc: 'Diffusion rapide entre incubateurs (TikTok, Roblox, Reddit) et YouTube/IG/Google sous ≤21j.',
        },
        {
          title: 'Saves, partages & profondeur',
          weight: '25 pts',
          icon: Layers,
          desc: 'Enregistrements et analyses de lore — distingue une vraie IP d’un gag jetable.',
        },
        {
          title: 'Percée petits comptes',
          weight: '20 pts',
          icon: Sparkles,
          desc: 'Vues hors-norme sur comptes <50K abonnés (>8x la moyenne), preuve de poussée algorithmique.',
        },
      ]
    : [
        {
          title: 'Audio & Format Remix Rate',
          weight: '30 pts',
          icon: Repeat,
          desc: 'Speed at which creators copy the sound, visual hook, or premise in the first 7 days.',
        },
        {
          title: 'Cross-Platform Spillover',
          weight: '25 pts',
          icon: Share2,
          desc: 'Spread from incubators (TikTok, Roblox, Reddit) into YouTube/IG/Search within ≤21 days.',
        },
        {
          title: 'Saves, Shares & Lore Depth',
          weight: '25 pts',
          icon: Layers,
          desc: 'Bookmarks and lore breakdowns separating true IP from throwaway audio memes.',
        },
        {
          title: 'Small-Account Lift',
          weight: '20 pts',
          icon: Sparkles,
          desc: 'Outsized reach for <50K-follower accounts (>8x baseline), proving organic feed lift.',
        },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/35 dark:bg-black/60 backdrop-blur-[2px] animate-backdrop-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-guide-title"
        className="w-full max-w-[640px] rounded-[20px] bg-surface border border-line shadow-elevated overflow-hidden animate-modal-in"
      >
        <div className="px-6 py-4.5 border-b border-line flex items-center justify-between bg-soft">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent-soft border border-accent-line text-accent flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="quick-guide-title"
                className="font-display text-[16px] font-bold text-ink"
              >
                {c.guideTitle}
              </h2>
              <p className="text-[12px] text-ink-2">
                {c.guideSub}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr('Close quick guide', lang)}
            className="p-1.5 rounded-full text-ink-2 hover:text-ink hover:bg-line"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pillars.map(({ title, weight, icon: Icon, desc }) => (
              <div
                key={title}
                className="p-3.5 rounded-[14px] bg-soft border border-line space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                    <Icon className="w-3.5 h-3.5 text-accent" />
                    <span>{title}</span>
                  </div>
                  <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-soft text-accent">
                    {weight}
                  </span>
                </div>
                <p className="text-[11.5px] text-ink-2 leading-[1.45]">
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-[12px]">
            <div className="p-3 rounded-[12px] bg-warn-soft border border-warn-line text-ink">
              <strong className="text-warn">
                {isFr ? 'Étincelle (1–7 jours) :' : 'Early Spark (1–7 days):'}
              </strong>{' '}
              {isFr
                ? 'Démarrage viral récent — vérifier si d’autres créateurs reprennent le format.'
                : 'Fresh viral ignition — verify whether smaller accounts replicate it.'}
            </div>
            <div className="p-3 rounded-[12px] bg-accent-soft border border-accent-line text-ink">
              <strong className="text-accent">
                {isFr ? 'Zone d’éclosion (8–21 jours) :' : 'Breakout Zone (8–21 days):'}
              </strong>{' '}
              {isFr
                ? 'Fenêtre optimale 2–3 semaines — confirmée inter-apps avant saturation.'
                : 'Golden 2–3 week window — confirmed across apps before saturation.'}
            </div>
            <div className="p-3 rounded-[12px] bg-danger-soft border border-danger-line text-ink flex items-start gap-2">
              <History className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <div>
                <strong className="text-danger">
                  {isFr ? 'Tendances passées :' : 'Past Trends:'}
                </strong>{' '}
                {isFr
                  ? 'Archives FR & EN (Quoicoubeh, Skibidi Toilet, HUSS HUSS HUSS, Grimace Shake) pour ne plus arriver après la bataille.'
                  : 'Archived FR & EN youth waves (Quoicoubeh, Skibidi Toilet, HUSS HUSS HUSS, Grimace Shake).'}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-soft border-t border-line flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold bg-pop hover:bg-pop-hover text-on-pop transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{c.gotIt}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
