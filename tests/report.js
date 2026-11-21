// Runs last: shows the results of every test file loaded before it.
'use strict';
window.__TESTS={done:true,pass:T.pass,fail:T.fail,errors:T.errors};
document.getElementById('report').innerHTML=`<b>${T.fail?'<span class="fail">'+T.fail+' FAILED</span>':'<span class="pass">ALL PASSED</span>'}</b> · ${T.pass} passed, ${T.fail} failed\n\n`+T.log.join('\n');
