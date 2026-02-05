import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, Shield, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { setSEO } from '../lib/seo';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateCheckoutSession, useVerifyCheckoutSession, useIsUserSubscribed } from '../hooks/useQueries';
import { toast } from 'sonner';
import { getUrlParameter, clearUrlParameters, storeSessionParameter, getSessionParameter, clearSessionParameter } from '../utils/urlParams';
import { type ShoppingItem } from '../backend';

type VerificationState = 'idle' | 'verifying' | 'success' | 'error';

export default function PricingPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  
  // Verification state management
  const [verificationState, setVerificationState] = useState<VerificationState>('idle');
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [persistedSessionId, setPersistedSessionId] = useState<string | null>(null);

  const createCheckoutSession = useCreateCheckoutSession();
  const verifyCheckoutSession = useVerifyCheckoutSession();
  const { data: isSubscribed, isLoading: isSubscriptionLoading } = useIsUserSubscribed();

  useEffect(() => {
    setSEO(
      'Pricing Plans | Handwritten Poetry & Prose',
      'Choose the perfect plan to share your handwritten poetry and prose. Monthly and yearly subscription options available with full platform access.'
    );
  }, []);

  // Handle Stripe redirect return with explicit verification flow
  useEffect(() => {
    const success = getUrlParameter('success');
    const canceled = getUrlParameter('canceled');
    const sessionId = getUrlParameter('session_id');

    // Handle cancellation
    if (canceled === 'true') {
      clearUrlParameters(['canceled']);
      toast.info('Checkout canceled. You can try again anytime.');
      return;
    }

    // Handle success return with verification
    if (success === 'true' && sessionId) {
      // Persist session ID for retry capability
      setPersistedSessionId(sessionId);
      storeSessionParameter('pending_session_id', sessionId);
      
      // Clean URL immediately
      clearUrlParameters(['success', 'session_id']);
      
      // Start verification
      setVerificationState('verifying');
      verifySession(sessionId);
    } else {
      // Check if we have a pending session from storage (page refresh scenario)
      const pendingSessionId = getSessionParameter('pending_session_id');
      if (pendingSessionId && verificationState === 'idle') {
        setPersistedSessionId(pendingSessionId);
        setVerificationState('verifying');
        verifySession(pendingSessionId);
      }
    }
  }, []);

  const verifySession = (sessionId: string) => {
    setVerificationState('verifying');
    setVerificationError(null);

    verifyCheckoutSession.mutate(sessionId, {
      onSuccess: () => {
        setVerificationState('success');
        clearSessionParameter('pending_session_id');
        setPersistedSessionId(null);
        toast.success('Subscription activated! Welcome aboard.');
      },
      onError: (error: any) => {
        setVerificationState('error');
        const errorMessage = error.message || 'Verification failed. Please try again.';
        setVerificationError(errorMessage);
      },
    });
  };

  const handleRetryVerification = () => {
    if (persistedSessionId) {
      verifySession(persistedSessionId);
    }
  };

  const handleDismissVerification = () => {
    setVerificationState('idle');
    setVerificationError(null);
    setPersistedSessionId(null);
    clearSessionParameter('pending_session_id');
  };

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '₹100',
      period: '/month',
      description: 'Perfect for trying out our platform',
      priceInCents: BigInt(10000), // ₹100 in paise
      features: [
        'Share your handwritten poetry',
        'Share your handwritten prose',
        'Public, link-only, and private posts',
        'Beautiful manuscript-style presentation',
        'Offline access with PWA',
      ],
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '₹1,100',
      period: '/year',
      description: 'Best value - save ₹100 per year',
      priceInCents: BigInt(110000), // ₹1,100 in paise
      features: [
        'Share your handwritten poetry',
        'Share your handwritten prose',
        'Public, link-only, and private posts',
        'Beautiful manuscript-style presentation',
        'Offline access with PWA',
        'Priority support',
      ],
      popular: true,
    },
  ];

  const handleSubscribe = async (planId: string, planName: string, priceInCents: bigint) => {
    if (!isAuthenticated) {
      toast.error('Please log in to subscribe');
      return;
    }

    if (isSubscribed) {
      toast.info('You already have an active subscription');
      return;
    }

    setProcessingPlan(planId);

    const items: ShoppingItem[] = [
      {
        productName: `${planName} Subscription`,
        productDescription: `Handwritten Poetry & Prose - ${planName} Plan`,
        priceInCents,
        quantity: BigInt(1),
        currency: 'INR',
      },
    ];

    try {
      const session = await createCheckoutSession.mutateAsync(items);
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      // Redirect to Stripe Checkout (do NOT use router navigation)
      window.location.href = session.url;
    } catch (error: any) {
      toast.error(`Failed to start checkout: ${error.message || 'Please try again.'}`);
      setProcessingPlan(null);
    }
  };

  // Determine if buttons should be disabled
  const isVerifying = verificationState === 'verifying';
  const buttonsDisabled = !isAuthenticated || isVerifying || createCheckoutSession.isPending || isSubscribed;

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your handwritten poetry and prose with the world. Select the plan that works best for you.
          </p>
          {!isAuthenticated && (
            <p className="mt-4 text-sm text-primary font-medium">
              Please log in to subscribe to a plan
            </p>
          )}
        </div>

        {/* Verification Status Panel */}
        {verificationState === 'verifying' && (
          <Alert className="mb-8 border-primary bg-primary/5">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <AlertDescription className="ml-2">
              <span className="font-medium">Verifying your subscription...</span>
              <br />
              <span className="text-sm text-muted-foreground">Please wait while we confirm your payment.</span>
            </AlertDescription>
          </Alert>
        )}

        {verificationState === 'success' && (
          <Alert className="mb-8 border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertDescription className="ml-2">
              <span className="font-medium text-green-800 dark:text-green-200">Subscription activated successfully!</span>
              <br />
              <span className="text-sm text-green-700 dark:text-green-300">You now have full access to all features.</span>
            </AlertDescription>
          </Alert>
        )}

        {verificationState === 'error' && (
          <Alert className="mb-8 border-destructive bg-destructive/5">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <AlertDescription className="ml-2 flex flex-col gap-3">
              <div>
                <span className="font-medium text-destructive">Verification failed</span>
                <br />
                <span className="text-sm text-muted-foreground">{verificationError}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetryVerification}
                  disabled={verifyCheckoutSession.isPending}
                >
                  {verifyCheckoutSession.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    'Try Again'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismissVerification}
                >
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Active Subscription Indicator */}
        {isSubscribed && !isSubscriptionLoading && (
          <Alert className="mb-8 border-primary bg-primary/5">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <AlertDescription className="ml-2">
              <span className="font-medium">You have an active subscription</span>
              <br />
              <span className="text-sm text-muted-foreground">You're all set with full platform access.</span>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => {
            const isProcessing = processingPlan === plan.id;
            const isDisabled = buttonsDisabled || isProcessing;

            return (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular
                    ? 'border-primary shadow-lg scale-105'
                    : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Best Value
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground w-full justify-center">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="font-medium">Safe & Secure</span>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.id, plan.name, plan.priceInCents)}
                    disabled={isDisabled}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isSubscribed ? (
                      'Already Subscribed'
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include access to our full platform features.</p>
          <p className="mt-2">Cancel anytime. No hidden fees.</p>
        </div>
      </div>
    </div>
  );
}
