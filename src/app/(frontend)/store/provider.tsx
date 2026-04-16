// store/provider.tsx
'use client'

import { Provider } from 'react-redux'
import { store } from './index'
import { useEffect, ReactNode } from 'react'
import { setUser } from './slices/authSlice'

export default function ReduxProvider({ children, user }: { children: ReactNode; user?: any }) {
  useEffect(() => {
    if (user) {
      store.dispatch(setUser(user))
    }
  }, [user])

  return <Provider store={store}>{children}</Provider>
}