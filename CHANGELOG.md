## v15.6.21

- Adding Lodash library to easier maintenance.

- Updated for compatibility w/ latest Slack UI changes.

- Preserve `<span class="para_break">` from Slack, allowing for double line breaks in selection.

- Automatically cleanup aggressive selections that may include HTML from the Slack UI, which previously led to massive reply content when a user was rushing to reply and mistakenly selected more than they intended to.

- Automatically mid-clip on a per-paragraph basis; e.g., `A very long [...] paragraph.`. This still allows for a multi-line selection and quote, but where each line in that selection is automatically clipped to avoid noisy quotes. The most common use case is where you select an entire paragraph written by someone else. That long paragraph is now automatically mid-clipped in your reply to prevent you from needing to do it manually.

- Automatically include a link back to the original timestamped message that is being quoted.

- Allow for multiple quotes, one following the other, each with a link back to the original message.
