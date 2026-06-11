export interface Diary {
  id: string;
  icon: string;
  title: string;
  body: string;
  date: Date;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface DiaryInput {
  icon: string;
  title: string;
  body: string;
  date: Date;
  imageUrl?: string;
}
