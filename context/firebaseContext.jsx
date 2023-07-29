import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase/initFirebase";
import { v4 } from "uuid";
import Cookies from "js-cookie";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import {
  addDoc,
  setDoc,
  getDoc,
  collection,
  Timestamp,
  serverTimestamp,
  query,
  where,
  doc,
  deleteDoc,
  getDocs,
  onSnapshot,
  arrayUnion,
  updateDoc,
  runTransaction,
  arrayRemove,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
  setPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
} from "firebase/auth";
import Router from "next/router";
import emailjs from "@emailjs/browser";

const FirebaseContext = React.createContext();
export function useFirebase() {
  return React.useContext(FirebaseContext);
}

export function FirebaseProvider({ children }) {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const historyUserRef = collection(db, "historyUser");
    const historyHomestayRef = collection(db, "historyHomestay");
    const unsub1 = onSnapshot(historyHomestayRef, (snapshot) => {
      console.log("listener1 attached");

      snapshot.docs.map(async (document) => {
        document.data().current &&
          document.data().current.forEach(async (element) => {
            if (element.checkOutTime.seconds <= Timestamp.now().seconds) {
              await setDoc(
                doc(db, "historyHomestay", document.id),
                {
                  current: arrayRemove(element),
                  past: arrayUnion(element),
                },
                { merge: true }
              );
            }
          });
      });
    });

    const unsub2 = onSnapshot(historyUserRef, (snapshot) => {
      console.log("listener2 attached");

      snapshot.docs.map((document) => {
        document.data().current &&
          document.data().current.forEach(async (element) => {
            if (element.checkOutTime.seconds < Timestamp.now().seconds) {
              await setDoc(
                doc(db, "historyUser", document.id),
                {
                  current: arrayRemove(element),
                  past: arrayUnion(element),
                },
                { merge: true }
              );
            }
          });
      });
    });

    return () => {
      unsub1();
      unsub2();
      console.log("listener detached");
    };
  }, []);

  async function addHomestay(
    homestayName,
    desc,
    name,
    email,
    phone,
    male,
    female,
    children,
    petAllowance,
    alcoholTolerant,
    coupleFriendly,
    nonVegTolerant,
    nonVeg,
    Rules,
    openTime,
    AC,
    city,
    state,
    address,
    Capacity,
    pricePerNight,
    popularDestinationsNearby,
    images,
    airportDistance,
    busStationDistance,
    railwayStationDistance
  ) {
    let imageUrls = [];
    //images upload hori h yahase
    if (!images) return console.log("bhaai images to daaal");
    for (let i = 0; i < images.length; i++) {
      const imageRef = ref(storage, `images/${email}/${images[i].name + v4()}`);
      await uploadBytes(imageRef, images[i]).then(() => {
        console.log("uploaded");
      });

      const url = await getDownloadURL(imageRef);
      imageUrls[i] = url;
    }
    const { details } = getUserCookies();
    await setDoc(doc(db, "historyHomestay", details.email), {
      current: [],
      past: [],
      cancelled: [],
    });
    await addDoc(collection(db, "Homes"), {
      homestayName,
      URLS: imageUrls,
      desc,
      comments: [],
      active: true,
      ratings: [],
      host: {
        name,
        email,
        phone,
        male,
        female,
        children,
      },
      Rules: {
        petAllowance,
        alcoholTolerant,
        coupleFriendly,
        nonVegTolerant,
        nonVeg,
        Rules,
        openTime,
      },
      // AC: true,
      // city: "jaipur",
      // state: "Rajasthan",
      // address: "B-48 model Town, Jagatpura",
      // Capacity: 5,
      // pricePerNight: 120,
      // popularDestinationsNearby: [
      //     {
      //         head: "patrika Gate",
      //         body: "A wonderful place to visit",
      //     },
      //     {
      //         head: "Amer Fort",
      //         body: "A wonderful palace to visit"
      //     }
      // ]
      AC,
      city,
      state,
      address,
      Capacity,
      pricePerNight,
      popularDestinationsNearby,
      registerTime: Timestamp.now(),
      airportDistance,
      busStationDistance,
      railwayStationDistance,
    });
  }

  async function setActiveStatus(id, state) {
    const activeRef = doc(db, "Homes", id);

    await updateDoc(activeRef, {
      active: state,
    });
  }

  async function addComment(id = "wdFQ8rBHcAYaPzelHNb3", head, user, body) {
    const commentRef = doc(db, "Homes", id);
    if (head.trim().length === 0 || body.trim().length === 0 || !user) {
      return console.log("please enter valid values of user, head and body");
    }

    await updateDoc(commentRef, {
      comments: arrayUnion({
        user,
        head,
        body,
        addedOn: Timestamp.now(),
      }),
    });
  }

  async function addRating(id = "wdFQ8rBHcAYaPzelHNb3", stars, user) {
    if (stars === 0) {
      return console.log("please enter valid values of star");
    }
    const ratingRef = doc(db, "Homes", id);

    await updateDoc(ratingRef, {
      ratings: arrayUnion({
        user,
        stars,
        addedOn: Timestamp.now(),
      }),
    });
  }

  async function bookHomestay(
    bookingId,
    emailUser,
    emailOwner,
    homeStayId,
    userName,
    ownerPhone,
    HomestayName,
    checkInTime,
    checkOutTime,
    peopleCount,
    TotalRent,
    Location,
    Address
  ) {
    const historyUserRef = doc(db, "historyUser", emailUser);
    const historyHomestayRef = doc(db, "historyHomestay", emailOwner);
    const bookedAt = Timestamp.now();

    try {
      const bookHome = await runTransaction(db, async (transaction) => {
        transaction.set(
          historyHomestayRef,
          {
            current: arrayUnion({
              bookingId,
              userName,
              emailUser,
              checkInTime,
              checkOutTime,
              peopleCount,
              TotalRent,
              bookedAt,
            }),
          },
          { merge: true }
        );

        transaction.set(
          historyUserRef,
          {
            current: arrayUnion({
              bookingId,
              homeStayId,
              HomestayName,
              checkInTime,
              checkOutTime,
              Location,
              Address,
              peopleCount,
              TotalRent,
              emailOwner,
              ownerPhone,
              bookedAt,
            }),
          },
          { merge: true }
        );
        console.log("booked");
        return bookHome;
      });
      console.log("Transaction successfully committed!");
    } catch (e) {
      console.log("Transaction failed: ", e);
    }
  }

  async function updateHomestay(
    docid,
    desc,
    AC,
    pricePerNight,
    nonVeg,
    alcoholTolerant,
    coupleFriendly,
    nonVegTolerant,
    petAllowance,
    Rules,
    openTime
  ) {
    const docref = doc(db, "Homes", docid);
    await updateDoc(docref, {
      pricePerNight,
      Rules: {
        Rules,
        nonVeg,
        alcoholTolerant,
        coupleFriendly,
        petAllowance,
        nonVegTolerant,
        openTime,
      },
      desc,
      AC,
    });
  }

  async function cancelBooking(
    bookingId,
    emailUser,
    emailOwner,
    homeStayId,
    userName,
    HomestayName,
    checkInTime,
    checkOutTime,
    peopleCount,
    TotalRent,
    Location,
    Address,
    ownerPhone,
    bookedAt
  ) {
    const historyHomestayRef = doc(db, "historyHomestay", emailOwner);
    const historyUserRef = doc(db, "historyUser", emailUser);

    try {
      const bookHome = await runTransaction(db, async (transaction) => {
        transaction.set(
          historyHomestayRef,
          {
            current: arrayRemove({
              TotalRent,
              bookingId,
              checkInTime,
              checkOutTime,
              emailUser,
              peopleCount,
              userName,
              bookedAt,
            }),
            cancelled: arrayUnion({
              TotalRent,
              bookingId,
              checkInTime,
              checkOutTime,
              emailUser,
              peopleCount,
              userName,
              cancelledAt: Timestamp.now(),
            }),
          },
          { merge: true }
        );

        transaction.set(
          historyUserRef,
          {
            current: arrayRemove({
              Address,
              HomestayName,
              Location,
              TotalRent,
              bookedAt,
              bookingId,
              checkInTime,
              checkOutTime,
              emailOwner,
              homeStayId,
              ownerPhone,
              peopleCount,
            }),
            cancelled: arrayUnion({
              Address,
              HomestayName,
              Location,
              TotalRent,
              bookingId,
              checkInTime,
              checkOutTime,
              emailOwner,
              homeStayId,
              ownerPhone,
              peopleCount,
              cancelledAt: Timestamp.now(),
            }),
          },
          { merge: true }
        );

        return console.log("cancelled");
      });

      return "Booking Cancelled succesfully";
    } catch (e) {
      console.log("Transaction failed: ", e);
    }
  }

  async function getHomeHistory(homes, checkIn, checkOut) {
    const final = await homes.map(async (val) => {
      const history = await getDoc(doc(db, "historyHomestay", val.host.email));
      const his = history.data();
      let booked_guests = 0;
      if (history.length > 0) {
        const current_bookings = his.current;
        current_bookings.map((booking) => {
          if (
            (booking.checkInTime.seconds >= checkIn &&
              booking.checkInTime.seconds <= checkOut) ||
            (booking.checkOutTime / 1000 <= checkOut &&
              booking.checkOutTime / 1000 >= checkIn) ||
            (booking.checkOutTime / 1000 >= checkOut &&
              booking.checkInTime <= checkIn)
          ) {
            booked_guests += booking.peopleCount;
          }
        });
      }
      return await { ...val, booked_guests };
    });
    let abc = await Promise.all(final);
    return abc;
  }

  async function getUserHistory() {
    const user = getUserCookies();
    if (user) {
      const history = await getDoc(doc(db, "historyUser", user.details.email));
      if (history) {
        return history.data();
      }
      return false;
    }
    return false;
  }

  function useAuth() {
    const [authState, setAuthState] = useState({
      isSignedIn: false,
      user: null,
      pending: true,
    });

    useEffect(() => {
      const unregisterAuthObserver = onAuthStateChanged(auth, (user) => {
        if (user) {
          setAuthState({ isSignedIn: true, user, pending: false });
        }
      });
      return () => unregisterAuthObserver();
    }, []);
    return { auth, ...authState };
  }

  async function signIn() {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
        auth_type: "reauthenticate",
      });
      setPersistence(auth, inMemoryPersistence);
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      Cookies.set(
        "user",
        JSON.stringify({
          token: token,
          email: result.user.email,
          name: result.user.displayName,
          photo: result.user.photoURL,
          number: result.user.phoneNumber,
        }),
        { expires: 7 }
      );
      window.location.reload();
    } catch (error) {}
  }

  async function sendMail(
    homestay_name,
    to_email,
    to_name,
    message,
    subject,
    greetings
  ) {
    var template_params = {
      homestay_name: homestay_name,
      to_email: to_email,
      message: message,
      to_name: to_name,
      subject: subject,
      greetings: greetings,
    };
    emailjs
      .send(
        "service_mx4lksw",
        "template_60qfdkn",
        template_params,
        "JSUCvQi3lkcl1ScoG"
      )
      .then(
        function (response) {
          console.log("SUCCESS!", response.status, response.text);
        },
        function (error) {
          console.log("FAILED...", error);
        }
      );
  }

  function checkUserCookies() {
    const user = Cookies.get("user");
    if (user) {
      return true;
    }
    return false;
  }
  function getUserCookies() {
    const user = Cookies.get("user");
    if (user) {
      const details = JSON.parse(user);
      return { details };
    }
    return false;
  }

  async function chatWithOwner(homestayId, message) {
    const user = getUserCookies();
    if (user) {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("homestayId", "==", homestayId),
        where("userEmail", "==", user.details.email)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.docs.length > 0) {
        const chatId = querySnapshot.docs[0].id;
        const chatRef = doc(db, "chats", chatId);
        await updateDoc(chatRef, {
          messages: arrayUnion({
            message,
            timestamp: Timestamp.now(),
            from: user.details.email,
          }),
        });
      } else {
        await addDoc(collection(db, "chats"), {
          homestayId,
          userEmail: user.details.email,
          messages: [
            {
              message,
              timestamp: Timestamp.now(),
              from: user.details.email,
            },
          ],
        });
      }
    }
  }

  async function getChatsOfUser() {
    const user = getUserCookies();
    if (user) {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("userEmail", "==", user.details.email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.docs.length > 0) {
        return querySnapshot.docs;
      }
      return false;
    }
    return false;
  }

  function signOut() {
    Cookies.remove("user", { expires: 7 });
    window.location.reload();
  }

  const value = {
    addHomestay,
    setActiveStatus,
    addComment,
    addRating,
    bookHomestay,
    updateHomestay,
    cancelBooking,
    getHomeHistory,
    getUserHistory,
    useAuth,
    signIn,
    sendMail,
    checkUserCookies,
    getUserCookies,
    signOut,
    chatWithOwner,
    getChatsOfUser
  };
  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
}
