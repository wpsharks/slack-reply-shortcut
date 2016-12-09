(function ($) {
  'use strict'; // Strict Standards.

  var slack = {}; // Initialize object container.

  slack.init = function () // Initializer.
    {
      slack.escHtml = slack.escAttr = function (string) {
        string = String(string);

        if (/[&<>"']/.test(string)) {
          string = string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          string = string.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        }
        return string;
      };

      slack.plainText = function (string) {
        string = String(string);

        var lineBreak = '___lineBreak___',
          lineBreakedHtml = string;

        lineBreakedHtml = string.replace(/[<]br(?:\s*\/)?[>]/gi, lineBreak);
        lineBreakedHtml = lineBreakedHtml.replace(/<p(?:\s+[^>]*)?>(.*?)<\/p>/gi, lineBreak + '$1' + lineBreak);

        return $.trim($('<div>').html(lineBreakedHtml).text().replace(new RegExp(lineBreak, 'g'), '\n'));
      };

      slack.getWinSelection = function () {
        var selection = getSelection();

        if (!selection.rangeCount) {
          return; // No selection.
        }
        var $container = $('<div>'); // Holds the selection.

        for (var i = 0, length = selection.rangeCount; i < length; i++) {
          $container.append(selection.getRangeAt(i).cloneContents());
        }
        return slack.plainText($container.html());
      };

      slack.getWinSelectionParent = function () {
        var selection = getSelection();

        if (!selection.rangeCount) {
          return; // No selection.
        }
        return selection.getRangeAt(0).endContainer;
      };

      slack.moveMsgCursorToEnd = function () {
        slack.$msg[0].scrollTop = slack.$msg[0].scrollHeight;
        slack.$msg[0].selectionStart = slack.$msg[0].selectionEnd = slack.$msg.val().length;
      };

      slack.sendMsgInputEventForAutosizing = function () {
        var event = document.createEvent('HTMLEvents');
        event.initEvent('input', true, true);
        slack.$msg[0].dispatchEvent(event);
      };

      slack.winSelectionParentMentionName = function () {
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
            //
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

        var val = $.trim(slack.$msg.val()),
          newVal = val; // Current value.

        newVal += '\n\n' + $.trim(slack.winSelectionParentMentionName()) + ' writes...\n';
        newVal += winSelection.replace(/^/gm, '> ');
        newVal = $.trim(newVal) + '\n:re: ';

        slack.$msg.val(newVal).focus();
        slack.moveMsgCursorToEnd();
        slack.sendMsgInputEventForAutosizing();
      });
    };

  slack.initializer = function () {
    if ((slack.$msg = $('#message-input')).length) {
      clearInterval(slack.initializerInterval);
    }
    slack.init(); // Initialize.
  };

  slack.initializerInterval = setInterval(slack.initializer, 1000);
})(jQuery);
