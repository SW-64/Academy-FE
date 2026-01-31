import { API_BASE_URL } from '../constants/api';
import { request } from './client';

export type VideoStatus = string;

export interface VideoListItem {
  videoId: number;
  title: string;
  thumbnailUrl: string | null;
  duration: number;
  status: VideoStatus;
  viewCount: number;
  createdAt: string;
  assignedStudentCount?: number;
}

export interface GetVideosResponse {
  statusCode: number;
  message: string;
  data: {
    data: VideoListItem[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface VideoDetailItem {
  videoId: number;
  title: string;
  thumbnailUrl: string | null;
  duration: number;
  status: VideoStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  assignedStudents: { studentId: number; name: string }[];
}

export interface GetVideoDetailResponse {
  statusCode: number;
  message: string;
  data: VideoDetailItem;
}

export interface VideoPlaybackResponse {
  statusCode: number;
  message: string;
  data: {
    playbackUrl: string;
    thumbnailUrl: string | null;
    title: string;
    duration: number;
  };
}

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
    formData.append('studentIds', id.toString());
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

/**
 * 영상 목록을 조회합니다.
 * @param page 페이지 (기본 1)
 * @param limit 페이지당 개수 (기본 20)
 */
export const getVideos = async (
  page: number = 1,
  limit: number = 20
): Promise<GetVideosResponse> => {
  return request<GetVideosResponse>(`/videos?page=${page}&limit=${limit}`, {
    errorMessage: '영상 목록을 가져오는데 실패했습니다.',
  });
};

/**
 * 영상 상세를 조회합니다.
 */
export const getVideoDetail = async (
  videoId: number
): Promise<GetVideoDetailResponse> => {
  return request<GetVideoDetailResponse>(`/videos/${videoId}`, {
    errorMessage: '영상 상세를 가져오는데 실패했습니다.',
  });
};

/**
 * 영상 재생 URL을 조회합니다.
 */
export const getVideoPlayback = async (
  videoId: number
): Promise<VideoPlaybackResponse> => {
  return request<VideoPlaybackResponse>(`/videos/${videoId}/playback`, {
    errorMessage: '재생 URL을 가져오는데 실패했습니다.',
  });
};

/**
 * 영상을 삭제합니다.
 */
export const deleteVideo = async (
  videoId: number
): Promise<{ statusCode: number; message: string }> => {
  return request<{ statusCode: number; message: string }>(
    `/videos/${videoId}`,
    {
      method: 'DELETE',
      errorMessage: '영상 삭제에 실패했습니다.',
    }
  );
};
