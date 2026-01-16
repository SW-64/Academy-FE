import { API_BASE_URL } from '../constants/api';

export interface MaterialItem {
  materialId: number;
  adminId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialsResponse {
  statusCode: number;
  message: string;
  data: {
    items: MaterialItem[];
    meta: {
      totalItems: number;
      itemCount: number;
      itemsPerPage: number;
      totalPages: number;
      currentPage: number;
    };
  };
}

export interface GetMaterialsParams {
  page?: number;
  limit?: number;
  sort?: string;
  classId?: number;
}

/**
 * 학습자료 목록을 조회합니다.
 * @param params 쿼리 파라미터 (page, limit, sort, classId)
 * @returns 학습자료 목록
 */
export const getMaterials = async (
  params?: GetMaterialsParams
): Promise<MaterialsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.limit) {
    queryParams.append('limit', params.limit.toString());
  }
  if (params?.sort) {
    queryParams.append('sort', params.sort);
  }
  if (params?.classId) {
    queryParams.append('classId', params.classId.toString());
  }

  const url = `${API_BASE_URL}/materials${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '학습자료 목록을 가져오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '학습자료 목록을 가져오는데 실패했습니다.'
    );
  }

  return response.json();
};

export interface CreateMaterialRequest {
  title: string;
  description: string;
  classIds: number[];
}

export interface CreateMaterialResponse {
  statusCode: number;
  message: string;
  data: {
    adminId: number;
    title: string;
    description: string;
    s3Bucket: string | null;
    s3Key: string | null;
    originalFileName: string | null;
    sizeBytes: number | null;
    materialId: number;
    mimeType: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
}

/**
 * 학습자료를 생성합니다.
 * @param data 학습자료 생성 데이터
 * @returns 생성된 학습자료 정보
 */
export const createMaterial = async (
  data: CreateMaterialRequest
): Promise<CreateMaterialResponse> => {
  const response = await fetch(`${API_BASE_URL}/materials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '학습자료 생성에 실패했습니다.',
    }));
    throw new Error(errorData.message || '학습자료 생성에 실패했습니다.');
  }

  return response.json();
};

export interface UploadMaterialFileResponse {
  statusCode: number;
  message: string;
  data: {
    materialId: number;
    s3Bucket: string;
    s3Key: string;
    originalFileName: string;
    mimeType: string;
    sizeBytes: number;
  };
}

/**
 * 학습자료 파일을 업로드합니다.
 * @param materialId 학습자료 ID
 * @param file 업로드할 파일
 * @returns 업로드된 파일 정보
 */
export const uploadMaterialFile = async (
  materialId: number,
  file: File
): Promise<UploadMaterialFileResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE_URL}/materials/${materialId}/file`,
    {
      method: 'POST',
      credentials: 'include', // 쿠키를 포함하여 요청
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '파일 업로드에 실패했습니다.',
    }));
    throw new Error(errorData.message || '파일 업로드에 실패했습니다.');
  }

  return response.json();
};

export interface MaterialDetailResponse {
  statusCode: number;
  message: string;
  data: {
    materialId: number;
    adminId: number;
    title: string;
    description: string;
    originalFileName: string | null;
    createdAt: string;
    updatedAt: string;
    classIds: number[];
  };
}

/**
 * 학습자료 상세 정보를 조회합니다.
 * @param materialId 학습자료 ID
 * @returns 학습자료 상세 정보
 */
export const getMaterialDetail = async (
  materialId: number
): Promise<MaterialDetailResponse> => {
  const response = await fetch(`${API_BASE_URL}/materials/${materialId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '학습자료를 불러오는데 실패했습니다.',
    }));
    throw new Error(
      errorData.message || '학습자료를 불러오는데 실패했습니다.'
    );
  }

  return response.json();
};

export interface DeleteMaterialResponse {
  statusCode: number;
  message: string;
}

/**
 * 학습자료를 삭제합니다.
 * @param materialId 학습자료 ID
 * @returns 삭제 응답
 */
export const deleteMaterial = async (
  materialId: number
): Promise<DeleteMaterialResponse> => {
  const response = await fetch(`${API_BASE_URL}/materials/${materialId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '학습자료 삭제에 실패했습니다.',
    }));
    throw new Error(errorData.message || '학습자료 삭제에 실패했습니다.');
  }

  return response.json();
};

export interface UpdateMaterialRequest {
  title: string;
  description: string;
  classIds: number[];
}

export interface UpdateMaterialResponse {
  statusCode: number;
  message: string;
}

/**
 * 학습자료를 수정합니다.
 * @param materialId 학습자료 ID
 * @param data 학습자료 수정 데이터
 * @returns 수정 응답
 */
export const updateMaterial = async (
  materialId: number,
  data: UpdateMaterialRequest
): Promise<UpdateMaterialResponse> => {
  const response = await fetch(`${API_BASE_URL}/materials/${materialId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키를 포함하여 요청
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: '학습자료 수정에 실패했습니다.',
    }));
    throw new Error(errorData.message || '학습자료 수정에 실패했습니다.');
  }

  return response.json();
};

