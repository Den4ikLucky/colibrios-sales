/** Optional development overlay. Imported only after the sovereign entry's exact-host guard.
 * Agentation is not vendored into the public product. See https://www.agentation.com/install.
 */
export async function installAgentation() {
  if (location.hostname !== 'localhost' || window.COLIBRI_PORTABLE_PREVIEW || location.href === 'about:srcdoc') return () => {};
  const [React, client, library] = await Promise.all([
    import('https://esm.sh/react@19.3.1'),
    import('https://esm.sh/react-dom@19.3.1/client?deps=react@19.3.1'),
    import('https://esm.sh/agentation@3.1.2?deps=react@19.3.1,react-dom@19.3.1'),
  ]);
  if (location.hostname !== 'localhost' || window.COLIBRI_PORTABLE_PREVIEW) return () => {};
  const host = document.createElement('div'); host.dataset.agentationDev = 'true'; document.body.append(host);
  const root = client.createRoot(host);
  root.render(React.createElement(library.Agentation, { endpoint: 'http://localhost:4747' }));
  return () => { root.unmount(); host.remove(); };
}
