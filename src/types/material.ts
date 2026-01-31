export interface Material {
  id: number;
  title: string;
  createdAt: string;
  author: string;
  hasNewTag?: boolean;
  classIds?: number[];
}

export const dummyMaterials: Material[] = [];
