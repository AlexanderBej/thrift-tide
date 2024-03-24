import { initializeApp } from "firebase/app";
import {
	getAuth,
	signInWithPopup,
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, getDocs, updateDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
	authDomain: "thrift-tide.firebaseapp.com",
	projectId: "thrift-tide",
	storageBucket: "thrift-tide.appspot.com",
	messagingSenderId: "897670610568",
	appId: "1:897670610568:web:7f667a9d658071472d693d",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
	prompt: "select_account",
});

export const auth = getAuth();
export const signInWithGooglePopup = () => signInWithPopup(auth, provider);

export const db = getFirestore();

export const createUserDocumentFromAuth = async (userAuth, additionalInfo = {}) => {
	if (!userAuth) {
		return;
	}

	const userDocRef = doc(db, "users", userAuth.uid);

	const userSnapshot = await getDoc(userDocRef);

	if (!userSnapshot.exists()) {
		const { displayName, email } = userAuth;
		const createdAt = new Date();
		// const uniquedId = crypto.randomUUID();

		try {
			await setDoc(userDocRef, {
				displayName,
				email,
				createdAt,
				photoURL: userAuth.photoURL,
				financialStatus: {
					income: {
						total: 0,
						incomes: [],
					},
					expenses: {
						total: 0,
						needs: {
							title: "Needs",
							expenses: [],
						},
						wants: {
							title: "Wants",
							expenses: [],
						},
						save: {
							title: "Save",
							expenses: [],
						},
					},
					remaining: 0,
				},
				// docId: uniquedId,
				...additionalInfo,
			});
		} catch (error) {
			console.log("error creating the user", error.message);
		}
	}

	return userDocRef;
};

export const createAuthUserWithEmailAndPassword = async (email, password) => {
	if (!email || !password) {
		return;
	}

	return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInAuthUserWithEmailAndPassword = async (email, password) => {
	if (!email || !password) return;

	return await signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => await signOut(auth);

export const onAuthStateChangedListener = (callback) => {
	onAuthStateChanged(auth, callback);
};

export const getUsersAndDocuments = async () => {
	const collectionRef = collection(db, "users");
	const q = query(collectionRef);

	const querySnapshot = await getDocs(q);
	return querySnapshot.docs.map((docSnapshot) => docSnapshot.data());
};

export const getUserDocument = async (userAuth) => {
	const userDocRef = doc(db, "users", userAuth.uid);

	const userSnapshot = await getDoc(userDocRef);

	return userSnapshot.data();
};

export const updateUserDoc = async (userAuth, update) => {
	const docRef = doc(db, "users", userAuth.uid);

	await updateDoc(docRef, { financialStatus: update });
};
