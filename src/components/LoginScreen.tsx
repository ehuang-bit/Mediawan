import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { AppLang } from '../types';

export interface AuthSession {
  email: string;
  displayName: string;
  initials: string;
  provider: 'gmail' | 'password';
}

const OWNER_GMAIL = 'ehuang@albertschool.com';

const ALLOWED_EMAILS = new Set([
  OWNER_GMAIL,
  'adedemandolx@albertschool.com',
  'ahenry@albertschool.com',
  'dcohen@albertschool.com',
]);

const ALLOWED_DOMAINS = ['gmail.com', 'albertschool.com', 'mediawan.com'];

function isAuthorizedEmail(raw: string): boolean {
  const normalized = raw.trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return false;
  }
  if (ALLOWED_EMAILS.has(normalized)) return true;
  const domain = normalized.split('@')[1] ?? '';
  return ALLOWED_DOMAINS.includes(domain);
}

function buildSession(email: string, provider: 'gmail' | 'password'): AuthSession {
  const clean = email.trim().toLowerCase();
  const local = clean.split('@')[0] || 'member';
  const parts = local.split(/[._-]+/).filter(Boolean);
  const displayName =
    clean === OWNER_GMAIL
      ? 'Evan Huang'
      : parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  const initials =
    clean === OWNER_GMAIL
      ? 'EH'
      : parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : local.slice(0, 2).toUpperCase();

  return { email: clean, displayName, initials, provider };
}

