enum ChatServicePermission {
  NONE = 0,
  // Create a link which invites users to a channel.
  INVITATION_LINK = 8,
  // Rename or delete a channel.
  CHANNEL_METADATA = 32,
  // Set permissions of a channel.
  PERMISSION = 1024,
  VIEW = 2048,
}

export default ChatServicePermission;
