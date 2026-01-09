
'use client';

import { useState, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import './login.css';
import { useRouter } from 'next/navigation';

function LoginPageComponent() {
  const [activeTab, setActiveTab] = useState('signup');
  const router = useRouter();

  const handleAuth = (e: React.FormEvent, type: 'signup' | 'signin') => {
    e.preventDefault();
    console.log(`${type} submitted`);
    // In a real app, this would call Firebase auth
    alert(`${type} functionality would connect to your backend API`);
  };

  const socialLogin = (provider: string) => {
    console.log('Social login:', provider);
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth would be implemented here`);
  };

  return (
    <>
      <div className="gradient-bg"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="container">
        <div className="auth-card">
          <button className="close-btn" onClick={() => router.back()}>×</button>

          <div className="tabs">
            <button className={`tab ${activeTab === 'signup' ? 'active' : ''}`} data-tab="signup" onClick={() => setActiveTab('signup')}>Sign up</button>
            <button className={`tab ${activeTab === 'signin' ? 'active' : ''}`} data-tab="signin" onClick={() => setActiveTab('signin')}>Sign in</button>
          </div>

          {/* Sign Up Form */}
          <div id="signup-form" className={activeTab === 'signup' ? '' : 'hidden'}>
            <h2>Create an account</h2>
            
            <form onSubmit={(e) => handleAuth(e, 'signup')}>
              <div className="form-row form-group">
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input type="text" placeholder="First name" required />
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input type="text" placeholder="Last name" required />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input type="email" placeholder="Enter your email" required />
                </div>
              </div>

              <div className="form-group">
                <div className="phone-input">
                  <select className="country-select">
                    <option value="us">🇺🇸</option>
                    <option value="uk">🇬🇧</option>
                    <option value="ca">🇨🇦</option>
                    <option value="au">🇦🇺</option>
                  </select>
                  <input type="tel" className="phone-number" placeholder="(775) 351-6501" style={{paddingLeft: '16px'}} />
                </div>
              </div>

              <button type="submit" className="submit-btn">Create an account</button>
            </form>

            <div className="divider">Or sign up with</div>

            <div className="social-buttons">
              <button className="social-btn" onClick={() => socialLogin('google')}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.335z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
                Google
              </button>
              <button className="social-btn" onClick={() => socialLogin('apple')}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M14.4 13.8c-.3.7-.5 1-1 1.6-.6.8-1.5 1.8-2.6 1.8-1 0-1.3-.6-2.5-.6s-1.6.6-2.5.6c-1.1 0-1.9-.9-2.6-1.7-1.8-2.5-2-5.5-.9-7 .8-1.1 2-1.8 3.2-1.8 1.1 0 1.8.6 2.7.6.9 0 1.4-.6 2.7-.6 1 0 2 .5 2.7 1.5-2.4 1.3-2 4.7.8 5.6zM9.6 3.6c.5-.6.9-1.5.8-2.4-.8 0-1.8.5-2.3 1.2-.5.6-.9 1.5-.8 2.3.9.1 1.8-.5 2.3-1.1z"/></svg>
                Apple
              </button>
            </div>

            <div className="terms">
              By creating an account, you agree to our <a href="#">Terms & Service</a>
            </div>
          </div>

          {/* Sign In Form */}
          <div id="signin-form" className={activeTab === 'signin' ? '' : 'hidden'}>
            <h2>Welcome back</h2>
            
            <form onSubmit={(e) => handleAuth(e, 'signin')}>
              <div className="form-group">
                <div className="input-wrapper">
                  <span className="input-icon">✉️</span>
                  <input type="email" placeholder="Enter your email" required />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input type="password" placeholder="Enter your password" required />
                </div>
              </div>

              <button type="submit" className="submit-btn">Sign in</button>
            </form>

            <div className="divider">Or sign in with</div>

            <div className="social-buttons">
              <button className="social-btn" onClick={() => socialLogin('google')}>
                 <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.335z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
                Google
              </button>
              <button className="social-btn" onClick={() => socialLogin('apple')}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor"><path d="M14.4 13.8c-.3.7-.5 1-1 1.6-.6.8-1.5 1.8-2.6 1.8-1 0-1.3-.6-2.5-.6s-1.6.6-2.5.6c-1.1 0-1.9-.9-2.6-1.7-1.8-2.5-2-5.5-.9-7 .8-1.1 2-1.8 3.2-1.8 1.1 0 1.8.6 2.7.6.9 0 1.4-.6 2.7-.6 1 0 2 .5 2.7 1.5-2.4 1.3-2 4.7.8 5.6zM9.6 3.6c.5-.6.9-1.5.8-2.4-.8 0-1.8.5-2.3 1.2-.5.6-.9 1.5-.8 2.3.9.1 1.8-.5 2.3-1.1z"/></svg>
                Apple
              </button>
            </div>

            <div className="terms">
              <a href="#">Forgot password?</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <LoginPageComponent />
    </Suspense>
  )
}
