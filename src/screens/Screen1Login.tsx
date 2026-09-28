import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus
} from 'lucide-react';
import React, { useState } from 'react';
import dairyCowHeroImg from '../assets/images/beautiful_dairy_cows_1790002222392.jpg';
import { FARMER_PROFILE, TRANSLATIONS } from '../data/mockData';
import { LanguageCode } from '../types';

interface Screen1LoginProps {
  currentLang: LanguageCode;
  onSelectLang?: (lang: LanguageCode) => void;
  onLoginSuccess: (farmerName?: string, isNewAccount?: boolean) => void;
  onShowSnackbar?: (msg: string) => void;
}

export const Screen1Login: React.FC<Screen1LoginProps> = ({
  currentLang,
  onLoginSuccess,
  onShowSnackbar,
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  // Navigation between Login and Sign-Up
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [mobileNumber, setMobileNumber] = useState('9443287610');
  const [loginPassword, setLoginPassword] = useState('dairy@2026');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [agreeTermsLogin, setAgreeTermsLogin] = useState(true);
  const [useOtpLogin, setUseOtpLogin] = useState(false);
  const [otp, setOtp] = useState('8492');
  const [otpSent, setOtpSent] = useState(false);

  // Sign Up form state
  const [signUpData, setSignUpData] = useState({
    farmerName: FARMER_PROFILE.name || 'Murugan Natarajan',
    phoneNumber: '9443287610',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTermsSignup, setAgreeTermsSignup] = useState(true);

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpSent(true);
    setOtp('8492');
    if (onShowSnackbar) {
      onShowSnackbar('OTP sent to +91 ' + mobileNumber + '. Code: 8492');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTermsLogin) {
      if (onShowSnackbar) onShowSnackbar('Please agree to terms & conditions');
      return;
    }
    if (!mobileNumber.trim()) {
      if (onShowSnackbar) onShowSnackbar('Please enter mobile number');
      return;
    }
    if (useOtpLogin) {
      if (!otpSent) {
        handleSendOtp();
        return;
      }
      if (otp.length < 4) {
        if (onShowSnackbar) onShowSnackbar('Please enter the 4-digit OTP code');
        return;
      }
    } else {
      if (!loginPassword) {
        if (onShowSnackbar) onShowSnackbar('Please enter your password');
        return;
      }
    }
    // Existing farmer login directly opens the Dashboard without repeating farm setup
    onLoginSuccess(FARMER_PROFILE.name || 'Murugan Natarajan', false);
  };

  const handleForgotPassword = () => {
    if (onShowSnackbar) {
      onShowSnackbar('Password reset code sent via SMS to +91 ' + mobileNumber);
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTermsSignup) {
      if (onShowSnackbar) onShowSnackbar('Please agree to terms & conditions');
      return;
    }
    if (!signUpData.farmerName.trim()) {
      if (onShowSnackbar) onShowSnackbar('Please enter farmer name');
      return;
    }
    if (!signUpData.phoneNumber.trim()) {
      if (onShowSnackbar) onShowSnackbar('Please enter phone number');
      return;
    }
    if (!signUpData.password) {
      if (onShowSnackbar) onShowSnackbar('Please set a password');
      return;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      if (onShowSnackbar) onShowSnackbar('Passwords do not match');
      return;
    }
    if (onShowSnackbar) {
      onShowSnackbar(`Welcome ${signUpData.farmerName}! Opening 1-time Farm Setup...`);
    }
    // New account creation triggers the 1-time setup wizard
    onLoginSuccess(signUpData.farmerName, true);
  };

  return (
    <div id="screen-1-auth" className="w-full max-w-xl mx-auto flex flex-col justify-between py-4 px-2 sm:px-4 relative">
      {/* Subtle clean rural morning background atmosphere blending with light blue/white UI */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden rounded-3xl opacity-60">
        <div className="absolute -top-12 -left-12 w-80 h-80 bg-sky-100/50 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-12 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-teal-50/60 rounded-full blur-3xl" />
      </div>

      {/* Screen Hero Banner (AAROGYA logo handled exclusively by Top Module) */}
      <div className="mb-4">
        {/* Wide rounded hero image/card with rich, beautiful dairy cow visual */}
        <div className="relative rounded-3xl border border-emerald-900/15 shadow-md overflow-hidden min-h-[175px] sm:min-h-[195px] flex items-end sm:items-center">
          {/* Realistic wide dairy farm background visual */}
          <img
            src={dairyCowHeroImg}
            alt="Healthy Indian dairy cows in clean green farm pasture"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-[center_40%]"
          />

          {/* Balanced cinematic darkening gradient so the cows stay rich and colorful while text is crisp */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent sm:bg-gradient-to-r sm:from-slate-950/85 sm:via-slate-950/50 sm:to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 p-4 sm:p-5 sm:max-w-[65%] text-white">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/25 backdrop-blur-md text-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 border border-emerald-400/30 shadow-xs">
              <Sparkles className="w-3 h-3 text-emerald-300" />
              <span>{t.smartCattleCare || 'Smart Cattle Udder Care'}</span>
            </div>
            <h2 className="text-base sm:text-lg font-display font-extrabold text-white leading-snug drop-shadow-xs">
              {t.heroHeading || 'Protect your cattle herd from mastitis & milk loss'}
            </h2>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed font-sans font-medium drop-shadow-xs">
              {t.heroTagline || 'Early somatic cell alert, daily milking hygiene & instant veterinary van dispatch.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Authentication Card */}
      <main className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm">
        {/* Toggle between Login and Sign-Up */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
          <button
            id="tab-login-toggle"
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{t.farmerLogin || 'Farmer Login'}</span>
          </button>
          <button
            id="tab-signup-toggle"
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'signup'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{t.signUpRegister || 'Sign Up / Register'}</span>
          </button>
        </div>

        {/* ---------------- LOGIN PAGE ---------------- */}
        {authMode === 'login' ? (
          <div id="login-form-container">
            <div className="mb-4">
              <h3 className="text-xl font-display font-extrabold text-slate-900">
                {t.loginTitle || 'Login'}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {t.dontHaveAccount || "Don't have an account?"}{' '}
                <button
                  id="go-to-signup-header-link"
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-emerald-800 font-bold hover:underline cursor-pointer ml-0.5"
                >
                  {t.signUpLink || 'sign up'}
                </button>
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Phone Input: +91 */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono font-bold text-sm">
                    <span>+91</span>
                    <span className="text-slate-300 ml-2 font-normal">|</span>
                  </div>
                  <input
                    id="login-phone-input"
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="94432 87610"
                    className="w-full pl-16 pr-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Password Input: [Lock] PASSWORD */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                  <input
                    id="login-password-input"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="PASSWORD"
                    className="w-full pl-10 pr-10 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-mono placeholder:tracking-wider placeholder:text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* forgot password? link */}
                <div className="flex justify-end mt-1.5">
                  <button
                    id="login-forgot-password-link"
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-emerald-800 font-semibold hover:text-emerald-950 hover:underline cursor-pointer"
                  >
                    {t.forgotPassword || 'forgot password?'}
                  </button>
                </div>
              </div>

              {/* LOGIN Button */}
              <button
                id="login-submit-button"
                type="submit"
                className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white text-sm font-display font-extrabold tracking-wide rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>{t.loginButton || 'LOGIN'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-center text-slate-500 font-medium">
                ⚡ Direct login to Dashboard · Setup is only needed once when creating an account
              </p>

              {/* Checkbox: [ ] agree to terms & conditions */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    id="login-agree-terms-checkbox"
                    type="checkbox"
                    checked={agreeTermsLogin}
                    onChange={(e) => setAgreeTermsLogin(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 accent-emerald-800 cursor-pointer"
                  />
                  <span className="font-medium">{t.agreeTerms || 'agree to terms & conditions'}</span>
                </label>
              </div>
            </form>

            {/* Quick OTP option */}
            <div className="relative my-4 pt-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="px-2 bg-white text-slate-400 font-semibold uppercase tracking-wider">
                  OR FAST ACCESS
                </span>
              </div>
            </div>

            <button
              id="login-otp-toggle-button"
              type="button"
              onClick={() => {
                setUseOtpLogin(!useOtpLogin);
                if (!otpSent) handleSendOtp();
              }}
              className="w-full py-2.5 px-3 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer font-sans"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t.orUseOtp || 'Instant OTP Login'}</span>
            </button>
          </div>
        ) : (
          /* ---------------- SIGN-UP PAGE ---------------- */
          <div id="signup-form-container">
            <div className="mb-4">
              <h3 className="text-xl font-display font-extrabold text-slate-900">
                {t.signUpTitle || 'Create Account'}
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                {t.heroTagline || 'Create your AAROGYA dairy cattle health account'}
              </p>
            </div>

            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {/* Name */}
              <div>
                <label htmlFor="signup-farmer-name" className="block text-xs font-bold text-slate-700 mb-1">
                  {t.fullName || 'Name'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-farmer-name"
                    type="text"
                    required
                    value={signUpData.farmerName}
                    onChange={(e) => setSignUpData({ ...signUpData, farmerName: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="signup-phone-number" className="block text-xs font-bold text-slate-700 mb-1">
                  phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono font-bold text-xs">
                    <span>+91</span>
                    <span className="text-slate-300 ml-1.5 font-normal">|</span>
                  </div>
                  <input
                    id="signup-phone-number"
                    type="tel"
                    required
                    value={signUpData.phoneNumber}
                    onChange={(e) => setSignUpData({ ...signUpData, phoneNumber: e.target.value })}
                    placeholder="94432 87610"
                    className="w-full pl-14 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Set Password */}
              <div>
                <label htmlFor="signup-password" className="block text-xs font-bold text-slate-700 mb-1">
                  set password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="signup-confirm-password" className="block text-xs font-bold text-slate-700 mb-1">
                  confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-700 font-mono text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Sign up Button */}
              <button
                id="signup-submit-button"
                type="submit"
                className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white text-sm font-display font-extrabold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer font-sans mt-2"
              >
                <span>{t.signUpButton || 'CREATE ACCOUNT'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Already have an account? Login */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-600 font-medium">
                  {t.alreadyHaveAccount || 'Already have an account?'}{' '}
                  <button
                    id="go-to-login-btn"
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-emerald-800 font-bold hover:underline cursor-pointer ml-1"
                  >
                    {t.loginLink || 'Login'}
                  </button>
                </p>
              </div>

              {/* Checkbox: [ ] agree to terms & condt. */}
              <div className="pt-1 flex justify-center">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                  <input
                    id="signup-agree-terms-checkbox"
                    type="checkbox"
                    checked={agreeTermsSignup}
                    onChange={(e) => setAgreeTermsSignup(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 accent-emerald-800 cursor-pointer"
                  />
                  <span className="font-medium">{t.agreeTerms || 'agree to terms & condt.'}</span>
                </label>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer Branding Info */}
      <footer className="py-3 text-center text-[11px] text-slate-500 font-medium">
        <p className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>AAROGYA Native Mobile · Official Dairy Farmer Edition</span>
        </p>
      </footer>
    </div>
  );
};

