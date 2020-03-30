/**
 * @copyright 2020, the Converse.js contributors
 * @license Mozilla Public License (MPLv2)
 * @description This is the form utilities module.
 */
import tpl_field from "../templates/field.html";
import u from "./core";

/**
 * Takes an HTML DOM and turns it into an XForm field.
 * @private
 * @method u#webForm2xForm
 * @param { DOMElement } field - the field to convert
 */
u.webForm2xForm = function (field) {
    let value;
    if (field.getAttribute('type') === 'checkbox') {
        value = field.checked && 1 || 0;
    } else if (field.tagName == "TEXTAREA") {
        value = field.value.split('\n').filter(s => s.trim());
    } else if (field.tagName == "SELECT") {
        value = u.getSelectValues(field);
    } else {
        value = field.value;
    }
    return u.stringToNode(
        tpl_field({
            'name': field.getAttribute('name'),
            'value': value
        })
    );
};
export default u;
