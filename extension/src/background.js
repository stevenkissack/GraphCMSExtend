import OptionsSync from 'webext-options-sync';

// Define defaults
new OptionsSync().define({
	defaults: {
		showTranslateDownload: true
	},
	//migrations: [
	//	OptionsSync.migrations.removeUnused
	//]
});