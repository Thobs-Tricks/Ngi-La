// POST /media/upload — uploads one image (jpg/jpeg/png/webp/gif, <=10MB) and returns its
// Cloudinary URL. Call once per photo, then pass the returned URLs to upsertMyProfile.
import { apiClient } from './client';

interface UploadResponse {
  url: string;
  resourceType: string;
}

/** uri is a local file:// (or content://) URI from expo-image-picker - never a remote URL
 * already, since there'd be nothing to upload. */
export async function uploadImage(uri: string, accessToken: string): Promise<string> {
  const filename = uri.split('/').pop() || `photo-${Date.now()}.jpg`;
  const extension = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  // Falls back to jpeg for anything unrecognised (including a content:// URI with no extension
  // at all) - the API now accepts by Content-Type too and transcodes every upload to jpg
  // server-side, so this only needs to be a reasonable guess, not exact.
  const mimeType =
    extension === 'png' ? 'image/png'
    : extension === 'webp' ? 'image/webp'
    : extension === 'gif' ? 'image/gif'
    : extension === 'heic' ? 'image/heic'
    : extension === 'heif' ? 'image/heif'
    : 'image/jpeg';

  const form = new FormData();
  // React Native's fetch accepts this {uri, name, type} shape for a file part - it is not a
  // real Blob, but RN's FormData polyfill knows how to stream it.
  form.append('file', { uri, name: filename, type: mimeType } as unknown as Blob);

  const data = await apiClient.upload<UploadResponse>('/media/upload', form, accessToken);
  return data.url;
}

/** Uploads only the URIs that are still local (skips ones already hosted, e.g. an existing
 * photo the vendor didn't change), preserving order. */
export async function uploadNewImages(uris: string[], accessToken: string): Promise<string[]> {
  return Promise.all(
    uris.map((uri) => (uri.startsWith('http') ? uri : uploadImage(uri, accessToken)))
  );
}
