(function ($) {
  'use strict'; // Strict Standards.

  var slack = {}; // Initialize object container.

  slack.init = function () // Initializer.
  {
    slack.escHtml = slack.escAttr = function (str) {
      str = String(str); // Force string.
      str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return str.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    };

    slack.plainText = function (str) {
      str = String(str); // Force string.
      var lineBreak = '___lineBreakToken___';
      var lineBreakRegex = new RegExp(lineBreak, 'g');

      str = str.replace(/[<]br(?:\s*\/)?[>]/ig, lineBreak);
      str = str.replace(/<p(?:\s+[^>]*)?>(.*?)<\/p>/ig, lineBreak + '$1' + lineBreak);
      str = str.replace(/<span class="para_break">(.*?)<\/span>/ig, lineBreak + '$1' + lineBreak);
      str = $('<div>').html(str).text().replace(lineBreakRegex, '\n');

      str = str.replace(/^\s*\n/mg, '\n');
      return $.trim(str.replace(/\n{3,}/g, '\n\n'));
    };

    slack.midClip = function (str, maxLength, separator) {
      maxLength = maxLength || 200;
      separator = separator || ' [...] ';

      if (str.length <= maxLength) return str;

      var frontChars = Math.ceil((maxLength - separator.length) / 2),
        backChars = Math.floor((maxLength - separator.length) / 2);

      return str.substr(0, frontChars) + separator + str.substr(str.length - backChars);
    };

    slack.midClipLines = function (str, maxLength, separator) {
      var lines = str.split(/[\r\n]/);

      lines.forEach(function (line, index) {
        lines[index] = slack.midClip(line, maxLength, separator);
      });
      return lines.join('\n');
    };

    slack.getWinSelection = function () {
      var selection = getSelection(); // Current selection.
      if (!selection.rangeCount) return; // Not possible.

      for (var $container = $('<div>'), i = 0, length = selection.rangeCount; i < length; i++) {
        $container.append(selection.getRangeAt(i).cloneContents());
      }
      return slack.plainText($container.html());
    };

    slack.getWinSelectionParent = function () {
      var selection = getSelection(); // Current selection.
      if (!selection.rangeCount) return; // Not possible.

      return selection.getRangeAt(0).endContainer;
    };

    slack.moveMsgCursorToEnd = function () {
      slack.$msg[0].focus(); // Editable focus.

      var range = document.createRange(),
        selection = getSelection();

      range.selectNodeContents(slack.$msg[0]), range.collapse(false);
      selection.removeAllRanges(), selection.addRange(range);
    };

    slack.scrollToMsgBottom = function () {
      slack.$msg[0].scrollTop = slack.$msg[0].scrollHeight;
    };

    slack.sendMsgInputEventForAutosizing = function () {
      var event = document.createEvent('HTMLEvents');
      event.initEvent('input', true, true);
      slack.$msg[0].dispatchEvent(event);
    };

    slack.appendMsgText = function (text) {
      text = String(text); // Force string.
      var curLength = $.trim(slack.$msg.text()).length;
      text = curLength ? '\n\n' + text : text;

      slack.moveMsgCursorToEnd();
      document.execCommand('insertText', false, text);

      slack.sendMsgInputEventForAutosizing();
      slack.scrollToMsgBottom();
    };

    slack.winSelectionTimestamp = function () {
      var $winSelectionParent = $(slack.getWinSelectionParent());
      var $message = $winSelectionParent.closest('.message');
      return String($message.find('a.timestamp').prop('href') || '');
    };

    slack.winSelectionMentionName = function () {
      var $winSelectionParent = $(slack.getWinSelectionParent());
      var $messageFirst, _teamOrService, teamMember, serviceName;

      $messageFirst = $winSelectionParent.closest('.message.first');

      if (!$messageFirst.length) { // In case of message that is NOT the `.first` itself.
        $messageFirst = $winSelectionParent.closest('.message').prevAll('.message.first').first();
      }
      if ($messageFirst.length && (_teamOrService = $messageFirst.find('[data-member-id][target^="/team/"]').attr('target'))) {
        teamMember = _teamOrService.replace(/^\/team\//ig, '');

      } else if ($messageFirst.length && (_teamOrService = $messageFirst.find('.message_sender [target^="/services/"]').html())) {
        serviceName = slack.plainText(_teamOrService);

      } else if ($messageFirst.length && (_teamOrService = $messageFirst.find('.message_sender').html())) {
        serviceName = slack.plainText(_teamOrService);
      }

      if (teamMember) {
        return '@' + teamMember;
      } else if (serviceName) {
        // Map known service→member translations.
        // Service names = e.g., GitHub, iDoneThis, etc.
        switch (serviceName.toLowerCase().split(/\svia\s/)[0]) {
          case 'jaswsinc':
          case 'jason caldwell':
            return '@jaswsinc';

          case 'raamdev':
          case 'raam dev':
            return '@raamdev';

          case 'elizwsinc':
          case 'elizabeth caldwell':
            return '@elizwsinc';

          case 'kristineds':
          case 'kristine ds':
          case 'kristine delos-santos':
          case 'kristine delos santos':
            return '@kristineds';

          case 'renzms':
          case 'renz ms':
          case 'renz sevilla':
            return '@renzms';
        }
        return serviceName;
      }
      return 'Someone'; // Default behavior.
    };

    $('body').on('keydown', function (event) {
      if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || event.which !== 82) {
        return; // Not the `R` key by itself; nothing to do in this case.
      }
      var winSelection; // Initialize.

      if (!(winSelection = slack.getWinSelection())) {
        return; // No selection.
      }
      event.stopImmediatePropagation();
      event.preventDefault();
    });

    $('body').on('keyup', function (event) {
      if (event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || event.which !== 82) {
        return; // Not the `R` key by itself; nothing to do in this case.
      }
      var winSelection; // Initialize.

      if (!(winSelection = slack.getWinSelection())) {
        return; // No selection.
      }
      event.stopImmediatePropagation();
      event.preventDefault();

      var reply = $.trim(slack.winSelectionMentionName()) + ' writes... `' + slack.winSelectionTimestamp() + '`\n';
      reply += slack.midClipLines(winSelection).replace(/^/mg, '> ');
      reply += '\n:re: ';

      slack.appendMsgText(reply);
    });
  };

  slack.initializer = function () {
    if ((slack.$msg = $('#msg_input > [contenteditable="true"]')).length) {
      clearInterval(slack.initializerInterval);
      slack.init(); // Initialize.
    }
  };

  slack.initializerInterval = setInterval(slack.initializer, 1000);
})(jQuery);
