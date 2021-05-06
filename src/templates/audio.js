import { html } from "lit";


export default (o) => html`
    <audio controls src="${o.url}"></audio>
    <a target="_blank" rel="noopener" href="${o.url}">${o.label_download}</a>
`;
