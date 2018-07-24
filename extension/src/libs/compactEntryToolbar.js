import * as icons from './icons';
import {h} from 'dom-chef'; // JSX vDOM

export default function compactEntryToolbar(node) {

    // Remove long label
    const res = node.querySelector('.breadCrumbEntry div')
    // console.log('breadcrumb', res)
    if(res) {
        res.innerText = "Copy ID"
    } else {
        console.debug('Failed to find breadcrumb to minimise. contact graphcms extend extension dev.')
    }

    // TODO: Replace Save and Close with Save & Close

    // TODO: Publish Settings to Publishing (+ dropdown caret)

};
