import { h } from 'dom-chef'; // JSX vDOM
import { isLegacy } from './utils'

// import { js2xliff } from 'xliff';

// import findVisibleForm from './findVisibleForm';

const buttonStyle = isLegacy()
	? {"border":"10px","boxSizing":"border-box","display":"inline-block","fontFamily":"Roboto, sans-serif","WebkitTapHighlightColor":"rgba(0, 0, 0, 0)","cursor":"pointer","textDecoration":"none","margin":"10px 0px 10px 8px","padding":"0px","outline":"none","fontSize":"inherit","fontWeight":"inherit","position":"relative","height":"36px","lineHeight":"36px","minWidth":"88px","color":"rgb(0, 188, 212)","transition":"all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms","borderRadius":"2px","userSelect":"none","overflow":"hidden","backgroundColor":"rgba(0, 0, 0, 0)","textAlign":"center"}
	: {"border-style":"hidden","boxSizing":"border-box","display":"inline-block","fontFamily":"\"PT Sans\", sans-serif","WebkitTapHighlightColor":"rgba(0, 0, 0, 0)","cursor":"pointer","textDecoration":"none","margin":"10px 0px 0px 10px","padding":"0px","outline":"none","fontSize":"inherit","fontWeight":"inherit","position":"relative","height":"32px","lineHeight":"32px","minWidth":"88px","color":"rgb(255, 255, 255)","transition":"all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms","borderRadius":"5px","userSelect":"none","overflow":"hidden","backgroundColor":"rgba(0, 200, 200, 1)","textAlign":"center", "top": "-10px"}

const svgStyle = isLegacy()
	? {"display":"inline-block","color":"rgba(0, 0, 0, 0.87)","fill":"rgb(0, 188, 212)","height":"24px","width":"24px","userSelect":"none","transition":"all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms","verticalAlign":"middle","marginLeft":"12px","marginRight":"0px"}
	: {"display":"inline-block","color":"rgba(0, 0, 0, 0.87)","fill":"rgb(255, 188, 212)","height":"20px","width":"20px","userSelect":"none","transition":"all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms","verticalAlign":"middle","marginLeft":"12px","marginRight":"0px"}

const spanStyle = isLegacy()
	? {"position":"relative","paddingLeft":"8px","paddingRight":"16px","verticalAlign":"middle","letterSpacing":"0px","textTransform":"uppercase","fontWeight":"500","fontSize":"14px"}
	: {"position":"relative","paddingLeft":"8px","paddingRight":"16px","verticalAlign":"middle","letterSpacing":"0px","textTransform":"capitalize","fontWeight":"600","fontSize":"14px"}

export function addXLIFFDownloadButton(node) {
	const res = node.querySelector(isLegacy() ? '.toolbar' : 'form>div')
	
	if(res) {
		const downloadFile = () => {
			window.postMessage("DOWNLOAD_FORM", "*");
			return // !!!!!

			const info = '' //findVisibleForm()
			if(info) {
				console.log(info)
			} else {
				console.log('Missing info object required to make downloadable translation file.')
			}
		}
	
		const downloadButton = 	<div>
									<button type="button" onClick={downloadFile} style={buttonStyle}>
										<svg viewBox="0 0 24 24" style={svgStyle}><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"></path></svg>
										<span style={spanStyle}>Export</span>
									</button>
								</div>

		if (isLegacy()) {
			res.children[res.children.length - 1].appendChild(downloadButton)
		} else {
			res.children[0].children[res.children[0].children.length - 1].appendChild(downloadButton)
		}
		
		node.classList.add('export-button-added')
	}
	
};

export default {
	addXLIFFDownloadButton
};