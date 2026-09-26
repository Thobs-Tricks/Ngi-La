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

/** Full-resolution camera photos (often 3000px+ and several MB each) are
 * slower and more failure-prone to upload than they need to be. This
 * downsizes to a reasonable max width and re-compresses as JPEG first. */
async function prepareForUpload(uri: string): Promise<{ uri: string; mimeType: string }> {
  try {
    const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 1280 } }], {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return { uri: result.uri, mimeType: 'image/jpeg' };
  } catch {
    // If resizing fails for any reason, fall back to uploading the original
    // rather than blocking the whole flow on it.
    return { uri, mimeType: 'image/jpeg' };
  }
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
