import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Shield } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Monthly',
      price: '₹100',
      period: '/month',
      description: 'Perfect for trying out our platform',
      features: [
        'Share your handwritten poetry',
        'Share your handwritten prose',
        'Public, link-only, and private posts',
        'Beautiful manuscript-style presentation',
        'Offline access with PWA',
      ],
    },
    {
      name: 'Yearly',
      price: '₹1,100',
      period: '/year',
      description: 'Best value - save ₹100 per year',
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
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
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
                >
                  Subscribe Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include access to our full platform features.</p>
          <p className="mt-2">Cancel anytime. No hidden fees.</p>
        </div>
      </div>
    </div>
  );
}
