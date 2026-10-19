/**
 * ContraGit Extension v2.1 — Background Service Worker
 * Coordinates cross-tab communication and studio deep-linking.
 */

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const existingUrl = await chrome.storage.local.get(['contragit_studio_url']);
    if (!existingUrl.contragit_studio_url) {
      await chrome.storage.local.set({
        contragit_studio_url: 'http://localhost:3000',
      });
    }
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'OPEN_STUDIO') {
    handleOpenStudio(request.payload).then(sendResponse);
    return true; // Keep message channel open for async response
  }

  if (request.action === 'GET_CONFIG') {
    chrome.storage.local.get(['contragit_pat', 'contragit_studio_url'], (items) => {
      sendResponse({
        success: true,
        pat: items.contragit_pat || '',
        studioUrl: items.contragit_studio_url || 'http://localhost:3000',
      });
    });
    return true;
  }
});

async function handleOpenStudio(payload = {}) {
  try {
    const data = await chrome.storage.local.get(['contragit_studio_url']);
    const baseUrl = (data.contragit_studio_url || 'http://localhost:3000').replace(/\/$/, '');
    
    const params = new URLSearchParams();
    if (payload.targetUser) params.set('targetUser', payload.targetUser);
    if (payload.gapCount) params.set('gapCount', payload.gapCount);
    if (payload.source) params.set('source', payload.source);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const targetUrl = `${baseUrl}/dashboard${queryString}`;

    const tab = await chrome.tabs.create({ url: targetUrl });
    return { success: true, tabId: tab.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
