import { js2xliff } from 'xliff';

window.__GRAPHCMS__EXTEND__ = {
    renderer: null
}

if(window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    // console.log('GraphCMS Extend Plugin: devtools global hook already exists')
    
    const oldInject = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject
    
    // Intercepting hook method to store react renderer instance on our own global variable
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = (renderer) => {
        oldInject(renderer)
        window.__GRAPHCMS__EXTEND__.renderer = renderer
    }
} else {
    // console.log('No devtools hook found, defining the hook')

    // Inject hook global to catch renderers
    // TODO: Remove unused parts
    const hook = ({
        // Shared between Stack and Fiber:
        _renderers: {},
        helpers: {},
        checkDCE: function(fn) {
            // This runs for production versions of React.
            // Needs to be super safe.
            try {
                var toString = Function.prototype.toString;
                var code = toString.call(fn);
                // This is a string embedded in the passed function under DEV-only
                // condition. However the function executes only in PROD. Therefore,
                // if we see it, dead code elimination did not work.
                if (code.indexOf('^_^') > -1) {
                // Remember to report during next injection.
                hasDetectedBadDCE = true;
                // Bonus: throw an exception hoping that it gets picked up by
                // a reporting system. Not synchronously so that it doesn't break the
                // calling code.
                setTimeout(function() {
                    throw new Error(
                    'React is running in production mode, but dead code ' +
                        'elimination has not been applied. Read how to correctly ' +
                        'configure React for production: ' +
                        'https://fb.me/react-perf-use-the-production-build'
                    );
                });
                }
            } catch (err) { }
        },
        inject: function(renderer) {
            window.__GRAPHCMS__EXTEND__.renderer = renderer

            var id = Math.random().toString(16).slice(2);
            hook._renderers[id] = renderer;
            var reactBuildType = 'production'; // We know it's all fine on the graphcms site
            hook.emit('renderer', {id, renderer, reactBuildType});
            return id;
        },
        _listeners: {},
        sub: function(evt, fn) {
            hook.on(evt, fn);
            return () => hook.off(evt, fn);
        },
        on: function(evt, fn) {
            if (!hook._listeners[evt]) {
                hook._listeners[evt] = [];
            }
            hook._listeners[evt].push(fn);
        },
        off: function(evt, fn) {
            if (!hook._listeners[evt]) {
                return;
            }
            var ix = hook._listeners[evt].indexOf(fn);
            if (ix !== -1) {
                hook._listeners[evt].splice(ix, 1);
            }
            if (!hook._listeners[evt].length) {
                hook._listeners[evt] = null;
            }
        },
        emit: function(evt, data) {
            if (hook._listeners[evt]) {
                hook._listeners[evt].map(fn => fn(data));
            }
        },
        // Fiber-only:
        supportsFiber: true,
        _fiberRoots: {},
        getFiberRoots(rendererID) {
            const roots = hook._fiberRoots;
            if (!roots[rendererID]) {
                roots[rendererID] = new Set();
            }
            return roots[rendererID];
        },
        onCommitFiberUnmount: function(rendererID, fiber) {
            // TODO: can we use hook for roots too?
            if (hook.helpers[rendererID]) {
                hook.helpers[rendererID].handleCommitFiberUnmount(fiber);
            }
        },
        onCommitFiberRoot: function(rendererID, root) {
            const mountedRoots = hook.getFiberRoots(rendererID);
            const current = root.current;
            const isKnownRoot = mountedRoots.has(root);
            const isUnmounting = current.memoizedState == null || current.memoizedState.element == null;
            // Keep track of mounted roots so we can hydrate when DevTools connect.
            if (!isKnownRoot && !isUnmounting) {
                mountedRoots.add(root);
            } else if (isKnownRoot && isUnmounting) {
                mountedRoots.delete(root);
            }
            if (hook.helpers[rendererID]) {
                hook.helpers[rendererID].handleCommitFiberRoot(root);
            }
        },
    });

    // Expose - This is to pretend devtools is running to react so it exports the react renderer
    Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', {
        value: hook,
    });
}

