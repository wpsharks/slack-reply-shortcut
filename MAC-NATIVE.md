# Using 'Slack Reply Shortcut' in Native Mac App

## Close Existing Application Instance

Exit Slack.app so you can take a slightly different approach.

## Create a New Slack Command

Save this file in your `$PATH`; e.g., `/usr/local/bin/slack`. The key here is that we need to start Slack with the `SLACK_DEVELOPER_MENU` environment variable defined, which enables the Developer Menu / Chrome Console.

```bash
#!/usr/bin/env bash
SLACK_DEVELOPER_MENU=1 /Applications/Slack.app/Contents/MacOS/Slack &>/dev/null &
```

And then make the file executable.

```bash
$ chmod +x /usr/local/bin/slack;
```

## Start Slack From Command Line

```bash
$ slack # This runs the command you just created.
```

## Open Developer Tools

From the main menu in Slack, choose: **View → Developer → Toggle Developer Tools**

When these tools open, you'll have **two** developer Consoles. One is in the right sidebar, and the other will simply open as a new window. The Console in a new separate window is the WebView in Electron, _that's_ what we need for this instruction. The one in the right sidebar is not needed in this case. You can close it.

## Enable Slack Reply Shortcut

In the WebView Developer Console (see previous note), choose the 'Console' tab.

_**Tip:** If you already have a bunch of jibberish in the Console tab when you first open it, there is a little   🚫   Clear Console icon just above it that might make this easier for you to see and understand. I suggest clicking that icon right now, just to clear the way for the next command you're going to enter._

Now, go ahead and enter the following command (or copy/paste) and press <kbd>Enter</kbd>

```js
$.getScript('https://cloudup.com/files/imO4PKwQCjN/download')
```

### Screenshot of Console Tab

![](https://cloudup.com/files/i4neVv7EO5F/download)

## Close Developer Console

You can close all developer console windows now.

## Test the Slack Reply Shortcut

Select some text in a message and press the <kbd>R</kbd> key.

## Caveat (Not Persistent)

When you exit Slack, the changes are lost. You'll need to repeat, starting from [this step](https://github.com/websharks/slack-reply-shortcut/wiki/_new#start-slack-from-command-line).
