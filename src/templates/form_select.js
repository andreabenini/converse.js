import { html } from "lit";

const tplOption = (o) => html`<option value="${o.value}" ?selected="${o.selected}">${o.label}</option>`;

export default  (o) => html`
    <div class="form-group">
        <label for="${o.id}">${o.label}</label>
        <select class="form-control" id="${o.id}" name="${o.name}" ?multiple="${o.multiple}">
            ${o.options?.map(o => tplOption(o))}
        </select>
    </div>`;
