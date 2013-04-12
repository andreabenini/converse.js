(function (root, factory) {
    define([
        "converse"
        ], function (xmppchat) {
            return factory(xmppchat);
        }
    );
} (this, function (xmppchat) {

    return describe("Converse.js", $.proxy(function() {
        // Names from http://www.fakenamegenerator.com/
        names = [
            'Louw Spekman', 'Mohamad Stet', 'Dominik Beyer', 'Dirk Eichel', 'Marco Duerr', 'Ute Schiffer',
            'Billie Westerhuis', 'Sarah Kuester', 'Sabrina Loewe', 'Laura Duerr', 'Mathias Meyer',
            'Tijm Keller', 'Lea Gerste', 'Martin Pfeffer', 'Ulrike Abt', 'Zoubida van Rooij',
            'Maylin Hettema', 'Ruwan Bechan', 'Marco Beich', 'Karin Busch', 'Mathias Müller',
            'Suleyman van Beusichem', 'Nicole Diederich', 'Nanja van Yperen', 'Delany Bloemendaal',
            'Jannah Hofmeester', 'Christine Trommler', 'Martin Bumgarner', 'Emil Baeten', 'Farshad Brasser',
            'Gabriele Fisher', 'Sofiane Schopman', 'Sky Wismans', 'Jeffery Stoelwinder', 'Ganesh Waaijenberg',
            'Dani Boldewijn', 'Katrin Propst', 'Martina Kaiser', 'Philipp Kappel', 'Meeke Grootendorst',
            'Max Frankfurter', 'Candice van der Knijff', 'Irini Vlastuin', 'Rinse Sommer', 'Annegreet Gomez',
            'Robin Schook', 'Marcel Eberhardt', 'Simone Brauer', 'Asmaa Haakman', 'Felix Amsel',
            'Lena Grunewald', 'Laura Grunewald', 'Mandy Seiler', 'Sven Bosch', 'Nuriye Cuypers', 'Ben Zomer',
            'Leah Weiss', 'Francesca Disseldorp', 'Sven Bumgarner', 'Benjamin Zweig'
        ];
        mock_connection  = {
            'muc': {
                'listRooms': function () {}
            }
        };
        this.prebind = true;
        this.connection = mock_connection;
        this.chatboxes = new this.ChatBoxes();
        this.chatboxesview = new this.ChatBoxesView({model: this.chatboxes});
        this.roster = new this.RosterItems();
        // Clear localStorage
        var key = hex_sha1('converse.rosteritems-dummy@localhost');
        window.localStorage.removeItem(key);
        this.roster.localStorage = new Backbone.LocalStorage(key);

        this.chatboxes.onConnected();
        this.rosterview = new this.RosterView({'model':this.roster});
        this.rosterview.render();

        describe("The contacts roster", $.proxy(function () {

            // by default the dts are hidden from css class and only later they will be hidden
            // by jQuery therefore for the first check we will see if visible instead of none
            it("hides the requesting contacts heading if there aren't any", $.proxy(function () {
                expect(this.rosterview.$el.find('dt#xmpp-contact-requests').is(':visible')).toEqual(false);
            }, xmppchat));

            it("hides the current contacts heading if there aren't any", $.proxy(function () {
                expect(this.rosterview.$el.find('dt#xmpp-contacts').css('display')).toEqual('none');
            }, xmppchat));

            it("hides the pending contacts heading if there aren't any", $.proxy(function () {
                expect(this.rosterview.$el.find('dt#pending-xmpp-contacts').css('display')).toEqual('none');
            }, xmppchat));

            it("can add requesting contacts, and they should be sorted alphabetically", $.proxy(function () {
                var i, t;
                spyOn(this.rosterview, 'render').andCallThrough();
                spyOn(this, 'showControlBox');
                for (i=0; i<10; i++) {
                    this.roster.create({
                        jid: names[i].replace(' ','.').toLowerCase() + '@localhost',
                        subscription: 'none',
                        ask: 'request',
                        fullname: names[i],
                        is_last: i<9
                    });
                    expect(this.rosterview.render).toHaveBeenCalled();
                    // Check that they are sorted alphabetically
                    t = this.rosterview.$el.find('dt#xmpp-contact-requests').siblings('dd.requesting-xmpp-contact').text().replace(/AcceptDecline/g, '');
                    expect(t).toEqual(names.slice(0,i+1).sort().join(''));
                    // When a requesting contact is added, the controlbox must
                    // be opened.
                    expect(this.showControlBox).toHaveBeenCalled();
                }
            }, xmppchat));

            it("shows the requesting contacts heading after they have been added", $.proxy(function () {
                expect(this.rosterview.$el.find('dt#xmpp-contact-requests').css('display')).toEqual('block');
            }, xmppchat));

            it("can add pending contacts, and they should be sorted alphabetically", $.proxy(function () {
                var i, t;
                spyOn(this.rosterview, 'render').andCallThrough();
                for (i=10; i<20; i++) {
                    this.roster.create({
                        jid: names[i].replace(' ','.').toLowerCase() + '@localhost',
                        subscription: 'none',
                        ask: 'subscribe',
                        fullname: names[i],
                        is_last: i<20
                    });
                    expect(this.rosterview.render).toHaveBeenCalled();
                    // Check that they are sorted alphabetically
                    t = this.rosterview.$el.find('dt#pending-xmpp-contacts').siblings('dd.pending-xmpp-contact').text();
                    expect(t).toEqual(names.slice(10,i+1).sort().join(''));
                }
            }, xmppchat));

            it("shows the pending contacts heading after they have been added", $.proxy(function () {
                expect(this.rosterview.$el.find('dt#pending-xmpp-contacts').css('display')).toEqual('block');
            }, xmppchat));

            it("can add existing contacts, and they should be sorted alphabetically", $.proxy(function () {
                var i, t;
                spyOn(this.rosterview, 'render').andCallThrough();
                // Add 40 properly regisertered contacts (initially all offline) and check that they are sorted alphabetically
                for (i=20; i<60; i++) {
                    this.roster.create({
                        jid: names[i].replace(' ','.').toLowerCase() + '@localhost',
                        subscription: 'both',
                        ask: null,
                        fullname: names[i],
                        is_last: i<60
                    });
                    expect(this.rosterview.render).toHaveBeenCalled();
                    // Check that they are sorted alphabetically
                    t = this.rosterview.$el.find('dt#xmpp-contacts').siblings('dd.current-xmpp-contact.offline').find('a.open-chat').text();
                    expect(t).toEqual(names.slice(20,i+1).sort().join(''));
                }
            }, xmppchat));

            it("shows the current contacts heading if they have been added", $.proxy(function () {
                expect(this.rosterview.$el.find('dt#xmpp-contacts').css('display')).toEqual('block');
            }, xmppchat));

            describe("roster items", $.proxy(function () {

                it("are saved to, and can be retrieved from, localStorage", $.proxy(function () {
                    var new_attrs, old_attrs, attrs, old_roster;

                    expect(this.roster.length).toEqual(60);
                    old_roster = this.roster;
                    this.roster = new this.RosterItems();
                    expect(this.roster.length).toEqual(0);

                    this.roster.localStorage = new Backbone.LocalStorage(
                        hex_sha1('converse.rosteritems-dummy@localhost'));
                    this.chatboxes.onConnected();

                    spyOn(this.roster, 'fetch').andCallThrough();
                    this.rosterview = new this.RosterView({'model':this.roster});
                    expect(this.roster.fetch).toHaveBeenCalled();
                    expect(this.roster.length).toEqual(60);

                    // Check that the roster items retrieved from localStorage
                    // have the same attributes values as the original ones.
                    attrs = ['jid', 'fullname', 'subscription', 'ask'];
                    for (i=0; i<attrs.length; i++) {
                        new_attrs = _.pluck(_.pluck(this.roster.models, 'attributes'), attrs[i]);
                        old_attrs = _.pluck(_.pluck(old_roster.models, 'attributes'), attrs[i]);
                        expect(_.isEqual(new_attrs, old_attrs)).toEqual(true);
                    }
                    this.rosterview.render();
                }, xmppchat));

                it("can change their status to online and be sorted alphabetically", $.proxy(function () {
                    var item, view, jid, t;
                    spyOn(this.rosterview, 'render').andCallThrough();
                    for (i=59; i>54; i--) {
                        jid = names[i].replace(' ','.').toLowerCase() + '@localhost';
                        view = this.rosterview.rosteritemviews[jid];
                        spyOn(view, 'render').andCallThrough();
                        item = view.model;
                        item.set('chat_status', 'online');
                        expect(view.render).toHaveBeenCalled();
                        expect(this.rosterview.render).toHaveBeenCalled();

                        // Check that they are sorted alphabetically
                        t = this.rosterview.$el.find('dt#xmpp-contacts').siblings('dd.current-xmpp-contact.online').find('a.open-chat').text();
                        expect(t).toEqual(names.slice(-(60-i)).sort().join(''));
                    }
                }, xmppchat));

                it("can change their status to busy and be sorted alphabetically", $.proxy(function () {
                    var item, view, jid, t;
                    spyOn(this.rosterview, 'render').andCallThrough();
                    for (i=54; i>49; i--) {
                        jid = names[i].replace(' ','.').toLowerCase() + '@localhost';
                        view = this.rosterview.rosteritemviews[jid];
                        spyOn(view, 'render').andCallThrough();
                        item = view.model;
                        item.set('chat_status', 'dnd');
                        expect(view.render).toHaveBeenCalled();
                        expect(this.rosterview.render).toHaveBeenCalled();
                        // Check that they are sorted alphabetically
                        t = this.rosterview.$el.find('dt#xmpp-contacts').siblings('dd.current-xmpp-contact.dnd').find('a.open-chat').text();
                        expect(t).toEqual(names.slice(-(60-i), -5).sort().join(''));
                    }
                }, xmppchat));

                it("can change their status to away and be sorted alphabetically", $.proxy(function () {
                    var item, view, jid, t;
                    spyOn(this.rosterview, 'render').andCallThrough();
                    for (i=49; i>44; i--) {
                        jid = names[i].replace(' ','.').toLowerCase() + '@localhost';
                        view = this.rosterview.rosteritemviews[jid];
                        spyOn(view, 'render').andCallThrough();
                        item = view.model;
                        item.set('chat_status', 'away');
                        expect(view.render).toHaveBeenCalled();
                        expect(this.rosterview.render).toHaveBeenCalled();

                        // Check that they are sorted alphabetically
                        t = this.rosterview.$el.find('dt#xmpp-contacts').siblings('dd.current-xmpp-contact.away').find('a.open-chat').text();
                        expect(t).toEqual(names.slice(-(60-i),-10).sort().join(''));
                    }
                }, xmppchat));

                it("can change their status to unavailable and be sorted alphabetically", $.proxy(function () {
                    var item, view, jid, t;
                    spyOn(this.rosterview, 'render').andCallThrough();
                    for (i=44; i>39; i--) {
                        jid = names[i].replace(' ','.').toLowerCase() + '@localhost';
                        view = this.rosterview.rosteritemviews[jid];
                        spyOn(view, 'render').andCallThrough();
                        item = view.model;
                        item.set('chat_status', 'unavailable');
                        expect(view.render).toHaveBeenCalled();
                        expect(this.rosterview.render).toHaveBeenCalled();

                        // Check that they are sorted alphabetically
                        t = this.rosterview.$el.find('dt#xmpp-contacts').siblings('dd.current-xmpp-contact.unavailable').find('a.open-chat').text();
                        expect(t).toEqual(names.slice(-(60-i), -15).sort().join(''));
                    }
                }, xmppchat));

                it("are ordered according to status: online, busy, away, unavailable, offline", $.proxy(function () {
                    var contacts = this.rosterview.$el.find('dd.current-xmpp-contact');
                    var i;
                    // The first five contacts are online.
                    for (i=0; i<5; i++) {
                        expect($(contacts[i]).attr('class').split(' ',1)[0]).toEqual('online');
                    }
                    // The next five are busy
                    for (i=5; i<10; i++) {
                        expect($(contacts[i]).attr('class').split(' ',1)[0]).toEqual('dnd');
                    }
                    // The next five are away
                    for (i=10; i<15; i++) {
                        expect($(contacts[i]).attr('class').split(' ',1)[0]).toEqual('away');
                    }
                    // The next five are unavailable
                    for (i=15; i<20; i++) {
                        expect($(contacts[i]).attr('class').split(' ',1)[0]).toEqual('unavailable');
                    }
                    // The next 20 are offline
                    for (i=20; i<40; i++) {
                        expect($(contacts[i]).attr('class').split(' ',1)[0]).toEqual('offline');
                    }
                }, xmppchat));
            }, xmppchat));
        }, xmppchat));

        describe("Chatboxes", $.proxy(function () {
            it("are created when you click on a roster item", $.proxy(function () {
                var $el = $(this.rosterview.$el.find('dt#xmpp-contacts').siblings('dd.current-xmpp-contact.online').find('a.open-chat')[0]);
                var click = jQuery.Event("click", { target: $el });
                var jid = $el.text().replace(' ','.').toLowerCase() + '@localhost';
                var view = this.rosterview.rosteritemviews[jid];
                spyOn(view, 'openChat');
                // We need to rebind all events otherwise our spy won't work.
                view.delegateEvents();
                var ev = $el.click();
                expect(view.openChat).toHaveBeenCalled();
            }, xmppchat));
        }, xmppchat));

    }, xmppchat));
}));
