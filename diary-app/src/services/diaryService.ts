import { getDb, getStorageInstance } from './firebase';
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Diary, DiaryInput } from '../types';

const DIARIES_COLLECTION = 'diaries';

function diaryFromSnapshot(docSnap: DocumentSnapshot): Diary {
  const data = docSnap.data();
  if (!data) throw new Error('Document not found');
  return {
    id: docSnap.id,
    icon: data.icon,
    title: data.title,
    body: data.body,
    date: (data.date as Timestamp).toDate(),
    imageUrl: data.imageUrl,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
    userId: data.userId,
  };
}

export async function createDiary(userId: string, input: DiaryInput): Promise<string> {
  const db = getDb();
  const docRef = await addDoc(collection(db, DIARIES_COLLECTION), {
    ...input,
    date: Timestamp.fromDate(input.date),
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchDiaries(
  userId: string,
  pageSize: number = 10,
  cursor?: DocumentSnapshot
): Promise<{ diaries: Diary[]; nextCursor: DocumentSnapshot | null; hasMore: boolean }> {
  const db = getDb();
  const constraints: any[] = [
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  ];
  if (cursor) {
    constraints.push(startAfter(cursor));
  }
  const q = query(collection(db, DIARIES_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  const diaries: Diary[] = [];
  snapshot.forEach((docSnap) => {
    diaries.push(diaryFromSnapshot(docSnap));
  });
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
  const hasMore = snapshot.docs.length === pageSize;
  return { diaries, nextCursor: lastDoc, hasMore };
}

export async function fetchDiaryById(diaryId: string): Promise<Diary> {
  const db = getDb();
  const docSnap = await getDoc(doc(db, DIARIES_COLLECTION, diaryId));
  if (!docSnap.exists()) throw new Error('Diary not found');
  return diaryFromSnapshot(docSnap);
}

export async function updateDiary(diaryId: string, input: Partial<DiaryInput>): Promise<void> {
  const db = getDb();
  const updateData: any = { ...input, updatedAt: serverTimestamp() };
  if (input.date) {
    updateData.date = Timestamp.fromDate(input.date);
  }
  await updateDoc(doc(db, DIARIES_COLLECTION, diaryId), updateData);
}

export async function deleteDiary(diaryId: string): Promise<void> {
  const db = getDb();
  const diary = await fetchDiaryById(diaryId);
  if (diary.imageUrl) {
    const storage = getStorageInstance();
    const imageRef = ref(storage, diary.imageUrl);
    try {
      await deleteObject(imageRef);
    } catch {
      // ignore if image already deleted
    }
  }
  await deleteDoc(doc(db, DIARIES_COLLECTION, diaryId));
}

export async function uploadImage(userId: string, uri: string): Promise<string> {
  const storage = getStorageInstance();
  const response = await fetch(uri);
  const blob = await response.blob();
  const filename = `${userId}/${Date.now()}.jpg`;
  const storageRef = ref(storage, `images/${filename}`);
  await uploadBytes(storageRef, blob);
  return await getDownloadURL(storageRef);
}

export async function searchDiaries(
  userId: string,
  keyword: string
): Promise<Diary[]> {
  const db = getDb();
  const q = query(
    collection(db, DIARIES_COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);
  const results: Diary[] = [];
  snapshot.forEach((docSnap) => {
    const diary = diaryFromSnapshot(docSnap);
    const lowerKeyword = keyword.toLowerCase();
    if (
      diary.title.toLowerCase().includes(lowerKeyword) ||
      diary.body.toLowerCase().includes(lowerKeyword)
    ) {
      results.push(diary);
    }
  });
  return results;
}
