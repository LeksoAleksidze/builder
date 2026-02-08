import type React from 'react';
import { useState } from 'react';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@d2d-ui/theme-toggle';
import { DOMAIN_URL } from '../../../shared/services/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${DOMAIN_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (data.status && data.body) {
        localStorage.setItem('authToken', data.body);
        navigate('/server-selection');
      } else {
        setError('არასწორი მონაცემები. გთხოვთ სცადოთ ხელახლა.');
      }
    } catch (err) {
      setError('შეცდომა სერვერთან კავშირში. გთხოვთ სცადოთ ხელახლა.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__theme-toggle">
        <ThemeToggle />
      </div>

      <div className="login-page__card">
        <div className="login-page__header">
          <div className="login-page__header-icon">
            <Lock />
          </div>
          <h1 className="login-page__header-title">D2D TEAM</h1>
          <p className="login-page__header-description">
            აქციების მართვის სააგენტო
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-page__form">
          <div className="login-page__form-field">
            <label htmlFor="email">ელ. ფოსტა</label>
            <div className="login-page__form-field-input-wrapper">
              <Mail />
              <input
                id="email"
                type="email"
                placeholder="თქვენი ელ. ფოსტა"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-page__form-field">
            <label htmlFor="password">პაროლი</label>
            <div className="login-page__form-field-input-wrapper login-page__form-field-input-wrapper--password">
              <Lock />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="თქვენი პაროლი"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className="password-eye"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-page__form-error">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="login-page__form-submit"
            disabled={!email || password.length < 4 || isLoading}
          >
            <div className="login-page__form-submit-content">
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  შესვლა...
                </>
              ) : (
                'შესვლა'
              )}
            </div>
          </button>
        </form>
      </div>

      <p className="login-page__footer">Created by Lekso Aleksidze</p>
    </div>
  );
}
