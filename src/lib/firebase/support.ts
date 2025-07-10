import { db } from '@/firebase';
import { collection, doc, addDoc, updateDoc, getDoc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';

export const sendUserMessage = async (userId: string, userName: string, email: string, text: string) => {
  const supportRef = collection(db, 'supportMessages');

  const existingQuery = await getDocs(supportRef);
  let docFound = null;

  existingQuery.forEach(doc => {
    if (doc.data().userId === userId) {
      docFound = doc;
    }
  });

  if (docFound) {
    await updateDoc(docFound.ref, {
      messages: [...docFound.data().messages, {
        sender: 'user',
        text,
        timestamp: new Date()
      }],
      status: 'new'
    });
  } else {
    await addDoc(supportRef, {
      userId,
      userName,
      email,
      messages: [{
        sender: 'user',
        text,
        timestamp: new Date()
      }],
      status: 'new',
      createdAt: serverTimestamp()
    });
  }
};

export const sendAdminReply = async (docId: string, replyText: string) => {
  const docRef = doc(db, 'supportMessages', docId);
  const snapshot = await getDoc(docRef);
  const data = snapshot.data();

  await updateDoc(docRef, {
    messages: [...data.messages, {
      sender: 'admin',
      text: replyText,
      timestamp: new Date()
    }],
    status: 'replied'
  });
};

export const getAllSupportMessages = async () => {
  const querySnapshot = await getDocs(collection(db, 'supportMessages'));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
