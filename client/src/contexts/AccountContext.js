import { createContext, UseState } from 'react';

const AccountContext = createContext({
    account: null,
    setAccount: () => {}
});

export default AccountContext;