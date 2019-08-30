import select from 'select-dom';
import elementReady from 'element-ready';
import domLoaded from 'dom-loaded';

// Parts taken from: https://github.com/sindresorhus/refined-github/blob/master/source/libs/page-detect.js

/**
 * Automatically stops checking for an element to appear once the DOM is ready.
 */
export const safeElementReady = selector => {
	const waiting = elementReady(selector);
	domLoaded.then(() => requestAnimationFrame(() => waiting.cancel()));
	return waiting;
};

export const observeEl = (el, listener, options = {childList: true}) => {
	if (typeof el === 'string') {
		el = select(el);
	}

	// Run first
	listener([]);

	// Run on updates
	return new MutationObserver(listener).observe(el, options);
};

// Drops leading and trailing slash to avoid /\/?/ everywhere
export const getCleanPathname = () => location.pathname.replace(/^[/]|[/]$/g, '');

// Probably a nicer way to do this.. (dashes make sure we're not matching other pages)
export const getProjectToken = () => {
	let res
	if (isLegacy()) {
		res = /^([a-zA-Z0-9]*)-([a-zA-Z0-9]*)-([a-zA-Z0-9]*)-([a-zA-Z0-9]*)-([a-zA-Z0-9]*)+/.exec(getCleanPathname())
		return res === null ? false : res[0]
	} else {
		res = /^([a-zA-Z0-9]*)\/([a-zA-Z0-9]*)+/.exec(getCleanPathname())
		return res === null ? false : res[1]
	}
}

export const isInProject = () => !!getProjectToken();

// Parses url to get project section, e.g.
// '/(token)/content/' -> 'content'
// returns false if the path is not a project
export const getProjectSection = () => {
	if (!isInProject()) {
		return false;
	}
	return getCleanPathname().split('/')[isLegacy() ? 1 : 2]
};

export const isLegacy = () => location.hostname === 'legacy.graphcms.com';

export const isOverview = () => {
	return isLegacy() ? /^overview\//.test(getCleanPathname()) : (getCleanPathname() === '')
};







/* export const isDashboard = () => isSingleCommit() || isPRCommit();

export const isCommitList = () => /^commits\//.test(getRepoPath());

export const isCompare = () => /^compare/.test(getRepoPath());

export const isDashboard = () => /^$|^(orgs[/][^/]+[/])?dashboard([/]|$)/.test(getCleanPathname());

export const isDiscussion = () => /^orgs\/[^/]+\/teams\/[^/]+($|\/discussions)/.test(getCleanPathname());


export const isIssue = () => /^issues\/\d+/.test(getRepoPath());

export const isIssueList = () => /^(issues$|pulls$|labels\/)/.test(getRepoPath());

export const isIssueSearch = () => location.pathname.startsWith('/issues');

export const isLabel = () => /^labels\/\w+/.test(getRepoPath());

export const isLabelList = () => /^labels\/?(((?=\?).*)|$)/.test(getRepoPath());

export const isMilestone = () => /^milestone\/\d+/.test(getRepoPath());

export const isMilestoneList = () => getRepoPath() === 'milestones';

export const isNewIssue = () => /^issues\/new/.test(getRepoPath());

export const isProject = () => /^projects\/\d+/.test(getRepoPath());

export const isPR = () => /^pull\/\d+/.test(getRepoPath());

export const isPRConversation = () => /^pull\/\d+$/.test(getRepoPath());

export const isPRCommit = () => /^pull\/\d+\/commits\/[0-9a-f]{5,40}/.test(getRepoPath());

export const isPRFiles = () => /^pull\/\d+\/files/.test(getRepoPath());

export const isPRSearch = () => location.pathname.startsWith('/pulls');

export const isQuickPR = () => isCompare() && /[?&]quick_pull=1(&|$)/.test(location.search);

export const isReleasesOrTags = () => /^(releases|tags)/.test(getRepoPath());

export const isProject = () => /^[^/]+\/[^/]+/.test(getCleanPathname()) &&
	!isReserved(getOwnerAndRepo().ownerName) &&
	!isNotifications() &&
	!isDashboard() &&
	!isGist();

export const isRepoRoot = () => /^(tree[/][^/]+)?$/.test(getRepoPath());

export const isRepoSettings = () => /^settings/.test(getRepoPath());

export const isRepoTree = () => isRepoRoot() || /^tree\//.test(getRepoPath());

export const isSingleCommit = () => /^commit\/[0-9a-f]{5,40}/.test(getRepoPath());

export const isSingleFile = () => /^blob\//.test(getRepoPath());

export const isTrending = () => location.pathname.startsWith('/trending');
*/