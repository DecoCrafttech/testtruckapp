import React, { createContext, useState } from "react";

export const LoadNeedsContext = createContext();

export const LoadNeedsProvider = ({ children }) => {


  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState()

  const [aadhaarOTP, setAadhaarOTP] = useState("")


  const [messageReceiver, setMessageReceiver] = useState(null)
  const [pageRefresh, setPageRefresh] = useState(false)
  const [userStatesFromProfile, setUserStatesFromProfile] = useState([])

  const [isFirstSignup, setIsFirstSignup] = useState(false)
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [lastMessageSent,setLastMessageSent] = useState(false)



  const toggleLoading = () => {
    setIsLoading((prevLoading) => !prevLoading);
  };

  return (
    <LoadNeedsContext.Provider
      value={{
        isLoading,
        setIsLoading,
        toggleLoading,
        currentUser,
        setCurrentUser,
        aadhaarOTP,
        setAadhaarOTP,
        messageReceiver,
        setMessageReceiver,
        pageRefresh,
        setPageRefresh,
        userStatesFromProfile,
        setUserStatesFromProfile,
        isFirstSignup,
        setIsFirstSignup,
        isLoggedIn,
        setIsLoggedIn,
        isSignedUp,
        setIsSignedUp,
        lastMessageSent,
        setLastMessageSent,

      }}
    >
      {children}
    </LoadNeedsContext.Provider>
  );
};
