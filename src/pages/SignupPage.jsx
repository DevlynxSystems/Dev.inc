import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Ripple, AuthTabs, TechOrbitDisplay } from '@/components/ui/modern-animated-sign-in';

export function SignupPage() {
  const navigate = useNavigate();
  const { user, signup } = useAuth();

  const [name, setName] = useState('');
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
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg"
            alt="Node.js"
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
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg"
            alt="Express"
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
            src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongoose/mongoose-original.svg"
            alt="Mongoose"
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
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formFields = {
    header: 'Create your account',
    subHeader: 'Sign up to start building your reading space.',
    fields: [
      {
        label: 'Name',
        required: true,
        type: 'text',
        placeholder: 'Enter your name',
        onChange: (e) => setName(e.target.value),
      },
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
        placeholder: 'Create a password (6+ chars)',
        onChange: (e) => setPassword(e.target.value),
      },
    ],
    submitButton: submitting ? 'Creating…' : 'Create account',
    textVariantButton: 'Already have an account? Login',
    googleLogin: 'Signup with Google',
  };

  return (
    <section className="flex max-lg:justify-center">
      <span className="flex flex-col justify-center w-1/2 max-lg:hidden relative">
        <Ripple mainCircleSize={120} />
        <TechOrbitDisplay iconsArray={iconsArray} text="Book Catalog" />
      </span>

      <span className="w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:w-full max-lg:px-[10%]">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="w-full max-w-md">
          <AuthTabs
            formFields={formFields}
            goTo={(ev) => {
              ev.preventDefault();
              navigate('/login');
            }}
            handleSubmit={handleSubmit}
          />
        </div>
      </span>
    </section>
  );
}

