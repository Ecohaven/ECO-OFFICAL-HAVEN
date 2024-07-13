import { createContext } from 'react';

const AccountContext = createContext({
    account: null,
    setAccount: () => {}
});


export default AccountContext;

// import { createContext, useState, useContext } from 'react';

// // Define initial context values
// const AccountContext = createContext(null);

// function AccountProvider({ children }) {
//   const [account, setAccount] = useState(null);

//   return (
//     <AccountContext.Provider value={{ account, setAccount }}>
//       {children}
//     </AccountContext.Provider>
//   );
// }

// function useAccount() {
//   const context = useContext(AccountContext);
//   if (!context) {
//     throw new Error('useAccount must be used within an AccountProvider');
//   }
//   return context;
// }

// export { AccountProvider, useAccount };