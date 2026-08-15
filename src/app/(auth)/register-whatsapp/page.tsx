'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';

export default function RegisterWhatsAppPage() {
  const router = useRouter();
  const [step, setStep] = useState<'choose' | 'phone' | 'confirm' | 'waiting'>('choose');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [waLink, setWaLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // While waiting for the customer to send the code on WhatsApp, poll for
  // the webhook to have completed registration -- without this the screen
  // just sits on "Waiting for your message..." forever with no way to know
  // it finished or to actually continue into the site.
  useEffect(() => {
    if (step !== 'waiting' || !phone) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/register-whatsapp?phone=${encodeURIComponent(phone)}`);
        const data = await res.json();
        if (data.done && data.token) {
          clearInterval(interval);
          localStorage.setItem('whatsapp_session_token', data.token);
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Registration status poll failed:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [step, phone, router]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to start registration');
        return;
      }

      setRegistrationCode(data.code);
      setWaLink(data.waLink);
      setStep('confirm');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (waLink) {
      window.open(waLink, '_blank');
      setStep('waiting');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Join DMECH</h1>
          <p className="text-slate-400">Get quality vehicles delivered to your doorstep</p>
        </div>

        {step === 'choose' && (
          <div className="space-y-3">
            {/* WhatsApp Registration */}
            <button
              onClick={() => setStep('phone')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors"
            >
              <MessageCircle size={20} />
              Sign up with WhatsApp
            </button>

            {/* Email Registration (Link) */}
            <Link
              href="/register"
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-colors"
            >
              <Mail size={20} />
              Sign up with Email
            </Link>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-green-400 hover:text-green-300">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        )}

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => {
                setStep('choose');
                setError('');
              }}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
            >
              <ArrowLeft size={18} />
              Back
            </button>

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
              <p className="text-slate-400 text-xs mt-2">We'll send your registration code via WhatsApp</p>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Full Name (Optional)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg py-3 px-4 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              />
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
                  Getting ready...
                </>
              ) : (
                <>
                  <MessageCircle size={18} />
                  Continue with WhatsApp
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-slate-500 text-xs text-center">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-slate-400 hover:text-white">
                Terms of Service
              </Link>
            </p>
          </form>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={() => {
                setStep('phone');
                setPhone('');
                setName('');
                setError('');
              }}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            {/* Confirmation Card */}
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600/20 rounded-full mb-3">
                  <MessageCircle className="text-green-400" size={24} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Ready to register!</h2>
                <p className="text-slate-400 text-sm">We've created your registration code</p>
              </div>

              {/* Code Display */}
              <div className="bg-slate-800 rounded-lg p-4 mb-4 text-center">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Your Registration Code</p>
                <p className="text-2xl font-mono font-bold text-green-400">{registrationCode}</p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-4">
                <p className="text-blue-300 text-sm">
                  <span className="font-semibold">Next step:</span> Open WhatsApp and send the code above to our number. We'll verify your registration immediately.
                </p>
              </div>

              {/* WhatsApp Button */}
              <button
                onClick={handleOpenWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors mb-3"
              >
                <MessageCircle size={18} />
                Open WhatsApp
              </button>

              {/* Manual Link */}
              <p className="text-slate-400 text-xs text-center">
                Or copy this code and send it manually to{' '}
                <span className="text-green-400 font-semibold">+234 800 0000 000</span>
              </p>
            </div>

            {/* Code Info */}
            <p className="text-slate-400 text-xs text-center">
              This code expires in 10 minutes. Don't share it with anyone.
            </p>
          </div>
        )}

        {step === 'waiting' && (
          <div className="space-y-4">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-4 animate-bounce">
                <MessageCircle className="text-green-400" size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Waiting for your message...</h2>
              <p className="text-slate-400 mb-4">
                We're waiting for you to send the code <span className="font-mono font-bold text-green-400">{registrationCode}</span> via WhatsApp.
              </p>
              <p className="text-slate-500 text-sm">
                Once we receive and verify it, your account will be created automatically and you'll be logged in.
              </p>
            </div>

            <button
              onClick={() => setStep('confirm')}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Back to code
            </button>

            <p className="text-slate-400 text-xs text-center">
              Code expires in 10 minutes.{' '}
              <button
                onClick={() => {
                  setStep('phone');
                  setPhone('');
                  setName('');
                  setError('');
                }}
                className="text-slate-300 hover:text-white underline"
              >
                Start over
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
