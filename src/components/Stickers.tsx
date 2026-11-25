import React from 'react';
import { ArrowUpRight, History, Radar } from 'lucide-react';
import { AppLang } from '../types';
import { UI_COPY } from '../i18n';

export const RadarEmblemIcon: React.FC<{ mode?: 'radar' | 'past' }> = ({
  mode = 'radar',
}) => {
  const Icon = mode === 'past' ? History : Radar;
  return (
    <div
      aria-hidden="true"
      className={`sticker w-12 h-12 rounded-2xl -rotate-6 hidden sm:flex items-center justify-center shrink-0 text-on-pop ${
        mode === 'past' ? 'bg-gold' : 'bg-pop'
      }`}
    >
      <Icon className="w-6 h-6" strokeWidth={2} />
    </div>
  );
};

export const SidebarGuideCard: React.FC<{
  onClick: () => void;
  lang: AppLang;
}> = ({ onClick, lang }) => {
  const c = UI_COPY[lang];
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-humanist w-full text-left rounded-2xl border bg-lilac text-on-pop -rotate-1 p-4 space-y-1.5"
    >
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface text-ink border-2 border-edge text-[11px] font-semibold">
        {c.promoBadge}
      </span>
      <div className="text-[16px] font-extrabold leading-tight pt-0.5">
        {c.promoTitle}
      </div>
      <p className="text-[12px] leading-snug">{c.promoSub}</p>
      <span className="inline-flex items-center gap-1 text-[12px] font-bold">
        <span>{c.promoCta}</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </span>
    </button>
  );
};
