'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, ArrowLeft, Loader2, Check } from 'lucide-react';

export default function LoginWhatsAppPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'verifying'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // OTP timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }

      setStep('otp');
      setTimeLeft(900); // 15 minutes
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setStep('verifying');

    try {
      const res = await fetch('/api/auth/login-whatsapp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to verify OTP');
        setStep('otp');
        return;
      }

      // Store token and redirect
      localStorage.setItem('whatsapp_session_token', data.token);
      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
      setStep('otp');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Login to your DMECH account</p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            {/* Phone Number Input */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="08012345678 or +2348012345678"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg py-3 px-4 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                required
              />
              <p className="text-slate-400 text-xs mt-2">We'll send a one-time code to your WhatsApp</p>
            </div>

            {/* Error Message */}
            {error && <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending code...
                </>
              ) : (
                <>
                  <MessageCircle size={18} />
                  Send Code via WhatsApp
                </>
              )}
            </button>

            {/* Links */}
            <div className="space-y-2 pt-4">
              <p className="text-slate-400 text-sm text-center">
                Don't have an account?{' '}
                <Link href="/register-whatsapp" className="text-green-400 hover:text-green-300 font-semibold">
                  Register here
                </Link>
              </p>
              <p className="text-slate-400 text-sm text-center">
                <Link href="/login" className="text-slate-400 hover:text-white">
                  Use email instead
                </Link>
              </p>
            </div>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setError('');
              }}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            {/* Info Card */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
              <p className="text-slate-300 text-sm">
                We've sent a 6-digit code to your WhatsApp. Enter it below to login.
              </p>
            </div>

            {/* OTP Input */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">One-Time Code</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg py-3 px-4 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                autoComplete="one-time-code"
                required
              />
              <p className="text-slate-400 text-xs mt-2">
                Code expires in {formatTime(timeLeft)} | Don't share this code with anyone
              </p>
            </div>

            {/* Error Message */}
            {error && <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="inline animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify & Login'
              )}
            </button>

            {/* Resend Option */}
            <div className="text-center pt-4">
              <p className="text-slate-400 text-sm">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  className="text-green-400 hover:text-green-300 font-semibold"
                >
                  Request again
                </button>
              </p>
            </div>
          </form>
        )}

        {step === 'verifying' && (
          <div className="space-y-4">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-4 animate-pulse">
                <Loader2 className="text-green-400 animate-spin" size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Verifying your code...</h2>
              <p className="text-slate-400">Please wait while we verify your login.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
