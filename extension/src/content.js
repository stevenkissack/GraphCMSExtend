import OptionsSync from 'webext-options-sync';
import elementReady from 'element-ready';
import select from 'select-dom';
import domLoaded from 'dom-loaded';

// Seperate out each feature
import compactEntryToolbar from './libs/compactEntryToolbar';
import { addXLIFFDownloadButton } from './libs/XLIFFTranslate';

import { observeEl, isInProject, getProjectToken, getProjectSection, isLegacy } from './libs/utils';

function injectScript(file) {
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    (document.head || document.documentElement).appendChild(s);
}

async function init() {
	
	console.log('Injecting JS to page (DevTools hook, message listener)')
	injectScript(chrome.extension.getURL('inject.js'));

	//const options = await new OptionsSync().getAll();
	// console.log('awaiting dom')
	await domLoaded;
	// console.log('dom loaded')
	
	// Give react some time to load
	//setTimeout(() => {
		//if(!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
		//	console.error('GraphCMS Extend Plugin: Cannot find react devtools global hook. Must have failed to inject from manifest')
		//	return
		//}

		// Give time to do an initial render
		// Maybe remove once we change the observers
		// or use element ready watchers
		//setTimeout(() => { // TODO: Do a dom class search for form on load, then use mutations..apply class if already parsed
		//console.log('2 second delay to allow render')
		//if () {
			// TODO: Change scope to improve performance
			observeEl(document, (mutations) => {
				// console.log('mutations found')
				// Currently we don't have any features outside of the content area, so let's reduce unneccessary checks
				if(!isInProject() || getProjectSection() !== "content") return;
				// console.log('is in content section')
				mutations.forEach((mutation) => {
					// Log added node count found
					// if(mutation.addedNodes && mutation.addedNodes.length > 0) console.log(`Added node count: ${mutation.addedNodes.length}`)

					mutation.addedNodes && mutation.addedNodes.forEach((node) => {
						// Check className each time as mutations seem to be live
						// Condition: Is the entry form and has translation fields so we want to show an export button
						if ((isLegacy() && node.className && node.className.indexOf && node.className.indexOf('editCreateEntryWrapper') !== -1
							&& node.className.indexOf('export-button-added') === -1
							&& node.querySelector('div.translationField') !== null)
							|| (!isLegacy() && node.parentElement && node.parentElement.dataset && node.parentElement.dataset.test === 'LevelComponent'
							&& node.className.indexOf('export-button-added') === -1
							&& [...node.querySelectorAll("*")].filter(n => n.name && (n.name.endsWith('EN') || n.name.endsWith('RU') || n.name.endsWith('PTBR') || n.name.endsWith('ESLA'))).length > 0
							)) {
							// console.log('is entry form node')
							// Gives the extra button space
							compactEntryToolbar(node)

							// Adds translation file download button
							addXLIFFDownloadButton(node)

						}
					})
				})
			}, { childList: true, subtree: true, attributes: true });
		//}

		//if(options.showButton) {
			//addButton();
		//}
	//}, 1000);
	
}

init();