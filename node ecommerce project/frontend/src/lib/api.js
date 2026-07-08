export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function apiRequest(path, options = {}) {
  const { headers: userHeaders = {}, ...rest } = options;
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...userHeaders,
      },
    });
  } catch (networkErr) {
    const hint =
      'Backend नहीं मिल रहा। `jyots collaction/backend` फोल्डर में टर्मिनल खोलकर `npm start` चलाएं — पोर्ट 5000 पर चलेगा।';
    throw new Error(
      `${networkErr?.message || 'Network error'} (${hint})`
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const parts = [data.message, data.details].filter(Boolean);
    const mainMsg = parts.join(' — ') || `Request failed with status ${response.status}`;
    throw new Error(mainMsg);
  }
  return data;
}

export function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
