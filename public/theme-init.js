// Flash-prevention: apply stored dark theme before CSS paints.
// Light is the default (`:root` = light), so only dark needs early injection.
try{var t=localStorage.getItem('aeo-theme');if(t==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}
