/**
 * @typedef {import('shared/chat/message').default} Message
 */
import 'shared/avatar/avatar.js';
import 'shared/chat/unfurl.js';
import { __ } from 'i18n';
import { html } from "lit";
import { shouldRenderMediaFromURL } from '../../../utils/url.js';
import { getAuthorStyle } from '../../../utils/color.js';


/**
 * @param {Message} el
 * @param {Object} o
 */
export default (el, o) => {
    const i18n_new_messages = __('New messages');
    const is_followup = el.model.isFollowup();

    const contact = el.model.occupant || el.model.contact;
    const author_style = getAuthorStyle(contact);

    // The model to use for the avatar.
    // Note: it can happen that the contact has not the vcard attribute but the message has.
    const avatar_model = contact?.vcard ? contact : el.model

    return html`
        ${ o.is_first_unread ? html`<div class="message separator">
            <hr class="separator">
            <span class="separator-text">${ i18n_new_messages }</span>
        </div>` : '' }
        <div class="message chat-msg ${ el.getExtraMessageClasses() }"
                data-isodate="${o.time}"
                data-msgid="${o.msgid}"
                data-from="${o.from}"
                data-encrypted="${o.is_encrypted}">

            <!-- Anchor to allow us to scroll the message into view -->
            <a id="${o.msgid}"></a>

            ${ (o.should_show_avatar && !is_followup) ?
                html`<a class="show-msg-author-modal" @click=${el.showUserModal}>
                    <converse-avatar
                        .model=${avatar_model}
                        class="avatar align-self-center"
                        name="${el.model.getDisplayName()}"
                        nonce="${avatar_model.vcard?.get('vcard_updated')}"
                        height="40" width="40"></converse-avatar>
                </a>` : '' }

            <div class="chat-msg__content chat-msg__content--${o.sender} ${o.is_me_message ? 'chat-msg__content--action' : ''}">
                ${ (!o.is_me_message && !is_followup) ? html`
                    <span class="chat-msg__heading">
                        <span class="chat-msg__author">
                            <a class="show-msg-author-modal"
                               @click=${el.showUserModal}
                               style="${author_style}">${o.username}</a>
                        </span>
                        ${ o.hats.map(h => html`<span class="badge badge-secondary">${h.title}</span>`) }
                        <time timestamp="${el.model.get('edited') || el.model.get('time')}" class="chat-msg__time">${o.pretty_time}</time>
                        ${ o.is_encrypted ? html`<converse-icon class="fa fa-lock" size="1.1em"></converse-icon>` : '' }
                    </span>` : '' }

                <div class="chat-msg__body chat-msg__body--${o.message_type} ${o.received ? 'chat-msg__body--received' : '' } ${o.is_delayed ? 'chat-msg__body--delayed' : '' }">
                    <div class="chat-msg__message">
                        ${ (o.is_me_message) ? html`
                            <time timestamp="${o.edited || o.time}" class="chat-msg__time">${o.pretty_time}</time>&nbsp;
                            <span class="chat-msg__author" style="${author_style}">${ o.is_me_message ? '**' : ''}${o.username}</span>&nbsp;` : '' }
                        ${ o.is_retracted ? el.renderRetraction() : el.renderMessageText() }
                    </div>
                    <converse-message-actions
                        .model=${el.model}
                        ?is_retracted=${o.is_retracted}></converse-message-actions>
                </div>

                ${ el.model.get('ogp_metadata')?.map(m => {
                    if (el.model.get('hide_url_previews') === true) {
                        return '';
                    }
                    if (!shouldRenderMediaFromURL(m['og:image'], 'image')) {
                        return '';
                    }
                    return html`<converse-message-unfurl
                        @animationend="${el.onUnfurlAnimationEnd}"
                        class="${el.model.get('url_preview_transition')}"
                        jid="${el.chatbox?.get('jid')}"
                        description="${m['og:description'] || ''}"
                        title="${m['og:title'] || ''}"
                        image="${m['og:image'] || ''}"
                        url="${m['og:url'] || ''}"></converse-message-unfurl>` }) }
            </div>
        </div>`;
}
