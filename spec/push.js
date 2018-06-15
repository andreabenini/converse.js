(function (root, factory) {
    define(["jasmine", "mock", "test-utils"], factory);
} (this, function (jasmine, mock, test_utils) {
    "use strict";
    var $iq = converse.env.$iq;
    var Strophe = converse.env.Strophe;
    var _ = converse.env._;

    describe("XEP-0357 Push Notifications", function () {

        it("can be enabled",
            mock.initConverseWithPromises(null,
                ['rosterGroupsFetched'], {
                    'push_app_servers': [{
                        'jid': 'push-5@client.example',
                        'node': 'yxs32uqsflafdk3iuqo'
                    }]
                }, function (done, _converse) {

            const IQ_stanzas = _converse.connection.IQ_stanzas;
            let stanza;

            expect(_converse.session.get('push_enabled')).toBeFalsy();

            test_utils.waitUntilDiscoConfirmed(
                _converse, _converse.push_app_servers[0].jid,
                [{'category': 'pubsub', 'type':'push'}],
                ['urn:xmpp:push:0'], [], 'info')
            .then(() => test_utils.waitUntilDiscoConfirmed(
                    _converse,
                    _converse.bare_jid,
                    [{'category': 'account', 'type':'registered'}],
                    ['urn:xmpp:push:0'], [], 'info'))
            .then(() => {
                return test_utils.waitUntil(() => {
                    const node = _.filter(IQ_stanzas, function (iq) {
                        return iq.nodeTree.querySelector('iq[type="set"] enable[xmlns="urn:xmpp:push:0"]');
                    }).pop();
                    if (node) {
                        stanza = node.nodeTree;
                        return true;
                    }
                })
            }).then(() => {
                expect(stanza.outerHTML).toEqual(
                    `<iq type="set" xmlns="jabber:client" id="${stanza.getAttribute('id')}">`+
                        '<enable xmlns="urn:xmpp:push:0" jid="push-5@client.example" node="yxs32uqsflafdk3iuqo"/>'+
                    '</iq>'
                )
                _converse.connection._dataRecv(test_utils.createRequest($iq({
                    'to': _converse.connection.jid,
                    'type': 'result',
                    'id': stanza.getAttribute('id')
                })));
                return test_utils.waitUntil(() => _converse.session.get('push_enabled'))
            }).then(() => {
                done();
            }).catch(_.partial(_converse.log, _, Strophe.LogLevel.FATAL));
        }));

        it("can be disabled",
            mock.initConverseWithPromises(null,
                ['rosterGroupsFetched'], {
                    'push_app_servers': [{
                        'jid': 'push-5@client.example',
                        'node': 'yxs32uqsflafdk3iuqo',
                        'disable': true
                    }]
                }, function (done, _converse) {

            const IQ_stanzas = _converse.connection.IQ_stanzas;
            let stanza;

            expect(_converse.session.get('push_enabled')).toBeFalsy();

            test_utils.waitUntilDiscoConfirmed(
                _converse,
                _converse.bare_jid,
                [{'category': 'account', 'type':'registered'}],
                ['urn:xmpp:push:0'], [], 'info')
            .then(() => {
                return test_utils.waitUntil(() => {
                    const node = _.filter(IQ_stanzas, function (iq) {
                        return iq.nodeTree.querySelector('iq[type="set"] disable[xmlns="urn:xmpp:push:0"]');
                    }).pop();
                    if (node) {
                        stanza = node.nodeTree;
                        return true;
                    }
                })
            }).then(() => {
                expect(stanza.outerHTML).toEqual(
                    `<iq type="set" xmlns="jabber:client" id="${stanza.getAttribute('id')}">`+
                        '<disable xmlns="urn:xmpp:push:0" jid="push-5@client.example" node="yxs32uqsflafdk3iuqo"/>'+
                    '</iq>'
                )
                _converse.connection._dataRecv(test_utils.createRequest($iq({
                    'to': _converse.connection.jid,
                    'type': 'result',
                    'id': stanza.getAttribute('id')
                })));
                return test_utils.waitUntil(() => _converse.session.get('push_enabled'))
            }).then(() => {
                done();
            }).catch(_.partial(_converse.log, _, Strophe.LogLevel.FATAL));
        }));


        it("can require a secret token to be included",
            mock.initConverseWithPromises(null,
                ['rosterGroupsFetched'], {
                    'push_app_servers': [{
                        'jid': 'push-5@client.example',
                        'node': 'yxs32uqsflafdk3iuqo',
                        'secret': 'eruio234vzxc2kla-91'
                    }]
                }, function (done, _converse) {

            const IQ_stanzas = _converse.connection.IQ_stanzas;
            let stanza;
            expect(_converse.session.get('push_enabled')).toBeFalsy();

            test_utils.waitUntilDiscoConfirmed(
                _converse, _converse.push_app_servers[0].jid,
                [{'category': 'pubsub', 'type':'push'}],
                ['urn:xmpp:push:0'], [], 'info')
            .then(() => test_utils.waitUntilDiscoConfirmed(
                    _converse,
                    _converse.bare_jid,
                    [{'category': 'account', 'type':'registered'}],
                    ['urn:xmpp:push:0'], [], 'info'))
            .then(() => {
                return test_utils.waitUntil(() => {
                    const node = _.filter(IQ_stanzas, function (iq) {
                        return iq.nodeTree.querySelector('iq[type="set"] enable[xmlns="urn:xmpp:push:0"]');
                    }).pop();
                    if (node) {
                        stanza = node.nodeTree;
                        return true;
                    }
                })
            }).then(() => {
                expect(stanza.outerHTML).toEqual(
                    `<iq type="set" xmlns="jabber:client" id="${stanza.getAttribute('id')}">`+
                        '<enable xmlns="urn:xmpp:push:0" jid="push-5@client.example" node="yxs32uqsflafdk3iuqo">'+
                            '<x xmlns="jabber:x:data" type="submit">'+
                                '<field var="FORM_TYPE"><value>http://jabber.org/protocol/pubsub#publish-options</value></field>'+
                                '<field var="secret"><value>eruio234vzxc2kla-91</value></field>'+
                            '</x>'+
                        '</enable>'+
                    '</iq>'
                )
                _converse.connection._dataRecv(test_utils.createRequest($iq({
                    'to': _converse.connection.jid,
                    'type': 'result',
                    'id': stanza.getAttribute('id')
                })));
                return test_utils.waitUntil(() => _converse.session.get('push_enabled'))
            }).then(() => {
                done();
            }).catch(_.partial(_converse.log, _, Strophe.LogLevel.FATAL));
        }));
    });
}));
