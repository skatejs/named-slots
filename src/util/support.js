const div = document.createElement('div');
export const shadowDomV0 = !!div.createShadowRoot;
export const shadowDomV1 = !!div.attachShadow;
