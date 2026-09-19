import {defineManifest} from '@crxjs/vite-plugin'

export default defineManifest({
    manifest_version:3,
    name:'LofiFlow',
    description:'Transform the audio of your active browser tab into a smooth lofi experience.',
    version:'0.1.0',
    action:{
        default_title:'LofiFlow',
        default_popup:'index.html'
    },
    permissions:[
        'activeTab',
        'tabcapture',
    ],
    background:{
        service_worker:"src/background/service-worker.ts",
        type:'module',
    },
})