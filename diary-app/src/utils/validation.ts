export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface DiaryFormData {
  icon: string;
  title: string;
  body: string;
  date: Date;
}

const TITLE_MAX = 50;
const BODY_MAX = 5000;

export function validateDiaryForm(data: DiaryFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.icon) {
    errors.icon = 'アイコンを選択してください';
  }

  if (!data.title.trim()) {
    errors.title = 'タイトルを入力してください';
  } else if (data.title.length > TITLE_MAX) {
    errors.title = `タイトルは${TITLE_MAX}文字以内で入力してください`;
  }

  if (!data.body.trim()) {
    errors.body = '本文を入力してください';
  } else if (data.body.length > BODY_MAX) {
    errors.body = `本文は${BODY_MAX}文字以内で入力してください`;
  }

  if (!data.date) {
    errors.date = '日付を入力してください';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}
