import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

const ENTRIES_COLLECTION = 'journalEntries';

/**
 * Add a new journal entry for the current user
 * @param {string} title - The title of the entry
 * @param {string} content - The content of the entry
 * @param {string} mood - The mood/emotion associated with the entry (optional)
 * @param {Array<string>} tags - Optional tags associated with the entry
 * @returns {Promise<string>} - The ID of the created document
 */
export const addJournalEntry = async (title, content, mood = '', tags = []) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to add entries');
  }

  try {
    const docRef = await addDoc(collection(db, ENTRIES_COLLECTION), {
      userID: auth.currentUser.uid,
      userEmail: auth.currentUser.email,
      title: title.trim(),
      content: content.trim(),
      mood: mood.trim(),
      tags: Array.isArray(tags) ? tags.map((tag) => tag.trim()).filter(Boolean) : [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding journal entry:', error);
    throw error;
  }
};

/**
 * Get all journal entries for the current user
 * @returns {Promise<Array>} - Array of journal entries
 */
export const getUserJournalEntries = async () => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to fetch entries');
  }

  try {
    console.log('Fetching entries for user:', auth.currentUser.uid);
    const q = query(collection(db, ENTRIES_COLLECTION), where('userID', '==', auth.currentUser.uid));

    const querySnapshot = await getDocs(q);
    console.log('Query returned', querySnapshot.size, 'documents');
    const entries = [];

    querySnapshot.forEach((doc) => {
      console.log('Entry found:', doc.id, doc.data());
      entries.push({
        id: doc.id,
        ...doc.data(),
        tags: Array.isArray(doc.data().tags) ? doc.data().tags : [],
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      });
    });

    entries.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
    return entries;
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
};

/**
 * Delete a journal entry
 * @param {string} entryId - The ID of the entry to delete
 * @returns {Promise<void>}
 */
export const deleteJournalEntry = async (entryId) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to delete entries');
  }

  try {
    await deleteDoc(doc(db, ENTRIES_COLLECTION, entryId));
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

/**
 * Update a journal entry
 * @param {string} entryId - The ID of the entry to update
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<void>}
 */
export const updateJournalEntry = async (entryId, updates) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to update entries');
  }

  try {
    const entryRef = doc(db, ENTRIES_COLLECTION, entryId);
    await updateDoc(entryRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }
};
