import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2, ArrowRight, Zap, Building2, CheckCircle2 } from 'lucide-react'

/* Pre-seed a default dev account on first load */
function seedDevAccount() {
  try {
    const accounts = JSON.parse(localStorage.getItem('aeo-dev-accounts') || '{}')
    if (!accounts['stefan.ninkov@gmail.com']) {
      accounts['stefan.ninkov@gmail.com'] = {
        uid: 'dev-stefan-001',
        password: 'test',
        displayName: 'Stefan Ninkov',
      }
      localStorage.setItem('aeo-dev-accounts', JSON.stringify(accounts))
    }
  } catch { /* ignore */ }
}
seedDevAccount()

export default function LoginPage({ onSignIn, onSignUp, onGoogleSignIn, onResetPassword, error, clearError }) {
  const { t } = useTranslation()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [agency, setAgency] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [forgotPassword, setForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const activeError = error || localError

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    clearError?.()

    if (!email.trim() || !password.trim()) {
      setLocalError(t('auth.fillAllFields'))
      return
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setLocalError(t('auth.passwordsMismatch'))
        return
      }
      if (password.length < 6) {
        setLocalError(t('auth.passwordMinLength'))
        return
      }
      if (!displayName.trim()) {
        setLocalError(t('auth.enterName'))
        return
      }
    }

    setLoading(true)
    try {
      if (mode === 'signin') {
        await onSignIn(email, password)
      } else {
        await onSignUp(email, password, displayName.trim(), agency.trim())
      }
    } catch {
      // Error handled by useAuth hook
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLocalError(null)
    clearError?.()
    setLoading(true)
    try {
      await onGoogleSignIn()
    } catch {
      // Error handled by useAuth
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setLocalError(null)
    clearError?.()
    setPassword('')
    setConfirmPassword('')
    setForgotPassword(false)
    setResetSent(false)
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!resetEmail.trim()) {
      setLocalError(t('auth.enterEmail'))
      return
    }
    setLocalError(null)
    clearError?.()
    setResetLoading(true)
    try {
      await onResetPassword(resetEmail.trim())
      setResetSent(true)
    } catch {
      // Error handled by useAuth hook
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-page)' }}>
      {/* Left Panel — Decorative */}
      <div className="hidden lg:flex lg:w-[30rem] xl:w-[35rem] relative overflow-hidden" style={{ background: 'linear-gradient(145deg, var(--bg-card) 0%, var(--bg-page) 100%)' }}>
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(var(--text-tertiary) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-[100px]" style={{ background: 'var(--color-phase-1)', opacity: 0.08 }} />
        <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full blur-[80px]" style={{ background: 'var(--color-phase-2)', opacity: 0.06 }} />
        <div className="absolute top-2/3 left-1/2 w-40 h-40 rounded-full blur-[60px]" style={{ background: 'var(--color-phase-3)', opacity: 0.05 }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-phase-1/10">
                <Zap size={20} className="text-phase-1" />
              </div>
              <h1 className="text-xl font-semibold text-text-primary font-heading tracking-tight">
                {t('sidebar.appName')}
              </h1>
            </div>
            <p className="text-sm mt-1 ml-[3.25rem] text-text-tertiary">
              {t('login.tagline')}
            </p>
          </div>

          <div className="space-y-8">
            <h2 className="text-3xl xl:text-[2.375rem] font-semibold text-text-primary font-heading leading-[1.15] tracking-tight">
              Optimize your website<br />
              for <span className="text-phase-1">AI search engines</span>
            </h2>

            <div className="space-y-4">
              {[
                { num: '01', text: t('login.feature1') },
                { num: '02', text: t('login.feature2') },
                { num: '03', text: t('login.feature3') },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-4">
                  <span className="font-mono text-[0.6875rem] font-bold shrink-0 mt-0.5 text-phase-1 opacity-70">{item.num}</span>
                  <p className="text-[0.8125rem] leading-relaxed text-text-secondary">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[0.6875rem] text-text-disabled">
            {t('login.version')}
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div
          className="w-full max-w-[25rem]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 500ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-phase-1/10">
                <Zap size={18} className="text-phase-1" />
              </div>
              <h1 className="font-heading text-xl font-semibold text-text-primary tracking-tight">
                {t('sidebar.appName')}
              </h1>
            </div>
            <p className="text-text-tertiary text-[0.8125rem]">
              {t('login.tagline')}
            </p>
          </div>

          {/* Forgot Password Flow */}
          {forgotPassword ? (
            <div>
              <div className="mb-7">
                <h2 className="font-heading text-[1.25rem] font-semibold tracking-tight text-text-primary">
                  {t('auth.resetYourPassword')}
                </h2>
                <p className="text-[0.8125rem] text-text-tertiary mt-1.5">
                  {t('auth.resetDescription')}
                </p>
              </div>

              {activeError && (
                <div
                  className="flex items-start gap-2.5 p-3.5 bg-error/8 border border-error/15 rounded-xl mb-5 text-[0.8125rem]"
                  style={{ animation: 'fade-in-up 200ms ease-out both' }}
                >
                  <AlertCircle size={15} className="text-error flex-shrink-0 mt-0.5" />
                  <span className="text-error">{activeError}</span>
                </div>
              )}

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                    <CheckCircle2 size={24} style={{ color: '#10B981' }} />
                  </div>
                  <p className="text-[0.9375rem] font-medium text-text-primary mb-2">{t('auth.checkYourEmail')}</p>
                  <p className="text-[0.8125rem] text-text-tertiary mb-6">
                    {t('auth.resetSentTo')} <strong className="text-text-secondary">{resetEmail}</strong>
                  </p>
                  <button
                    onClick={() => { setForgotPassword(false); setResetSent(false); setLocalError(null); clearError?.() }}
                    className="text-phase-1 text-[0.8125rem] font-medium hover:underline transition-all"
                  >
                    {t('auth.backToSignIn')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div>
                    <label className="text-[0.6875rem] font-medium text-text-tertiary mb-1.5 block">{t('auth.emailAddress')}</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
                      <input
                        type="email"
                        placeholder={t('auth.placeholderEmail')}
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg text-[0.8125rem] text-text-primary placeholder:text-text-disabled outline-none transition-all duration-200"
                        style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', boxShadow: 'none' }}
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-2.5 mt-2 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      t('actions.sendResetLink')
                    )}
                  </button>
                </form>
              )}

              {!resetSent && (
                <p className="text-center text-[0.8125rem] text-text-tertiary mt-6">
                  <button
                    onClick={() => { setForgotPassword(false); setLocalError(null); clearError?.() }}
                    className="text-phase-1 font-medium hover:underline transition-all"
                  >
                    {t('auth.backToSignIn')}
                  </button>
                </p>
              )}
            </div>
          ) : (
          <>
          {/* Welcome text */}
          <div className="mb-7">
            <h2 className="font-heading text-[1.25rem] font-semibold tracking-tight text-text-primary">
              {mode === 'signin' ? t('auth.welcomeBack') : t('auth.createYourAccount')}
            </h2>
            <p className="text-[0.8125rem] text-text-tertiary mt-1.5">
              {mode === 'signin'
                ? t('auth.signInContinue')
                : t('auth.getStarted')}
            </p>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-[0.8125rem] font-medium text-text-primary active:scale-[0.995] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-button)' }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.462.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {t('auth.continueWithGoogle')}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
            <span className="text-[0.6875rem] text-text-tertiary font-medium">{t('auth.orContinueWithEmail')}</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-subtle)' }} />
          </div>

          {/* Error */}
          {activeError && (
            <div
              className="flex items-start gap-2.5 p-3.5 bg-error/8 border border-error/15 rounded-xl mb-5 text-[0.8125rem]"
              style={{ animation: 'fade-in-up 200ms ease-out both' }}
            >
              <AlertCircle size={15} className="text-error flex-shrink-0 mt-0.5" />
              <span className="text-error">{activeError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="text-[0.6875rem] font-medium text-text-tertiary mb-1.5 block">{t('auth.fullName')}</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
                  <input
                    type="text"
                    placeholder={t('auth.placeholderName')}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-[0.8125rem] text-text-primary placeholder:text-text-disabled outline-none transition-all duration-200"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', boxShadow: 'none' }}
                    autoFocus={mode === 'signup'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[0.6875rem] font-medium text-text-tertiary mb-1.5 block">{t('auth.emailAddress')}</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
                <input
                  type="email"
                  placeholder={t('auth.placeholderEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg text-[0.8125rem] text-text-primary placeholder:text-text-disabled outline-none transition-all duration-200"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', boxShadow: 'none' }}
                  autoFocus={mode === 'signin'}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.6875rem] font-medium text-text-tertiary">{t('auth.password')}</label>
                {mode === 'signin' && onResetPassword && (
                  <button
                    type="button"
                    onClick={() => { setForgotPassword(true); setResetEmail(email); setResetSent(false); setLocalError(null); clearError?.() }}
                    className="text-[0.6875rem] text-text-disabled hover:text-phase-1 transition-colors"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('auth.placeholderPassword')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-lg text-[0.8125rem] text-text-primary placeholder:text-text-disabled outline-none transition-all duration-200"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', boxShadow: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-text-tertiary hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="text-[0.6875rem] font-medium text-text-tertiary mb-1.5 block">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.placeholderConfirmPassword')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-[0.8125rem] text-text-primary placeholder:text-text-disabled outline-none transition-all duration-200"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', boxShadow: 'none' }}
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="text-[0.6875rem] font-medium text-text-tertiary mb-1.5 block">{t('auth.agencyCompany')} <span className="text-text-disabled">({t('auth.optional')})</span></label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-disabled pointer-events-none" />
                  <input
                    type="text"
                    placeholder={t('auth.placeholderAgency')}
                    value={agency}
                    onChange={(e) => setAgency(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg text-[0.8125rem] text-text-primary placeholder:text-text-disabled outline-none transition-all duration-200"
                    style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', boxShadow: 'none' }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? t('auth.signIn') : t('auth.createAccount')}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-[0.8125rem] text-text-tertiary mt-6">
            {mode === 'signin' ? (
              <>
                {t('auth.dontHaveAccount')}{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-phase-1 font-medium hover:underline transition-all"
                >
                  {t('auth.signUp')}
                </button>
              </>
            ) : (
              <>
                {t('auth.alreadyHaveAccount')}{' '}
                <button
                  onClick={() => switchMode('signin')}
                  className="text-phase-1 font-medium hover:underline transition-all"
                >
                  {t('auth.signIn')}
                </button>
              </>
            )}
          </p>

          {/* Footer */}
          <p className="text-center text-[0.6875rem] text-text-disabled mt-8">
            {t('auth.termsNotice')}
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
