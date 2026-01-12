import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, CreditCard, Sparkles } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

export default function Subscription() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrialDaysRemaining = () => {
    if (!user?.trial_end_date) return 0;
    const trialEnd = new Date(user.trial_end_date);
    const now = new Date();
    const diff = trialEnd - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleSubscribe = async () => {
    setProcessingPayment(true);
    try {
      // In a real implementation, you would:
      // 1. Create a Stripe checkout session via a backend function
      // 2. Redirect to Stripe checkout
      // 3. Handle webhook to update subscription_status
      
      // For now, we'll simulate activation
      alert('Stripe integration required. Please contact support to activate your subscription.');
      
      // Temporary: Mark as active for demo purposes
      // await base44.auth.updateMe({ subscription_status: 'active' });
      // window.location.href = createPageUrl('Dashboard');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  const daysRemaining = getTrialDaysRemaining();
  const isTrialActive = user?.subscription_status === 'trial' && daysRemaining > 0;
  const isExpired = user?.subscription_status === 'expired' || (user?.subscription_status === 'trial' && daysRemaining === 0);
  const isActive = user?.subscription_status === 'active';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">TaxTracker Subscription</h1>
          <p className="text-slate-600">Professional tax tracking for your business</p>
        </div>

        {isActive && (
          <Card className="p-8 text-center bg-white shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Subscription Active</h2>
            <p className="text-slate-600 mb-4">Your subscription is active and running smoothly.</p>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
              Active Subscription
            </Badge>
          </Card>
        )}

        {isTrialActive && (
          <Card className="p-8 bg-white shadow-lg mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Free Trial Active</h2>
                <p className="text-slate-600">
                  You have <span className="font-bold text-blue-600">{daysRemaining} days</span> remaining in your free trial.
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">Trial</Badge>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
              Your trial will automatically end on <span className="font-semibold">{new Date(user.trial_end_date).toLocaleDateString()}</span>. 
              Subscribe now to continue using TaxTracker after your trial ends.
            </div>
          </Card>
        )}

        <Card className="p-8 bg-white shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-700 mb-4">
              Monthly Subscription
            </div>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl font-bold text-slate-900">$10</span>
              <span className="text-slate-500">/month</span>
            </div>
            <p className="text-slate-600">per user · cancel anytime</p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Unlimited receipt scanning with AI</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Comprehensive expense tracking</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Vehicle & mileage tracking</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Tax summary reports</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>Export to CSV & JSON</span>
            </div>
          </div>

          {isExpired && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800 font-medium">Your trial has expired</p>
              <p className="text-red-600 text-sm mt-1">Subscribe now to continue accessing your data</p>
            </div>
          )}

          <Button
            className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-lg"
            onClick={handleSubscribe}
            disabled={processingPayment || isActive}
          >
            <CreditCard className="w-5 h-5 mr-2" />
            {processingPayment ? 'Processing...' : isActive ? 'Already Subscribed' : 'Subscribe Now'}
          </Button>

          <p className="text-center text-xs text-slate-500 mt-4">
            Secure payment powered by Stripe · Cancel anytime
          </p>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Questions? Contact support at support@taxtracker.com
        </p>
      </div>
    </div>
  );
}