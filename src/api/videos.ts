import { API_BASE_URL } from '../constants/api';

export type VideoStatus = string;

export interface UploadVideoResponse {
  statusCode: number;
  message: string;
  data: {
    videoId: number;
    title: string;
    thumbnailUrl: string;
    duration: number;
    status: VideoStatus;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    assignedStudentCount?: number;
  };
}

/**
 * 영상을 업로드합니다.
 * @param file 영상 파일
 * @param title 제목
 * @param studentIds 할당할 학생 ID 목록
 * @returns 업로드된 영상 정보
 */
export const uploadVideo = async (
  file: File,
  title: string,
  studentIds: number[]
): Promise<UploadVideoResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  studentIds.forEach(id => {
    formData.append('studentIds[]', id.toString());
  });

  const response = await fetch(`${API_BASE_URL}/videos/upload`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '영상 업로드에 실패했습니다.',
    }));
    throw new Error(errorData.message || '영상 업로드에 실패했습니다.');
  }

  return response.json();
};
