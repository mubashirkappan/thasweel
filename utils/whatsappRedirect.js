/**
 * Submits data via an async operation and redirects the user directly to WhatsApp on success.
 * This avoids iOS Safari "about:blank" locks and handles errors gracefully.
 * 
 * @param {Function} asyncOperation - A function that returns a Promise (e.g., your $fetch call).
 * @param {Function} getUrlCallback - Receives the response and returns the final WhatsApp URL string.
 * @param {Function} [onError] - Optional callback to handle errors (e.g., toast alerts, routing).
 */
export async function executeAndRedirectWhatsApp(asyncOperation, getUrlCallback, onError) {
  try {
    // 1. Run the backend API call first
    const response = await asyncOperation();

    // 2. Generate the WhatsApp target URL from the successful response
    const targetUrl = getUrlCallback(response);

    // 3. Directly redirect the current page. 
    // On iOS Safari, this smoothly triggers the system prompt to open WhatsApp.
    window.location.href = targetUrl;

    return response;
  } catch (error) {
    // 4. Handle any backend or network errors
    if (onError) {
      onError(error);
    } else {
      console.error('Operation failed:', error);
    }
    throw error;
  }
}