/*
 * Provide one instance of gun to your entire app.
 * NOTE Using this component blocks render until gun is ready
 *
 * Usage examples:
 * // index.js
 *   import { GunContextProvider } from './useGunContext'
 *   // ...
 *   <GunContextProvider>
 *     <App />
 *   </GunContextProvider>
 *
 * // App.js
 *   import useGunContext from './useGunContext'
 *   // ...
 *   const { getGun, getUser } = useGunContext()
 *
 *   getGun().get('ours').put('this')
 *   getUser().get('mine').put('that')
 */
import React, { createContext, useContext, useRef, useEffect } from "react";
import Gun from "gun/gun";
import "gun/sea";

const GunContext = createContext({
  getGun: () => {},
  getUser: () => {},
  getMails: () => {},
  onAuth: () => () => {},
});

export const GunContextProvider = ({ children }) => {
  const gunRef = useRef();
  const userRef = useRef();
  const mailsRef = useRef();
  const onAuthCbRef = useRef();

  useEffect(() => {
    const gun = Gun(process.env.APP_PEERS.split(","));
    window.gun = gun;

    // create user
    const user = gun
      .user()
      // save user creds in session storage
      // this appears to be the only type of storage supported.
      // use broadcast channels to sync between tabs
      .recall({ sessionStorage: true });

    const mails = gun.get("mails-list");

    gunRef.current = gun;
    userRef.current = user;
    mailsRef.current = mails;
  }, []);

  return (
    <GunContext.Provider
      value={{
        getGun: () => gunRef.current,
        getUser: () => userRef.current,
        getMails: () => mailsRef.current,
        onAuth: (cb) => {
          onAuthCbRef.current = cb;
        },
      }}
    >
      {children}
    </GunContext.Provider>
  );
};

export default function useGunContext() {
  return useContext(GunContext);
}
