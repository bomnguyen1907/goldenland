// store/provider.tsx
'use client'

import { ReactNode, useEffect } from 'react'
import { Provider, useDispatch } from 'react-redux'
import { store } from './index'
import { hydrateAuthThunk, UserState } from './slices/authSlice'
import type { AppDispatch } from './index'

function ReduxInitializer({ user }: { user: UserState | null }) {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(hydrateAuthThunk(user))
  }, [dispatch, user?.id]) // Re-run if user.id changes

  return null
}

export default function ReduxProvider({
  children,
  user,
}: {
  children: ReactNode
  user?: UserState | null
}) {
  return (
    <Provider store={store}>
      <ReduxInitializer user={user || null} />
      {children}
    </Provider>
  )
}