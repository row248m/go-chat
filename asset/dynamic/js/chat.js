var ChatJS = (function() {
    function ChatJS() {
        this.$container = $('.chat-container');
        this.lastLoadedMessageId = 0;
        this.messageLoadLimit = 10;
        this.loadedCompletely = false;

        this.scroller = null;

        // WebSocket
        this.ws = null;
    }

    ChatJS.prototype.init = function() {
        var self = this;

        // events
        this.$container.find('.send-new-message-block').keydown(function(e) {
            if (e.keyCode == 13 /*Enter*/) {
                self.sendMessage($(e.target));
                e.preventDefault();
            }
        });

        this.scroller = new CommonScrollJS(this.$container.find('.messages-block-container'), function() {
            return self.$container.height() - self.$container.find('.send-new-message-block').outerHeight();
        });
        this.scroller.addOnScrollHandler('pagination', $.proxy(this.onScroll, this));

        // Load first chunk of messages
        this.loadMessages();

        this.initWS();
    };

    ChatJS.prototype.sendMessage = function($input) {
        var self = this;
        var text = $input.val();

        AjaxJS.simpleRequest('/chat/ajax/addMessage', {text: text});
        $input.val("");
    };

    ChatJS.prototype.addMessageToBlock = function(messageObj, toAppend) {
        var date = new Date(messageObj.CreatedDate);

        var html = Mustache.render(TemplateJS.chatMessage, {
            isMine: Current.userId == messageObj.UserID,
            avatarUrl: this.getAvatarLink(messageObj.UserID),
            messageId: messageObj.ID,
            message: messageObj.Message,
            isSystem: messageObj.IsSystem,
            date: dateFormat(date, "H:MM")
        });

        var $newMessageBlock = $(html);
        if (toAppend) {
            this.$container.find('.message-list').append($newMessageBlock);
        }
        else {
            this.$container.find('.message-list').prepend($newMessageBlock);
        }

        return $newMessageBlock;
    };

    ChatJS.prototype.loadMessages = function() {
        var self = this;

        AjaxJS.simpleRequest('/chat/ajax/selectMessages', {
            fromId: this.lastLoadedMessageId,
            limit: this.messageLoadLimit
        }, function(resp) {
           _.each(resp.messages, function(msg) {
               self.addMessageToBlock(msg, false);
           });

           // First load - scroll to bottom
           if (self.lastLoadedMessageId == 0) {
               self.scroller.scrollToBlock(self.$container.find('.message-block:last'));
           }

           if (!_.isEmpty(resp.messages)) {
               self.lastLoadedMessageId = _.last(resp.messages).ID;
           }
           else {
               self.loadedCompletely = true;
           }
        });
    };

    ChatJS.prototype.getOnline = function() {
        var self = this;

        AjaxJS.simpleRequest('/chat/ajax/getOnline', {}, function(resp) {
            self.$container.find('.user-list-online ul').empty();

            _.each(resp.users, function(id) {
                var $avatar = $('<img>', {
                    src: self.getAvatarLink(id),
                    class: 'avatar'
                });

                self.$container.find('.user-list-online ul').append($avatar);
                $avatar.wrap('<li>');
            });
        })
    };

    ChatJS.prototype.onScroll = function(topOffset, isAtTop, isAtBottom) {
        if (!this.loadedCompletely && topOffset < 100) {
            this.loadMessages();
        }
    };

    ChatJS.prototype.initWS = function() {
        var self = this;
        this.ws = new WebSocket("ws://" + document.location.host + "/chat/ws");

        this.ws.onmessage = function(e) {
            console.log("onmessage", e);

            try {
                var data = JSON.parse(e.data);
            }
            catch (e) {
                debugger;
            }
            switch (data.event) {
                case 'newMessage':
                    var $msgBlockContainer = self.$container.find('.messages-block-container');
                    var needScroll = false;
                    if (elemScrolledToBottom($msgBlockContainer)) {
                        needScroll = true;
                    }

                    var $newMessageBlock = self.addMessageToBlock(data.data, true);
                    if (needScroll) {
                        self.scroller.scrollToBlock($newMessageBlock);
                    }
                    break;
                case 'onlineChanged':
                    self.getOnline();
                    break;
            }
        };

        this.ws.onopen = function(e) {
            console.log("onopen", e);
        };

        this.ws.onerror = function(e) {
            console.log("onerror", e);
        };

        this.ws.onclose = function(e) {
            console.log("onclose", e);
        };
    };

    ChatJS.prototype.getAvatarLink = function(userId) {
        return 'static/avatar/' + userId + '.jpg'
    };

    return ChatJS;
})();