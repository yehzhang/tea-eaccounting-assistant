import getAuthClient from './getAuthClient';

async function grantPermission(fileId: string): Promise<boolean> {
  try {
    await getAuthClient().request({
      url: `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      method: 'POST',
      data: {
        role: 'writer',
        type: 'anyone',
      },
    });
    return true;
  } catch (e) {
    console.error('Unexpected error when granting permission', e);
    return false;
  }
}

export default grantPermission;
