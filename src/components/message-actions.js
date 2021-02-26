import log from '@converse/headless/log';
import { CustomElement } from './element.js';
import { __ } from '../i18n';
import { _converse, api, converse } from "@converse/headless/core";
import { html } from 'lit-element';
import { until } from 'lit-html/directives/until.js';

const { Strophe, u } = converse.env;


class MessageActions extends CustomElement {

    static get properties () {
        return {
            model: { type: Object },
            editable: { type: Boolean },
            correcting: { type: Boolean },
            message_type: { type: String },
            is_retracted: { type: Boolean },
        }
    }

    render () {
        return html`${ until(this.renderActions(), '') }`;
    }

    async renderActions () {
        const buttons = await this.getActionButtons();
        const items = buttons.map(b => MessageActions.getActionsDropdownItem(b));
        if (items.length) {
            return html`<converse-dropdown class="chat-msg__actions" .items=${ items }></converse-dropdown>`;
        } else {
            return '';
        }
    }

    static getActionsDropdownItem (o) {
        return html`
            <button class="chat-msg__action ${o.button_class}" @click=${o.handler}>
                <converse-icon class="${o.icon_class}"
                    path-prefix="${api.settings.get("assets_path")}"
                    color="var(--text-color-lighten-15-percent)"
                    size="1em"></converse-icon>
                ${o.i18n_text}
            </button>
        `;
    }

    onMessageEditButtonClicked (ev) {
        ev.preventDefault();
        const currently_correcting = this.model.collection.findWhere('correcting');
        // TODO: Use state intead of DOM querying
        // Then this code can also be put on the model
        const unsent_text = u.ancestor(this, '.chatbox')?.querySelector('.chat-textarea')?.value;
        if (unsent_text && (!currently_correcting || currently_correcting.get('message') !== unsent_text)) {
            if (!confirm(__('You have an unsent message which will be lost if you continue. Are you sure?'))) {
                return;
            }
        }
        if (currently_correcting !== this.model) {
            currently_correcting?.save('correcting', false);
            this.model.save('correcting', true);
        } else {
            this.model.save('correcting', false);
        }
    }

    async onDirectMessageRetractButtonClicked () {
        if (this.model.get('sender') !== 'me') {
            return log.error("onMessageRetractButtonClicked called for someone else's this.model!");
        }
        const retraction_warning = __(
            'Be aware that other XMPP/Jabber clients (and servers) may ' +
            'not yet support retractions and that this this.model may not ' +
            'be removed everywhere.'
        );
        const messages = [__('Are you sure you want to retract this this.model?')];
        if (api.settings.get('show_retraction_warning')) {
            messages[1] = retraction_warning;
        }
        const result = await api.confirm(__('Confirm'), messages);
        if (result) {
            const chatbox = this.model.collection.chatbox;
            chatbox.retractOwnMessage(this.model);
        }
    }

    /**
     * Retract someone else's message in this groupchat.
     * @private
     * @param { _converse.Message } message - The message which we're retracting.
     * @param { string } [reason] - The reason for retracting the message.
     */
    async retractOtherMessage (reason) {
        const chatbox = this.model.collection.chatbox;
        const result = await chatbox.retractOtherMessage(this.model, reason);
        if (result === null) {
            const err_msg = __(`A timeout occurred while trying to retract the message`);
            api.alert('error', __('Error'), err_msg);
            log(err_msg, Strophe.LogLevel.WARN);
        } else if (u.isErrorStanza(result)) {
            const err_msg = __(`Sorry, you're not allowed to retract this message.`);
            api.alert('error', __('Error'), err_msg);
            log(err_msg, Strophe.LogLevel.WARN);
            log(result, Strophe.LogLevel.WARN);
        }
    }

    async onMUCMessageRetractButtonClicked () {
        const retraction_warning = __(
            'Be aware that other XMPP/Jabber clients (and servers) may ' +
            'not yet support retractions and that this this.model may not ' +
            'be removed everywhere.'
        );

        if (this.model.mayBeRetracted()) {
            const messages = [__('Are you sure you want to retract this this.model?')];
            if (api.settings.get('show_retraction_warning')) {
                messages[1] = retraction_warning;
            }
            if (await api.confirm(__('Confirm'), messages)) {
                const chatbox = this.model.collection.chatbox;
                chatbox.retractOwnMessage(this.model);
            }
        } else if (await this.model.mayBeModerated()) {
            if (this.model.get('sender') === 'me') {
                let messages = [__('Are you sure you want to retract this this.model?')];
                if (api.settings.get('show_retraction_warning')) {
                    messages = [messages[0], retraction_warning, messages[1]];
                }
                !!(await api.confirm(__('Confirm'), messages)) && this.retractOtherMessage();
            } else {
                let messages = [
                    __('You are about to retract this this.model.'),
                    __('You may optionally include a this.model, explaining the reason for the retraction.')
                ];
                if (api.settings.get('show_retraction_warning')) {
                    messages = [messages[0], retraction_warning, messages[1]];
                }
                const reason = await api.prompt(__('this.model Retraction'), messages, __('Optional reason'));
                reason !== false && this.retractOtherMessage(reason);
            }
        } else {
            const err_msg = __(`Sorry, you're not allowed to retract this this.model`);
            api.alert('error', __('Error'), err_msg);
        }
    }

    onMessageRetractButtonClicked (ev) {
        ev.preventDefault();
        const chatbox = this.model.collection.chatbox;
        if (chatbox.get('type') === _converse.CHATROOMS_TYPE) {
            this.onMUCMessageRetractButtonClicked();
        } else {
            this.onDirectMessageRetractButtonClicked();
        }
    }

    async getActionButtons () {
        const buttons = [];
        if (this.editable) {
            buttons.push({
                'i18n_text': this.correcting ? __('Cancel Editing') : __('Edit'),
                'handler': ev => this.onMessageEditButtonClicked(ev),
                'button_class': 'chat-msg__action-edit',
                'icon_class': 'fa fa-pencil-alt',
                'name': 'edit'
            });
        }
        const may_be_moderated = this.model.get('type') === 'groupchat' && await this.model.mayBeModerated();
        const retractable = !this.is_retracted && (this.model.mayBeRetracted() || may_be_moderated);
        if (retractable) {
            buttons.push({
                'i18n_text': __('Retract'),
                'handler': ev => this.onMessageRetractButtonClicked(ev),
                'button_class': 'chat-msg__action-retract',
                'icon_class': 'fas fa-trash-alt',
                'name': 'retract'
            });
        }
        /**
         * *Hook* which allows plugins to add more message action buttons
         * @event _converse#getMessageActionButtons
         * @example
         *  api.listen.on('getMessageActionButtons', (el, buttons) => {
         *      buttons.push({
         *          'i18n_text': 'Foo',
         *          'handler': ev => alert('Foo!'),
         *          'button_class': 'chat-msg__action-foo',
         *          'icon_class': 'fa fa-check',
         *          'name': 'foo'
         *      });
         *      return buttons;
         *  });
         */
        return api.hook('getMessageActionButtons', this, buttons);
    }
}

api.elements.define('converse-message-actions', MessageActions);
