var Current = {
    userId: ""
};

function elemScrolledToBottom($elem) {
    var element = $elem.get(0);
    return Math.ceil(element.scrollHeight - element.scrollTop) === element.clientHeight;
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : (void 0);
};

function getDomComputedWidth(el) {
    if(_.isUndefined(el) || el == null) {
        return 0;
    }

    return el.clientWidth;
};