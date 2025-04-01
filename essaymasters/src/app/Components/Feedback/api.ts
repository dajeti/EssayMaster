import { GPTResponse, FeedbackSuggestion } from './types';

export const fetchMarkScheme = async (sessionId: string) => {
  const res = await fetch(`/api/marks/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch markscheme');
  return res.json();
};

export const uploadMarkScheme = async (file: File, sessionId: string) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!uploadRes.ok) throw new Error('File upload failed');
  
  const uploadData = await uploadRes.json();
  const saveRes = await fetch(`/api/marks/${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileUrl: uploadData.url }),
  });
  
  if (!saveRes.ok) throw new Error('Failed to store markscheme reference');
  return uploadData.url;
};

export const generateFeedback = async (prompt: string) => {
  const resp = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      inputText: 'Generate feedback in strict JSON, no extra text.',
    }),
  });
  
  if (!resp.ok) throw new Error(`Feedback request failed with ${resp.status}`);
  const data = await resp.json();
  return JSON.parse(data.response) as GPTResponse;
};