import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Ripple, AuthTabs, TechOrbitDisplay } from '@/components/ui/modern-animated-sign-in';

export function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  }, [user, navigate]);

  const iconsArray = useMemo(
    () => [
      {
        component: () => (
          <img
            width="30"
            height="30"
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg"
            alt="React"
          />
        ),
        className: 'size-[30px] border-none bg-transparent',
        duration: 20,
        delay: 10,
        radius: 120,
        path: false,
        reverse: false,
      },
      {
        component: () => (
          <img
            width="30"
            height="30"
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg"
            alt="Tailwind"
          />
        ),
        className: 'size-[30px] border-none bg-transparent',
        duration: 20,
        delay: 20,
        radius: 180,
        path: false,
        reverse: true,
      },
      {
        component: () => (
          <img
            width="30"
            height="30"
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg"
            alt="MongoDB"
          />
        ),
        className: 'size-[30px] border-none bg-transparent',
        duration: 22,
        delay: 30,
        radius: 240,
        path: false,
        reverse: false,
      },
    ],
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const loggedInUser = await login({ email: email.trim().toLowerCase(), password });
      navigate(loggedInUser?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formFields = {
    header: 'Welcome back',
    subHeader: 'Sign in to your account to continue.',
    fields: [
      {
        label: 'Email',
        required: true,
        type: 'email',
        placeholder: 'Enter your email address',
        onChange: (e) => setEmail(e.target.value),
      },
      {
        label: 'Password',
        required: true,
        type: 'password',
        placeholder: 'Enter your password',
        onChange: (e) => setPassword(e.target.value),
      },
    ],
    submitButton: submitting ? 'Signing in…' : 'Sign in',
    textVariantButton: 'Create an account',
    googleLogin: 'Login with Google',
  };

  return (
    <section className="flex max-lg:justify-center">
      <span className="flex flex-col justify-center w-1/2 max-lg:hidden relative">
        <Ripple mainCircleSize={120} />
        <TechOrbitDisplay iconsArray={iconsArray} text="Dev.inc" />
      </span>

      <span className="w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:w-full max-lg:px-[10%]">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <AuthTabs
          formFields={formFields}
          goTo={(ev) => {
            ev.preventDefault();
            navigate('/signup');
          }}
          handleSubmit={handleSubmit}
        />
      </span>
    </section>
  );
}

