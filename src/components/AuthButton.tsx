'use client'

import { signIn, signOut, useSession } from 'next-auth/react'

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          {session.user?.name || session.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
        >
          Salir
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Iniciar sesión
    </button>
  )
}
