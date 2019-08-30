import * as icons from './icons';
import {h} from 'dom-chef'; // JSX vDOM
import { isLegacy } from './utils'

export default function compactEntryToolbar(node) {

    // Remove long label
    const res = isLegacy() ? node.querySelector('.breadCrumbEntry div') : node.querySelector('form>div')
    // console.log('breadcrumb', res)
    if(res) {
        if (isLegacy()) {
            res.innerText = "Copy ID"
        } else {
            res.children[0].children[0].firstElementChild.style.maxWidth = '50px'
            res.children[0].children[1].style.maxWidth = '75%'
        }
    } else {
        console.debug('Failed to find breadcrumb to minimise. contact graphcms extend extension dev.')
    }

    // TODO: Replace Save and Close with Save & Close

    // TODO: Publish Settings to Publishing (+ dropdown caret)

};
