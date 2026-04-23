// store/provider.tsx
'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { Provider, useDispatch, useSelector } from 'react-redux'
import { store } from './index'
import {
  hydrateAuthThunk,
  selectAuthLoading,
  selectIsLoggedIn,
  UserState,
} from './slices/authSlice'
import {
  bootstrapFavoritesThunk,
  FAVORITES_STORAGE_KEY,
  mergeGuestFavoritesOnLoginThunk,
} from './slices/favoritesSlice'
import type { AppDispatch, RootState } from './index'

function ReduxInitializer({ user }: { user: UserState | null }) {
  const dispatch = useDispatch<AppDispatch>()
  const isLoggedIn = useSelector((state: RootState) => selectIsLoggedIn(state as any))
  const authLoading = useSelector((state: RootState) => selectAuthLoading(state as any))
  const hasBootstrappedFavoritesRef = useRef(false)
  const previousLoggedInRef = useRef(false)
  const isMergingFavoritesRef = useRef(false)

  useEffect(() => {
    void dispatch(hydrateAuthThunk(user))
  }, [dispatch, user?.id]) // Re-run if user.id changes

  useEffect(() => {
    if (authLoading) return

    if (!hasBootstrappedFavoritesRef.current) {
      void dispatch(bootstrapFavoritesThunk())
      hasBootstrappedFavoritesRef.current = true
      previousLoggedInRef.current = isLoggedIn
      return
    }

    if (!previousLoggedInRef.current && isLoggedIn && !isMergingFavoritesRef.current) {
      isMergingFavoritesRef.current = true
      void dispatch(mergeGuestFavoritesOnLoginThunk()).finally(() => {
        isMergingFavoritesRef.current = false
      })
    }

    if (previousLoggedInRef.current && !isLoggedIn) {
      void dispatch(bootstrapFavoritesThunk())
    }

    previousLoggedInRef.current = isLoggedIn
  }, [authLoading, dispatch, isLoggedIn])

  useEffect(() => {
    if (typeof window === 'undefined' || isLoggedIn) return

    const onStorage = (event: StorageEvent) => {
      if (event.key !== FAVORITES_STORAGE_KEY) return
      void dispatch(bootstrapFavoritesThunk())
    }

    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener('storage', onStorage)
    }
  }, [dispatch, isLoggedIn])

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
