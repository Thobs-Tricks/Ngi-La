// POST /media/upload — confirmed live 2026-09: multipart/form-data, field
// name "file", returns { url, resourceType }. Backed by Cloudinary. This is
// what unblocks real photo uploads for the vendor's main spaza photo and the
// Promo Photos gallery, which were previously local-preview-only.
//
// The returned `url` is a normal public https URL (Cloudinary-hosted) — once
// you have it, displaying it is just `<Image source={{ uri: url }} />` like
// any other remote image. No extra "resolve" step needed.
//
// This deliberately does NOT use fetch()+FormData — on this RN/Expo version
// that throws "Unsupported FormDataPart implementation" for the classic
// {uri,name,type} file trick (confirmed live 2026-09). expo-file-system's
// UploadTask does real multipart uploads natively instead, sidestepping that
// whole class of fetch/FormData compatibility issue.
import { File, UploadTask, UploadType } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { API_URL, ApiError } from './client';

export interface MediaUploadResult {
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

/** Uploads a single local image (from expo-image-picker) and returns its
 * hosted URL. Pass the local `file://`/`content://` uri as returned by the
 * picker. */
export async function uploadMedia(localUri: string, accessToken?: string): Promise<MediaUploadResult> {
  const { uri, mimeType } = await prepareForUpload(localUri);

  let status: number;
  let body: string;
  try {
    const task = new UploadTask(new File(uri), `${API_URL}/media/upload`, {
      httpMethod: 'POST',
      uploadType: UploadType.MULTIPART,
      fieldName: 'file',
      mimeType,
      headers: {
        Accept: 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });
    const result = await task.uploadAsync();
    status = result.status;
    body = result.body;
  } catch (e) {
    const detail = e instanceof Error && e.message ? ` (${e.message})` : '';
    throw new ApiError(`Could not reach the server to upload the photo${detail}. Check your connection and try again.`, 0);
  }

  let data: unknown = null;
  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = body;
  }

  if (status < 200 || status >= 300) {
    const obj = data as Record<string, unknown> | null;
    const message =
      (obj && (obj.detail as string)) || (obj && (obj.title as string)) || (obj && (obj.message as string)) || `Upload failed (${status})`;
    throw new ApiError(message, status);
  }

  return data as MediaUploadResult;
}
