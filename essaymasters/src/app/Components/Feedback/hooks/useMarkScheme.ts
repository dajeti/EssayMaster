import { useState, useEffect } from 'react';
import { fetchMarkScheme } from '../api';

export const useMarkScheme = (sessionId: string) => {
  const [markSchemeUrl, setMarkSchemeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadMarkScheme = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMarkScheme(sessionId);
        if (data.markScheme?.fileUrl) setMarkSchemeUrl(data.markScheme.fileUrl);
      } finally {
        setIsLoading(false);
      }
    };
    loadMarkScheme();
  }, [sessionId]);

  return { markSchemeUrl, setMarkSchemeUrl, isLoading };
};