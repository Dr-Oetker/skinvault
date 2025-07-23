/**
 * Check if cookies are enabled for the current session
 * @returns boolean indicating if cookies should be used
 */
export const shouldUseCookies = (): boolean => {
  const cookiesAccepted = localStorage.getItem('cookiesAccepted');
  const cookiesEnabled = localStorage.getItem('cookiesEnabled');
  
  return cookiesAccepted === 'true' && cookiesEnabled === 'true';
};

/**
 * Get cookie consent status
 * @returns object with consent information
 */
export const getCookieConsent = () => {
  const cookiesAccepted = localStorage.getItem('cookiesAccepted');
  const cookiesEnabled = localStorage.getItem('cookiesEnabled');
  
  return {
    accepted: cookiesAccepted === 'true',
    enabled: cookiesEnabled === 'true',
    hasChoice: cookiesAccepted !== null
  };
};

/**
 * Set a cookie if cookies are enabled
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Days until expiration (optional)
 */
export const setCookie = (name: string, value: string, days?: number): void => {
  if (!shouldUseCookies()) {
    return;
  }

  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  
  document.cookie = name + '=' + value + expires + '; path=/';
};

/**
 * Get a cookie value
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  if (!shouldUseCookies()) {
    return null;
  }

  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
};

/**
 * Delete a cookie
 * @param name - Cookie name
 */
export const deleteCookie = (name: string): void => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}; 