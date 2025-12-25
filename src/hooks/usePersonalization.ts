import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface PersonalizationData {
  from: string;
  to: string | null;
  hasRecipient: boolean;
}

export function usePersonalization(): PersonalizationData {
  const [searchParams] = useSearchParams();
  
  return useMemo(() => {
    const from = searchParams.get('from') || 'Abhijeet';
    const to = searchParams.get('to');
    
    return {
      from,
      to,
      hasRecipient: !!to,
    };
  }, [searchParams]);
}
