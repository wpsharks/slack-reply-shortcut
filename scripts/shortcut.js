(function($)
{
	'use strict'; // Strict Standards.

	var slack = {initialized: false}; // Object.

	slack.init = function() // Initializer.
	{
		if(slack.initialized) return; // Already done.

		slack.escHtml = slack.escAttr = function(string)
		{
			if(/[&\<\>"']/.test(string = String(string)))
				string = string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
					string = string.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
			return string;
		};
		slack.plainText = function(string)
		{
			var lineBreak = '___lineBreak___', // Preserve line breaks.
				lineBreakedHtml = String(string).replace(/\<br(?:\s*\/)?\>/gi, lineBreak)
					.replace(/<p(?:\s+[^>]*)?>(.*?)<\/p>/gi, lineBreak + '$1' + lineBreak);
			return $.trim($('<div>').html(lineBreakedHtml).text().replace(new RegExp(lineBreak, 'g'), '\n'));
		};
		slack.getWinSelection = function()
		{
			var selection = getSelection();

			if(!selection.rangeCount)
				return; // No selection.

			var $container = $('<div>'); // Holds the selection.
			for(var i = 0, length = selection.rangeCount; i < length; i++)
				$container.append(selection.getRangeAt(i).cloneContents());

			return slack.plainText($container.html());
		};
		slack.getWinSelectionParent = function()
		{
			var selection = getSelection();

			if(!selection.rangeCount)
				return; // No selection.

			return selection.getRangeAt(0).endContainer;
		};
		slack.moveMsgCursor2End = function()
		{
			slack.$msg[0].scrollTop = slack.$msg[0].scrollHeight; // Scroll to bottom.
			slack.$msg[0].selectionStart = slack.$msg[0].selectionEnd = slack.$msg.val().length;
		};
		slack.winSelectionParentMentionName = function()
		{
			var teamMember = $(slack.getWinSelectionParent()).closest('div.message')
				.find('> a[data-member-id][target^="/team/"]').first().attr('target');
			if(teamMember) return '@' + teamMember.replace(/^\/team\//ig, '');

			var serviceName = $(slack.getWinSelectionParent()).closest('div.message')
				.find('> span.message_sender > a[target^="/services/"]').html();
			if(serviceName) return slack.plainText(serviceName);

			return '@[unknown]'; // Default behavior.
		};
		$('body').on___('keydown', function(event)
		{
			if(event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || event.which !== 82)
				return; // Not the `R` key by itself; nothing to do in this case.

			var winSelection = slack.getWinSelection();
			if(!winSelection) return; // No selection.

			event.stopImmediatePropagation(), // Stop other event handlers.
				event.preventDefault(); // Prevent default behavior.
		});
		$('body').on___('keyup', function(event)
		{
			if(event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || event.which !== 82)
				return; // Not the `R` key by itself; nothing to do in this case.

			var winSelection = slack.getWinSelection();
			if(!winSelection) return; // No selection.

			event.stopImmediatePropagation(), // Stop other event handlers.
				event.preventDefault(); // Prevent default behavior.

			var val = $.trim(slack.$msg.val()),
				newVal = val; // Start w/ current value.

			newVal += '\n\n' + $.trim(slack.winSelectionParentMentionName()) + ' writes...\n';
			newVal += winSelection.replace(/^/gm, '> ');
			newVal = $.trim(newVal) + '\n---- ';

			slack.$msg.val(newVal), slack.$msg.focus(), slack.moveMsgCursor2End();
		});
	};
	slack.initializer = function()
	{
		if((slack.$msg = $('textarea#message-input')).length)
			clearInterval(slack.initializerInterval), slack.init(),
				slack.initialized = true; // All set now :-)
	};
	slack.initializerInterval = setInterval(slack.initializer, 1000);

	$.fn.on___ = function(name, fn)
	{
		this.on(name, fn), this.each( // This handler first!
			function() // Move this handler to the top of the stack.
			{
				var handlers = $._data(this, 'events')[name.split('.')[0]];
				var handler = handlers.pop();
				handlers.splice(0, 0, handler);
			});
	};
})(jQuery);