interface LoginScreenProps {
  lang: AppLang;
  onChangeLang: (lang: AppLang) => void;
  onAuthenticated: (session: AuthSession) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  lang,
  onChangeLang,
  onAuthenticated,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotHint, setForgotHint] = useState(false);

  const isFr = lang === 'fr';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!isAuthorizedEmail(trimmedEmail)) {
      setError(
        isFr
          ? 'Utilisez votre adresse Gmail (@gmail.com) ou Albert School / Mediawan.'
          : 'Please sign in with an authorized Gmail, Albert School, or Mediawan email.'
      );
      return;
    }
    if (password.trim().length < 4) {
      setError(
        isFr
          ? 'Saisissez un mot de passe (4 caractères minimum) ou utilisez l’accès Gmail.'
          : 'Enter a password (min. 4 characters) or use the Gmail sign-in button.'
      );
      return;
    }
    setError(null);
    onAuthenticated(buildSession(trimmedEmail, 'password'));
  };

  const handleGmailAccess = () => {
    const typed = email.trim().toLowerCase();
    const targetEmail =
      typed && isAuthorizedEmail(typed) ? typed : OWNER_GMAIL;
    setError(null);
    onAuthenticated(buildSession(targetEmail, 'gmail'));
  };

  return (
    <div
      className="min-h-dvh w-full bg-[#F7F1E1] dark:bg-canvas text-ink relative flex flex-col justify-center overflow-x-hidden px-4 py-12 sm:px-8"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(29, 29, 31, 0.075) 1px, transparent 1px), linear-gradient(to bottom, rgba(29, 29, 31, 0.075) 1px, transparent 1px)',
        backgroundSize: '36px 36px',
      }}
    >
      {/* Top-right FR | EN toggle pill */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-8 z-20">
        <div
          role="group"
          aria-label={isFr ? 'Langue' : 'Language'}
          className="inline-flex items-center px-1.5 py-1 rounded-full bg-surface border-2 border-edge shadow-[3px_3px_0_var(--mw-shadow)] text-[13px] font-bold"
        >
          <button
            type="button"
            onClick={() => onChangeLang('fr')}
            className={`px-2.5 py-0.5 rounded-full transition-colors ${
              lang === 'fr'
                ? 'text-ink font-extrabold'
                : 'text-ink-3 hover:text-ink font-semibold'
            }`}
          >
            FR
          </button>
          <span className="text-ink-3/60 select-none px-0.5">|</span>
          <button
            type="button"
            onClick={() => onChangeLang('en')}
            className={`px-2.5 py-0.5 rounded-full transition-colors ${
              lang === 'en'
                ? 'text-ink font-extrabold'
                : 'text-ink-3 hover:text-ink font-semibold'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main 2-column layout matching the Pop Stickers mockup */}
      <div className="w-full max-w-[1220px] mx-auto grid grid-cols-1 lg:grid-cols-[1.28fr_436px] gap-8 lg:gap-10 items-center">
        {/* Left: Pop Stickers Radar Illustration */}
        <div className="flex items-center justify-center">
          <svg
            viewBox="0 0 600 500"
            className="w-full max-w-[650px] h-auto select-none drop-shadow-none"
            role="img"
            aria-label="Mediawan Signal Radar illustration"
          >
            <defs>
              <radialGradient id="login-sphere-grad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#FFF7D6" />
                <stop offset="55%" stopColor="#CEBC6B" />
                <stop offset="100%" stopColor="#776A34" />
              </radialGradient>
            </defs>

            {/* Concentric broken olive-gold radar rings (centered at 304, 248) */}
            <g fill="none" strokeLinecap="butt">
              {/* Outer ring */}
              <path
                d="M 134 248 A 170 170 0 1 1 464 294"
                stroke="#1D1D1F"
                strokeWidth="23"
              />
              <path
                d="M 134 248 A 170 170 0 1 1 464 294"
                stroke="#D1C174"
                strokeWidth="15.5"
              />
              {/* Ring 2 */}
              <path
                d="M 430 244 A 126 126 0 1 1 280 120"
                stroke="#1D1D1F"
                strokeWidth="21"
              />
              <path
                d="M 430 244 A 126 126 0 1 1 280 120"
                stroke="#D1C174"
                strokeWidth="14"
              />
              {/* Ring 3 */}
              <path
                d="M 224 248 A 80 80 0 1 1 380 268"
                stroke="#1D1D1F"
                strokeWidth="19.5"
              />
              <path
                d="M 224 248 A 80 80 0 1 1 380 268"
                stroke="#D1C174"
                strokeWidth="13"
              />
              {/* Inner ring */}
              <circle
                cx="304"
                cy="248"
                r="42"
                stroke="#1D1D1F"
                strokeWidth="17.5"
              />
              <circle
                cx="304"
                cy="248"
                r="42"
                stroke="#D1C174"
                strokeWidth="11.5"
              />
            </g>

            {/* 3 Glossy Radar Spheres */}
            <circle
              cx="216"
              cy="160"
              r="23"
              fill="url(#login-sphere-grad)"
              stroke="#1D1D1F"
              strokeWidth="3.5"
            />
            <circle
              cx="304"
              cy="248"
              r="19"
              fill="url(#login-sphere-grad)"
              stroke="#1D1D1F"
              strokeWidth="3.5"
            />
            <circle
              cx="360"
              cy="222"
              r="15"
              fill="url(#login-sphere-grad)"
              stroke="#1D1D1F"
              strokeWidth="3.5"
            />

            {/* Floating Sticker: #1 (coral, clearly outside outer arc) */}
            <g transform="translate(64 114) rotate(-13)">
              <rect
                x="4"
                y="4"
                width="70"
                height="36"
                rx="18"
                fill="#1D1D1F"
              />
              <rect
                width="70"
                height="36"
                rx="18"
                fill="#FF6445"
                stroke="#1D1D1F"
                strokeWidth="3.2"
              />
              <text
                x="35"
                y="23"
                textAnchor="middle"
                fill="#1D1D1F"
                fontWeight="800"
                fontSize="15.5"
              >
                #1
              </text>
            </g>

            {/* Floating Sticker: +214% (lilac, clearly outside outer arc) */}
            <g transform="translate(114 54) rotate(-10)">
              <rect
                x="4"
                y="4"
                width="92"
                height="36"
                rx="18"
                fill="#1D1D1F"
              />
              <rect
                width="92"
                height="36"
                rx="18"
                fill="#A48AFF"
                stroke="#1D1D1F"
                strokeWidth="3.2"
              />
              <text
                x="46"
                y="23"
                textAnchor="middle"
                fill="#1D1D1F"
                fontWeight="800"
                fontSize="15.5"
              >
                +214%
              </text>
            </g>

            {/* Floating Sticker: RADAR (lilac, top right, clearly outside outer arc) */}
            <g transform="translate(422 44) rotate(-9)">
              <rect
                x="4"
                y="4"
                width="104"
                height="38"
                rx="19"
                fill="#1D1D1F"
              />
              <rect
                width="104"
                height="38"
                rx="19"
                fill="#A48AFF"
                stroke="#1D1D1F"
                strokeWidth="3.2"
              />
              <text
                x="52"
                y="24"
                textAnchor="middle"
                fill="#1D1D1F"
                fontWeight="800"
                fontSize="15.5"
                letterSpacing="0.04em"
              >
                RADAR
              </text>
            </g>

            {/* Floating Sticker: RADAR (coral, bottom left-center) */}
            <g transform="translate(212 436) rotate(-12)">
              <rect
                x="4"
                y="4"
                width="88"
                height="34"
                rx="17"
                fill="#1D1D1F"
              />
              <rect
                width="88"
                height="34"
                rx="17"
                fill="#FF6445"
                stroke="#1D1D1F"
                strokeWidth="3.2"
              />
              <text
                x="44"
                y="22"
                textAnchor="middle"
                fill="#1D1D1F"
                fontWeight="800"
                fontSize="14"
                letterSpacing="0.04em"
              >
                RADAR
              </text>
            </g>

            {/* 3D Tilted Coral Play Button Sticker */}
            <g transform="translate(366 102) rotate(10)">
              <rect
                x="7"
                y="8"
                width="106"
                height="86"
                rx="24"
                fill="#1D1D1F"
              />
              <rect
                width="106"
                height="86"
                rx="24"
                fill="#FF6445"
                stroke="#1D1D1F"
                strokeWidth="3.5"
              />
              <polygon
                points="42,24 42,62 76,43"
                fill="#FBF9F3"
                stroke="#1D1D1F"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
            </g>

            {/* Retro Lilac & Cream Camera (bottom-left) */}
            <g transform="translate(56 306) rotate(-14)">
              {/* Camera top flash/viewfinder bump */}
              <path
                d="M 48 10 L 58 -5 L 102 -5 L 112 10 Z"
                fill="#A48AFF"
                stroke="#1D1D1F"
                strokeWidth="3.5"
                strokeLinejoin="round"
              />
              {/* Shutter button */}
              <rect
                x="16"
                y="1"
                width="22"
                height="11"
                rx="4.5"
                fill="#FF6445"
                stroke="#1D1D1F"
                strokeWidth="3.2"
              />
              {/* Body shadow */}
              <rect
                x="7"
                y="17"
                width="150"
                height="102"
                rx="20"
                fill="#1D1D1F"
              />
              {/* Main body */}
              <rect
                x="0"
                y="10"
                width="150"
                height="102"
                rx="20"
                fill="#FBF9F3"
                stroke="#1D1D1F"
                strokeWidth="3.5"
              />
              {/* Left lilac grip strip */}
              <path
                d="M 20 10 H 42 V 112 H 20 A 20 20 0 0 1 0 92 V 30 A 20 20 0 0 1 20 10 Z"
                fill="#A48AFF"
                stroke="#1D1D1F"
                strokeWidth="3.5"
              />
              {/* Flash window */}
              <rect
                x="116"
                y="24"
                width="20"
                height="15"
                rx="4"
                fill="#FBF9F3"
                stroke="#1D1D1F"
                strokeWidth="3"
              />
              {/* Lens barrel with 3D offset */}
              <circle
                cx="84"
                cy="64"
                r="37"
                fill="#FFFFFF"
                stroke="#1D1D1F"
                strokeWidth="3.5"
              />
              <circle
                cx="90"
                cy="64"
                r="26"
                fill="#A48AFF"
                stroke="#1D1D1F"
                strokeWidth="3.5"
              />
              <circle
                cx="90"
                cy="64"
                r="14"
                fill="#7C5CE6"
                stroke="#1D1D1F"
                strokeWidth="3.2"
              />
              <circle cx="84" cy="57" r="4.5" fill="#FFFFFF" />
            </g>

            {/* Cinema Clapperboard (bottom-right) */}
            <g transform="translate(366 322) rotate(13)">
              {/* Hinged top clapper arm */}
              <g transform="translate(0 0) rotate(-22)">
                <rect
                  x="0"
                  y="-26"
                  width="138"
                  height="26"
                  rx="4"
                  fill="#1D1D1F"
                  stroke="#1D1D1F"
                  strokeWidth="3"
                />
                <polygon points="18,-26 36,-26 25,0 7,0" fill="#FBF9F3" />
                <polygon points="52,-26 70,-26 59,0 41,0" fill="#FBF9F3" />
                <polygon points="86,-26 104,-26 93,0 75,0" fill="#FBF9F3" />
                <polygon points="118,-26 135,-26 125,0 109,0" fill="#FBF9F3" />
              </g>
              {/* Clapperboard slate base */}
              <rect
                x="6"
                y="6"
                width="138"
                height="102"
                rx="9"
                fill="#1D1D1F"
              />
              <rect
                x="0"
                y="0"
                width="138"
                height="102"
                rx="9"
                fill="#222225"
                stroke="#1D1D1F"
                strokeWidth="3.5"
              />
              {/* Bottom stripe bar */}
              <rect
                x="0"
                y="0"
                width="138"
                height="22"
                rx="4"
                fill="#1D1D1F"
                stroke="#1D1D1F"
                strokeWidth="3"
              />
              <polygon points="14,0 32,0 41,22 23,22" fill="#FBF9F3" />
              <polygon points="48,0 66,0 75,22 57,22" fill="#FBF9F3" />
              <polygon points="82,0 100,0 109,22 91,22" fill="#FBF9F3" />
              <polygon points="114,0 130,0 136,22 121,22" fill="#FBF9F3" />
              {/* Chalk slate lines */}
              <line x1="16" y1="45" x2="122" y2="45" stroke="#FBF9F3" strokeWidth="2.6" strokeOpacity="0.82" />
              <line x1="16" y1="70" x2="122" y2="70" stroke="#FBF9F3" strokeWidth="2.6" strokeOpacity="0.82" />
              <line x1="62" y1="70" x2="62" y2="93" stroke="#FBF9F3" strokeWidth="2.6" strokeOpacity="0.82" />
            </g>

            {/* Sparkles & Dots */}
            <path
              d="M 380 34 Q 383 47 395 50 Q 383 53 380 66 Q 377 53 365 50 Q 377 47 380 34 Z"
              fill="#D1C174"
              stroke="#1D1D1F"
              strokeWidth="2.3"
            />
            <path
              d="M 516 198 Q 519 210 531 213 Q 519 216 516 228 Q 513 216 501 213 Q 513 210 516 198 Z"
              fill="#FF6445"
              stroke="#1D1D1F"
              strokeWidth="2.3"
            />
            <path
              d="M 76 244 Q 79 257 91 260 Q 79 263 76 276 Q 73 263 61 260 Q 73 257 76 244 Z"
              fill="#A48AFF"
              stroke="#1D1D1F"
              strokeWidth="2.3"
            />
            <circle cx="240" cy="44" r="5" fill="#FF6445" stroke="#1D1D1F" strokeWidth="2.2" />
            <circle cx="524" cy="156" r="5" fill="#D1C174" stroke="#1D1D1F" strokeWidth="2.2" />
            <circle cx="332" cy="442" r="5.5" fill="#D1C174" stroke="#1D1D1F" strokeWidth="2.2" />
            <circle cx="192" cy="444" r="4" fill="#A48AFF" stroke="#1D1D1F" strokeWidth="2.2" />
          </svg>
        </div>

        {/* Right: Login Sticker Card */}
        <section
          aria-labelledby="login-heading"
          className="w-full max-w-[430px] mx-auto rounded-[28px] bg-surface border-[2.5px] border-edge shadow-[7px_7px_0_var(--mw-shadow)] p-7 sm:p-9 space-y-5"
        >
          {/* Header badge row */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div
                aria-hidden="true"
                className="w-10 h-10 rounded-[12px] bg-[#FF6445] border-2 border-edge shadow-[2px_2px_0_var(--mw-shadow)] flex items-center justify-center shrink-0"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8.5" stroke="#1D1D1F" strokeWidth="2" strokeDasharray="16 5" />
                  <circle cx="12" cy="12" r="5" stroke="#1D1D1F" strokeWidth="2" />
                  <circle cx="12" cy="12" r="2" fill="#1D1D1F" />
                </svg>
              </div>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#A48AFF] text-on-pop border-2 border-edge font-display text-[13px] font-extrabold tracking-[0.06em]">
                MEDIAWAN
              </span>
            </div>

            <h1
              id="login-heading"
              className="font-display text-[36px] sm:text-[40px] font-extrabold text-ink leading-[1.05] tracking-tight"
            >
              Signal Radar<span className="text-[#FF6445]">*</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-[14px] font-bold text-ink"
              >
                {isFr ? 'Adresse e-mail' : 'Email address'}
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={
                    isFr
                      ? 'Saisir votre adresse e-mail'
                      : 'Enter your email address'
                  }
                  className="w-full h-[48px] pl-5 pr-11 rounded-full bg-surface border-2 border-edge shadow-[0_3px_0_var(--mw-shadow)] text-[14px] text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-pop/40 transition-shadow"
                />
                <Mail className="w-4 h-4 text-ink-2 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="block text-[14px] font-bold text-ink"
              >
                {isFr ? 'Mot de passe' : 'Password'}
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••••"
                  className="w-full h-[48px] pl-5 pr-11 rounded-full bg-surface border-2 border-edge shadow-[0_3px_0_var(--mw-shadow)] text-[14px] text-ink placeholder:text-ink-2 focus:outline-none focus:ring-2 focus:ring-pop/40 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={
                    showPassword
                      ? isFr
                        ? 'Masquer le mot de passe'
                        : 'Hide password'
                      : isFr
                      ? 'Afficher le mot de passe'
                      : 'Show password'
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-ink-3 hover:text-ink transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={() => setForgotHint((h) => !h)}
                  className="text-[12.5px] font-medium text-ink underline underline-offset-2 hover:text-pop transition-colors"
                >
                  {isFr ? 'Mot de passe oublié ?' : 'Forgot password?'}
                </button>
              </div>
            </div>

            {forgotHint && (
              <div className="px-3.5 py-2.5 rounded-2xl bg-soft border border-line text-[12px] text-ink-2 leading-snug">
                {isFr
                  ? `Accès équipe actif : connectez-vous en un clic avec votre compte Gmail (${OWNER_GMAIL}) ci-dessous ou saisissez votre e-mail @albertschool.com / @gmail.com.`
                  : `Team access enabled: sign in in one click with your Gmail account (${OWNER_GMAIL}) below or enter your @albertschool.com / @gmail.com email.`}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 px-3.5 py-2.5 rounded-2xl bg-danger-soft border border-danger-line text-danger text-[12.5px] font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full h-[50px] rounded-full bg-[#FF6445] hover:bg-[#FF4F2B] text-on-pop font-display text-[16px] font-extrabold border-2 border-edge shadow-[0_3px_0_var(--mw-shadow)] active:translate-y-[2px] active:shadow-[0_1px_0_var(--mw-shadow)] transition-all cursor-pointer"
            >
              {isFr ? 'Se connecter' : 'Sign in'}
            </button>
          </form>

          {/* Divider + Gmail quick access */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3 text-[11.5px] font-semibold text-ink-3">
              <span className="h-[1px] flex-1 bg-line" />
              <span>{isFr ? 'ou accès Gmail autorisé' : 'or authorized Gmail access'}</span>
              <span className="h-[1px] flex-1 bg-line" />
            </div>

            <button
              type="button"
              onClick={handleGmailAccess}
              className="w-full h-[46px] px-4 rounded-full bg-soft hover:bg-canvas text-ink border-2 border-edge shadow-[0_3px_0_var(--mw-shadow)] active:translate-y-[2px] active:shadow-[0_1px_0_var(--mw-shadow)] inline-flex items-center justify-center gap-2.5 text-[13.5px] font-bold transition-all cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#EA4335"
                  d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.2 14.7 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12S6.6 21.8 12 21.8c6.9 0 9.6-4.8 9.6-7.3 0-.5-.1-.9-.1-1.3H12z"
                />
                <path
                  fill="#34A853"
                  d="M3.3 15.8l3.2-2.5c.9 2.6 3.1 4.5 5.5 4.5 1.9 0 3.4-.7 4.4-1.7l2.9 2.3C17.5 20.1 15 21.8 12 21.8c-4 0-7.4-2.4-8.7-6z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.3 8.2C2.6 9.3 2.2 10.6 2.2 12s.4 2.7 1.1 3.8l3.2-2.5c-.2-.4-.3-.9-.3-1.3s.1-.9.3-1.3L3.3 8.2z"
                />
                <path
                  fill="#4285F4"
                  d="M21.5 13.2H12v-3h9.5c.1.4.2.9.2 1.5 0 2.1-.7 4.4-2.4 6l-2.9-2.3c.8-.6 1.4-1.5 1.7-2.2z"
                />
              </svg>
              <span className="truncate">
                {isFr ? 'Continuer avec Gmail' : 'Continue with Gmail'}
              </span>
              <span className="hidden sm:inline font-normal text-[11.5px] text-ink-2 truncate max-w-[165px]">
                ({OWNER_GMAIL})
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