window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window) {
        return;
    }

    if (event.data == "DOWNLOAD_FORM") {
        console.log("Request for download");

        // Get Form from store
        const formData = getFormData()
        if(!formData) return
        const xliffJson = generateXLIFFJSONStructure(formData)
        if(!xliffJson) return
        
        createXLIFF(xliffJson, (xml) => {
            if(!xml) return
            download(xml, xliffJson.__name)
        })
        
    }

}, false);

function getFormData() {
    const instances = window.__GRAPHCMS__EXTEND__.renderer.Mount._instancesByReactRootID
        const instance_keys = Object.keys(instances)
        let instance

        if(instance_keys.length < 1) {
            console.error('GraphCMS Extend Plugin: Failed to find instance of application in renderer')
            return false
        } else {
            if(instance_keys.length > 1) {
                console.warn('GraphCMS Extend Plugin: Found multiple instances, picking the first')
            }

            instance = instances[instance_keys[0]]._instance
        }

        const state = instance.props.child.props.store.getState()

        if(state.form && Object.keys(state.form).length > 0) {
            const form_keys = Object.keys(state.form)

            if(form_keys.length > 1) {
                console.log('GraphCMS Extend Plugin: Multiple forms found, using first')
            }

            if(form_keys.length < 1) {
                console.log('GraphCMS Extend Plugin: No forms found')
                return false
            }

            // form seems nested so jump that level, not sure what the ID is for
            // Return the first form object found in the redux-form state object
            let form = state.form[form_keys[0]]
            
            console.log(form)

            return form[Object.keys(form)[0]]
            
        } else {
            console.error('GraphCMS Extend Plugin: Failed to find form in state')
            return false
        }
}

function getTranslationFields(allFields, defaultLocale) {

    var y = Object.keys(allFields).filter(function(k) {
        return k.indexOf(`translations.fields.${defaultLocale}`) == 0
    }).map(m => {
        return m.split('.').pop() // Just return the non-namespaced field name
    })

    return y
}

function generateXLIFFJSONStructure(formData) {
    const translations = formData.values.translations
    const translationFields = getTranslationFields(formData.registeredFields, translations.defaultLocale)
    console.log('Translation fields being added to xliff: ', translationFields)
    
    let outputJson = {}

    if(!translations || translationFields.length === 0) {
        console.log('Missing translations data or fields on form')
        return false
    }

    translationFields.forEach(field => {
        outputJson[field] = {
            source: translations.fields[translations.defaultLocale][field].value,
            target: '' // Note: Our translators don't want us to pass our current target content as their content-memory will fill it
            // target: translations.fields[translations.activeLocales[0]][field], // Enable this line and you can get the current selected locale in the UI
        }
    })
    
    // Custom for our usage:
    // If we have any of the following: slug -> code -> title
    // Then we use it in the filename to help be more descriptive for users handling the files (always limited to max 20 characters)
    let userFriendlyName = false

    if(translationFields.includes('slug') && translations.fields[translations.defaultLocale].slug.value !== "") {
        userFriendlyName = translations.fields[translations.defaultLocale].slug.value.substring(0, 20)
    } else if(translationFields.includes('code') && translations.fields[translations.defaultLocale].code.value !== "") {
        userFriendlyName = translations.fields[translations.defaultLocale].code.value.substring(0, 20)
    } else if(translationFields.includes('title') && translations.fields[translations.defaultLocale].title.value !== "") {
        userFriendlyName = translations.fields[translations.defaultLocale].title.value.substring(0, 20)
    }

    return {
        resources: { [formData.values.id]: outputJson },
        sourceLanguage: translations.defaultLocale,
        targetLanguage: '',
        __name: `${formData.values.id}_${translations.defaultLocale}${userFriendlyName ? `_${userFriendlyName}` : ''}.xlf`
    }
}

function createXLIFF(json, callback) {
	js2xliff(json, (err, res) => {
	  if(err) {
		console.error('Creating XLIFF failed', err)
		callback(false)
	  }

	  // res is xliff XML
	  // console.log(res)
      callback(res)
	})
}

function download(data, filename, type = 'text/xml') {
    debugger
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}