import { Timestamp } from 'firebase/firestore';

export function formatDate(timestamp: Timestamp): string {
  return timestamp.toDate().toLocaleDateString('pt-BR');
}

export function daysUntilExpiration(expirationDate: Timestamp): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expDate = expirationDate.toDate();
  expDate.setHours(0, 0, 0, 0);
  const diffTime = expDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
