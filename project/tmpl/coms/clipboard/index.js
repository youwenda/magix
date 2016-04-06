/*
    author:xinglie.lkf@taobao.com
 */
var Magix = require('magix');
var Select = function(element) {
    var selectedText;
    if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
        element.select();
        selectedText = element.value;
    } else {
        if (element.hasAttribute('contenteditable')) {
            element.focus();
        }
        var range;
        if (window.getSelection) {
            var selection = window.getSelection();
            range = document.createRange();

            range.selectNodeContents(element);
            selection.removeAllRanges();
            selection.addRange(range);
            selectedText = selection.toString();
        } else {
            range = document.selection.createRange();
            range.moveToElementText(element);
            range.select();
            selectedText = document.selection.createRange().text;
        }
    }
    return selectedText;
};

module.exports = {
    copy: function(nodeId) {
        var node = Magix.node(nodeId);
        var succeeded;
        if (node) {
            Select(node);
            try {
                succeeded = document.execCommand('copy');
            } catch (e) {
                succeeded = false;
            }
        }
        return succeeded;
    }
};