import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from './utils';

export default function SubscriptionCheck({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Set trial end date if new user (3 months from now)
      if (!currentUser.trial_end_date) {
        const trialEnd = new Date();
        trialEnd.setMonth(trialEnd.getMonth() + 3);
        await base44.auth.updateMe({
          trial_end_date: trialEnd.toISOString(),
          subscription_status: 'trial'
        });
      } else {
        // Check if trial has expired
        const trialEnd = new Date(currentUser.trial_end_date);
        const now = new Date();
        
        if (now > trialEnd && currentUser.subscription_status === 'trial') {
          await base44.auth.updateMe({ subscription_status: 'expired' });
          navigate(createPageUrl('Subscription'));
          return;
        }

        if (currentUser.subscription_status === 'expired') {
          navigate(createPageUrl('Subscription'));
          return;
        }
      }
    } catch (error) {
      console.error('Subscription check error:', error);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return children;
}