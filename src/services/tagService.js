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

const TAGS_COLLECTION = 'tags';
const ENTRIES_COLLECTION = 'journalEntries';

export const getUserTags = async () => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to fetch tags');
  }

  try {
    const q = query(collection(db, TAGS_COLLECTION), where('userID', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);
    const tags = [];

    querySnapshot.forEach((docSnap) => {
      tags.push({ id: docSnap.id, ...docSnap.data() });
    });

    tags.sort((a, b) => a.name.localeCompare(b.name));
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

export const addTag = async (name) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to add tags');
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error('Tag name cannot be empty');
  }

  try {
    const docRef = await addDoc(collection(db, TAGS_COLLECTION), {
      userID: auth.currentUser.uid,
      name: trimmedName,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding tag:', error);
    throw error;
  }
};

const updateEntryTags = async (oldName, newName) => {
  const entriesQuery = query(collection(db, ENTRIES_COLLECTION), where('userID', '==', auth.currentUser.uid));

  const querySnapshot = await getDocs(entriesQuery);
  const updates = [];

  querySnapshot.forEach((docSnap) => {
    const entryData = docSnap.data();
    if (!Array.isArray(entryData.tags) || !entryData.tags.includes(oldName)) {
      return;
    }

    const updatedTags = entryData.tags
      .map((tag) => (tag === oldName ? newName : tag))
      .filter((tag, index, self) => tag && self.indexOf(tag) === index);

    updates.push(
      updateDoc(doc(db, ENTRIES_COLLECTION, docSnap.id), {
        tags: updatedTags,
        updatedAt: Timestamp.now(),
      })
    );
  });

  await Promise.all(updates);
};

const removeTagFromEntries = async (tagName) => {
  const entriesQuery = query(collection(db, ENTRIES_COLLECTION), where('userID', '==', auth.currentUser.uid));

  const querySnapshot = await getDocs(entriesQuery);
  const updates = [];

  querySnapshot.forEach((docSnap) => {
    const entryData = docSnap.data();
    if (!Array.isArray(entryData.tags) || !entryData.tags.includes(tagName)) {
      return;
    }

    const updatedTags = entryData.tags.filter((tag) => tag !== tagName);

    updates.push(
      updateDoc(doc(db, ENTRIES_COLLECTION, docSnap.id), {
        tags: updatedTags,
        updatedAt: Timestamp.now(),
      })
    );
  });

  await Promise.all(updates);
};

export const updateTag = async (tagId, oldName, newName) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to update tags');
  }

  const trimmedName = newName.trim();
  if (!trimmedName) {
    throw new Error('Tag name cannot be empty');
  }

  try {
    const tagRef = doc(db, TAGS_COLLECTION, tagId);
    await updateDoc(tagRef, {
      name: trimmedName,
      updatedAt: Timestamp.now(),
    });

    if (oldName !== trimmedName) {
      await updateEntryTags(oldName, trimmedName);
    }
  } catch (error) {
    console.error('Error updating tag:', error);
    throw error;
  }
};

export const deleteTag = async (tagId, tagName) => {
  if (!auth.currentUser) {
    throw new Error('User must be logged in to delete tags');
  }

  try {
    await deleteDoc(doc(db, TAGS_COLLECTION, tagId));
    await removeTagFromEntries(tagName);
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
};
