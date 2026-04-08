import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Map,
  Hash,
  Globe2,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ProfilePageSkeleton } from '../components/Skeleton';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, loading } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [line1, setLine1] = useState(user?.address?.line1 || '');
  const [line2, setLine2] = useState(user?.address?.line2 || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');
  const [country, setCountry] = useState(user?.address?.country || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);

  const steps = ['Basic info', 'Address', 'Security'];
  const progress = ((step + 1) / steps.length) * 100;

  const validate = () => {
    const nextName = name.trim();
    if (!nextName) return 'Name cannot be empty';
    if (phone && phone.trim().length < 7) return 'Enter a valid phone number';
    if (password || confirmPassword) {
      if (!password) return 'Enter a new password';
      if (password.length < 6) return 'Password must be at least 6 characters';
      if (password !== confirmPassword) return 'Passwords do not match';
    }
    return '';
  };

  const stepError = useMemo(() => {
    if (step === 0) {
      if (!name.trim()) return 'Name is required.';
      if (phone && phone.trim().length < 7) return 'Enter a valid phone number.';
      return '';
    }
    if (step === 2 && (password || confirmPassword)) {
      if (!password) return 'Enter a new password.';
      if (password.length < 6) return 'Password must be at least 6 characters.';
      if (password !== confirmPassword) return 'Passwords do not match.';
    }
    return '';
  }, [step, name, phone, password, confirmPassword]);

  const passwordStrength = useMemo(() => {
    if (!password) return { label: 'No password set', score: 0 };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    if (score <= 1) return { label: 'Weak', score: 1 };
    if (score <= 3) return { label: 'Medium', score: 2 };
    return { label: 'Strong', score: 3 };
  }, [password]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setSaving(true);
    setError('');
    try {
      await updateProfile({
        name: name.trim(),
        password: password || undefined,
        phone: phone.trim(),
        address: {
          line1: line1.trim(),
          line2: line2.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    if (stepError) {
      setError(stepError);
      return;
    }
    setError('');
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const goBack = () => {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <section className="mx-auto w-full max-w-[78rem] px-2 sm:px-3 md:px-4" aria-label="Profile setup">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.25),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(168,85,247,0.2),transparent_35%),radial-gradient(circle_at_60%_90%,rgba(249,115,22,0.2),transparent_38%)]" />

        <div className="relative grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:p-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs tracking-[0.16em] text-stone-200">
              <Sparkles className="h-3.5 w-3.5 text-orange-300" />
              ONBOARDING
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Complete your profile</h2>
            <p className="mt-2 text-sm leading-6 text-stone-300">
              Set up your account in a few steps. This helps personalize your dashboard and recommendations.
            </p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs text-stone-300">
                <span>Step {step + 1} of {steps.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-orange-400"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {steps.map((s, idx) => (
                <div key={s} className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                  idx === step ? 'border-orange-300/35 bg-orange-500/10 text-orange-200' : 'border-white/10 bg-white/5 text-stone-300'
                }`}>
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                    idx <= step ? 'bg-orange-500 text-white' : 'bg-white/10 text-stone-300'
                  }`}>
                    {idx < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
                  </span>
                  <span className="text-sm">{s}</span>
                </div>
              ))}
            </div>
          </aside>

          <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6">
            {error && (
              <p className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {error}
              </p>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {step === 0 && (
                  <>
                    <FloatingInput id="profile-name" label="Full name" icon={User} value={name} onChange={setName} autoComplete="name" required autoFocus />
                    <FloatingInput id="profile-email" label="Email" icon={Mail} value={user?.email || ''} disabled type="email" />
                    <FloatingInput id="profile-phone" label="Phone number" icon={Phone} value={phone} onChange={setPhone} autoComplete="tel" placeholder="+1 555 123 4567" />
                  </>
                )}

                {step === 1 && (
                  <>
                    <FloatingInput id="profile-line1" label="Address line 1" icon={MapPin} value={line1} onChange={setLine1} autoComplete="address-line1" autoFocus />
                    <FloatingInput id="profile-line2" label="Address line 2" icon={Building2} value={line2} onChange={setLine2} autoComplete="address-line2" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FloatingInput id="profile-city" label="City" icon={Map} value={city} onChange={setCity} autoComplete="address-level2" />
                      <FloatingInput id="profile-state" label="State / Province" icon={Map} value={state} onChange={setState} autoComplete="address-level1" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FloatingInput id="profile-postal" label="Postal code" icon={Hash} value={postalCode} onChange={setPostalCode} autoComplete="postal-code" />
                      <FloatingInput id="profile-country" label="Country" icon={Globe2} value={country} onChange={setCountry} autoComplete="country" />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <FloatingInput id="profile-password" label="New password (optional)" icon={Lock} value={password} onChange={setPassword} type="password" autoComplete="new-password" autoFocus />
                    <FloatingInput id="profile-password-confirm" label="Confirm password" icon={Lock} value={confirmPassword} onChange={setConfirmPassword} type="password" autoComplete="new-password" />
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                      <div className="mb-2 flex items-center justify-between text-xs text-stone-300">
                        <span>Password strength</span>
                        <span>{passwordStrength.label}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full transition-all ${
                            passwordStrength.score === 3
                              ? 'bg-emerald-400'
                              : passwordStrength.score === 2
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                          }`}
                          style={{ width: `${(passwordStrength.score / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-stone-100 transition hover:scale-[1.02] hover:border-white/25 hover:bg-white/10"
                onClick={() => navigate('/dashboard')}
                disabled={saving}
              >
                Skip for now
              </button>

              <div className="flex gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-stone-100 transition hover:scale-[1.02] hover:border-white/25 hover:bg-white/10"
                    onClick={goBack}
                    disabled={saving}
                  >
                    Back
                  </button>
                )}

                {step < steps.length - 1 ? (
                  <button
                    type="button"
                    className="rounded-xl border border-orange-300/35 bg-orange-500/90 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(249,115,22,0.35)] transition hover:scale-[1.02] hover:bg-orange-400"
                    onClick={goNext}
                    disabled={saving}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="rounded-xl border border-orange-300/35 bg-orange-500/90 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(249,115,22,0.35)] transition hover:scale-[1.02] hover:bg-orange-400"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function FloatingInput({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
  autoComplete,
  placeholder = ' ',
  disabled = false,
  required = false,
  autoFocus = false,
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoFocus={autoFocus}
        className="peer h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-10 pr-3 pt-4 text-sm text-stone-100 outline-none transition placeholder:text-transparent hover:border-white/20 focus:border-orange-300/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(249,115,22,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-10 top-3.5 origin-left text-sm text-stone-400 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-orange-200 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[11px]"
      >
        {label}
      </label>
    </div>
  );
}

