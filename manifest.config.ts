import {defineManifest} from '@crxjs/vite-plugin'

export default defineManifest({
    manifest_version:3,
    name:'LofiFlow',
    description:'Transform the audio of your active browser tab into a smooth lofi experience.',
    version:'0.1.0',
    icons:{
        16: "icons/icon16.png",
    32: "icons/icon32.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png",
    },
    action:{
        default_title:'LofiFlow',
        default_popup:'index.html'
    },
    permissions:[
        'activeTab',
        'tabCapture',
        'offscreen',
    ],
    background:{
        service_worker:"src/background/service-worker.ts",
        type:'module',
    },
})