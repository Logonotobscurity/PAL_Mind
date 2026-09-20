//#region node_modules/.nitro/vite/services/ssr/assets/inbound.server-DEaQW5as.js
var lastInbound = null;
function storeInbound(event) {
	lastInbound = event;
}
function getInbound() {
	return lastInbound;
}
//#endregion
export { getInbound, storeInbound };
