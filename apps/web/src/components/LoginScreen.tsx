import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Dumbbell,
  ExternalLink,
  Globe,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sun,
  UserPlus,
  X,
} from 'lucide-react';
import type { ThemeMode } from '@rune-pt/core';
import {
  isIosDevice,
  isKakaoTalkInApp,
  openExternalFromKakao,
} from '../utils/kakaoRedirect';
import { BrandLogo } from './BrandLogo';

export interface LoginScreenProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLoginDemo: (role: 'member' | 'trainer') => void;
  onStartOnboarding: () => void;
}

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cyan)]';

/**
 * 룬PT 로그인 및 데모/온보딩 진입 화면.
 */
export function LoginScreen({
  theme,
  onToggleTheme,
  onLoginDemo,
  onStartOnboarding,
}: LoginScreenProps) {
  const [showKakaoNotice, setShowKakaoNotice] = useState<boolean>(() =>
    isKakaoTalkInApp(),
  );
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);

  const handleOAuthClick = (provider: '카카오' | 'Google') => {
    setOauthNotice(
      `${provider} OAuth는 배포된 고정 APP_URL 환경에서 연결돼요. 지금은 아래 체험 버튼으로 바로 둘러보실 수 있어요.`,
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <BrandLogo variant="header" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowKakaoNotice((prev) => !prev)}
            className={`min-h-[40px] px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elev)] text-xs font-medium text-[var(--ink-secondary)] flex items-center gap-1.5 transition-colors ${FOCUS_RING}`}
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{showKakaoNotice ? '인앱 안내 닫기' : '카카오 인앱 안내 미리보기'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className={`min-h-[44px] min-w-[44px] px-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-elev)] text-[var(--ink)] flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors ${FOCUS_RING}`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[var(--gold)]" aria-hidden="true" />
                <span className="hidden sm:inline">라이트</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[var(--cyan)]" aria-hidden="true" />
                <span className="hidden sm:inline">다크</span>
              </>
            )}
          </button>
        </div>
      </header>

      {showKakaoNotice && (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pb-2">
          <div
            role="region"
            aria-label="카카오톡 인앱 브라우저 안내"
            className="surface-card px-4 py-3 border-[var(--cyan)]/40 bg-[var(--cyan-soft)] flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-2.5 text-sm">
              <AlertTriangle
                className="w-4 h-4 text-[var(--cyan)] shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="space-y-0.5">
                <p className="font-semibold text-[var(--ink)]">
                  카카오톡 인앱 브라우저에서는 외부 브라우저로 열어 주세요
                </p>
                <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                  카카오톡 내부 웹뷰에서는 Google·카카오 OAuth 세션이 끊길 수 있어요. 아래
                  버튼이나 메뉴의{' '}
                  <strong className="text-[var(--ink)]">
                    다른 브라우저로 열기 (Safari / Chrome)
                  </strong>
                  로 이동해 주세요.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => openExternalFromKakao()}
                className={`min-h-[40px] px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer ${FOCUS_RING}`}
                style={{
                  backgroundColor: 'var(--cyan)',
                  color: 'var(--bg)',
                }}
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{isIosDevice() ? 'Safari로 열기' : 'Chrome으로 열기'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowKakaoNotice(false)}
                aria-label="카카오톡 인앱 브라우저 안내 닫기"
                className={`min-h-[40px] min-w-[40px] rounded-lg flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--surface)] transition-colors shrink-0 ${FOCUS_RING}`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          <section className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-[var(--ink)]">
                세트 기록이 티어가 되고,
                <br />
                근육과 성장 곡선이 한눈에 보여요.
              </h1>
              <p className="text-sm sm:text-base text-[var(--ink-secondary)] leading-relaxed max-w-xl">
                룬PT는 체격 보정 기반 RPG 티어 시스템과 트레이너{' '}
                <span className="mono-num">1:1</span> 코칭, 그리고 부위별 3D 해부 시각화를 하나로
                묶은 근력 트레이닝 워크스페이스예요.
              </p>
            </div>

            <ul className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              <li className="py-3 flex items-start gap-3">
                <Award className="w-4 h-4 text-[var(--gold)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-[var(--ink)]">
                    체격 보정 <span className="mono-num">10</span>티어 · <span className="mono-num">5</span>성 계측
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                    나이(<span className="mono-num">8</span>~<span className="mono-num">90</span>세), 키, 체중을 반영해 아이언부터 챌린저까지 공정하게 기록해요.
                  </p>
                </div>
              </li>

              <li className="py-3 flex items-start gap-3">
                <Dumbbell className="w-4 h-4 text-[var(--cyan)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-[var(--ink)]">
                    한 손 세트 기록 &amp; <span className="mono-num">3D</span> 해부 확인
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                    직전 중량·횟수 참고와 함께 주동근·보조근을 <span className="mono-num">3D</span>로 바로 확인하며 기록해요.
                  </p>
                </div>
              </li>

              <li className="py-3 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[var(--ok)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-[var(--ink)]">
                    담당 트레이너 승급 &amp; 선물함 코칭
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">
                    코치가 승급 퀘스트를 승인하고 맞춤 루틴과 코멘트를 선물함으로 보내드려요.
                  </p>
                </div>
              </li>
            </ul>
          </section>

          <section className="lg:col-span-6">
            <div className="surface-card border-[var(--border-strong)] p-6 sm:p-8 shadow-sm max-w-md mx-auto lg:ml-auto lg:mr-0 space-y-6">
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--ink)]">
                  룬PT 로그인
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  카카오 또는 Google 계정으로 간편하게 시작할 수 있어요.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleOAuthClick('카카오')}
                  className={`w-full min-h-[46px] px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-95 cursor-pointer bg-[#FEE500] text-[#191919] ${FOCUS_RING}`}
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>카카오로 계속하기</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthClick('Google')}
                  className={`w-full min-h-[46px] px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border border-[var(--border-strong)] bg-[var(--surface-elev)] hover:bg-[var(--bg-subtle)] text-[var(--ink)] transition-colors cursor-pointer ${FOCUS_RING}`}
                >
                  <Globe className="w-4 h-4 text-[var(--cyan)]" aria-hidden="true" />
                  <span>Google로 계속하기</span>
                </button>
              </div>

              {oauthNotice && (
                <div
                  role="status"
                  className="rounded-lg border border-[var(--cyan)]/35 bg-[var(--cyan-soft)] px-3.5 py-2.5 text-xs text-[var(--ink-secondary)] leading-relaxed"
                >
                  {oauthNotice}
                </div>
              )}

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-[var(--border)]" />
                <span className="shrink-0 mx-3 text-xs font-medium text-[var(--muted)]">
                  또는 데모로 바로 체험
                </span>
                <div className="flex-grow border-t border-[var(--border)]" />
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => onLoginDemo('member')}
                  className={`w-full min-h-[44px] px-4 rounded-xl font-bold text-sm flex items-center justify-between bg-[var(--cyan)] text-[#071020] hover:opacity-95 transition-opacity cursor-pointer ${FOCUS_RING}`}
                >
                  <span className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" aria-hidden="true" />
                    <span>회원 데모로 시작</span>
                  </span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onLoginDemo('trainer')}
                    className={`min-h-[44px] px-3.5 rounded-xl font-semibold text-xs border border-[var(--border)] bg-[var(--surface-elev)] hover:border-[var(--border-strong)] text-[var(--ink)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${FOCUS_RING}`}
                  >
                    <ShieldCheck className="w-4 h-4 text-[var(--gold)]" aria-hidden="true" />
                    <span>트레이너 콘솔 보기</span>
                  </button>

                  <button
                    type="button"
                    onClick={onStartOnboarding}
                    className={`min-h-[44px] px-3.5 rounded-xl font-semibold text-xs border border-[var(--border)] bg-[var(--surface-elev)] hover:border-[var(--border-strong)] text-[var(--ink)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${FOCUS_RING}`}
                  >
                    <UserPlus className="w-4 h-4 text-[var(--cyan)]" aria-hidden="true" />
                    <span className="whitespace-nowrap">
                      <span className="mono-num">6</span>단계 온보딩 체험
                    </span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[var(--muted)] leading-relaxed text-center pt-1">
                체격·부상 메모는 기기 내 로컬 상태 및 인증된 계정에만 저장되며, 3D 뷰어로 개인
                식별 정보를 전송하지 않아요.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
