'use client';

import * as React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password?: string;
}

const strengthLevels = {
  0: { label: 'Very Weak', color: 'bg-red-500' },
  1: { label: 'Weak', color: 'bg-orange-500' },
  2: { label: 'Fair', color: 'bg-yellow-500' },
  3: { label: 'Good', color: 'bg-blue-500' },
  4: { label: 'Strong', color: 'bg-green-500' },
};

const validationChecks = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /[A-Z]/, label: 'At least one uppercase letter' },
  { regex: /[a-z]/, label: 'At least one lowercase letter' },
  { regex: /\d/, label: 'At least one number' },
  { regex: /[^A-Za-z0-9]/, label: 'At least one special character' },
];

export function PasswordStrengthMeter({ password = '' }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = React.useState({ score: 0, label: 'Very Weak', color: 'bg-red-500' });
  const [checks, setChecks] = React.useState(validationChecks.map(c => ({...c, valid: false})));

  React.useEffect(() => {
    let score = 0;
    const newChecks = validationChecks.map(check => {
      const isValid = check.regex.test(password);
      if (isValid) {
        score++;
      }
      return {...check, valid: isValid};
    });
    
    // Adjust score based on length for more granularity
    if (password.length > 0 && password.length < 8) {
      score = 1;
    } else if (password.length >= 8 && score < 2) {
      score = 2;
    } else if (password.length >= 12 && score > 2) {
      score = Math.min(score + 1, 5) ;
    }
    
    // Final score is between 0 and 5, we cap it at 4 for our levels
    const finalScore = Math.min(Math.floor(score/1.25), 4);
    
    setChecks(newChecks);
    setStrength(strengthLevels[finalScore as keyof typeof strengthLevels]);
    
  }, [password]);

  if (!password) {
    return null;
  }
  
  return (
    <div className="space-y-2 pt-1">
      <Progress 
        value={(strength.score + 1) * 20} 
        indicatorClassName={strength.color}
      />
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">{strength.label}</p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-2">
            {check.valid ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-red-500" />
            )}
            <span>{check.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
