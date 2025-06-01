// utils/createGist.js
import axios from 'axios';

const token = import.meta.env.VITE_GITHUB_TOKEN;

export async function createGist({ code, filename = 'main.dart' }) {
  try {
    const res = await axios.post(
      'https://api.github.com/gists',
      {
        description: 'Flutter UI Preview',
        public: false,
        files: {
          [filename]: {
            content: code
          }
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          Accept: 'application/vnd.github+json'
        }
      }
    );
    
    console.log(res.data);
    return res.data.id; // This is the gist ID
  } catch (err) {
    console.error('Failed to create gist:', err);
    return null;
  }
}
