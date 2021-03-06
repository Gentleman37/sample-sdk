# sample-sdk

## Install

```
npm i gentleman-sample-sdk
```

## Usage (Nextjs)

### 1. create context

```ts
import React, { useContext, createContext, useState } from 'react'
import { GentleInstance } from 'gentleman-sample-sdk'

const GentleSDKContext = createContext<GentleInstance | null>(null)

interface IProps {
  gentleClient: GentleInstance
}

export const GentleProvider: React.FC<IProps> = ({ gentleClient, children }) => {
  const [state] = useState<GentleInstance>(gentleClient)

  return <GentleSDKContext.Provider value={state}>{children}</GentleSDKContext.Provider>
}

export const useGentle = () => {
  const contextValue = useContext(GentleSDKContext)
  if (contextValue !== null) return contextValue

  throw new Error('ContextValue is null!')
}
```

### 2. in \_app.tsx

```tsx
import { GentleProvider } from '../context/gentleContext'
import { createGentleInstance } from 'gentleman-sample-sdk'

function MyApp({ Component, pageProps }: AppProps) {
  let gentleClient
  // baseUrl of log server
  if (process.browser) gentleClient = createGentleInstance({ baseUrl: 'http://localhost:5000' })

  if (gentleClient) {
    return (
      <GentleProvider gentleClient={gentleClient}>
        <Component {...pageProps} />
      </GentleProvider>
    )
  }

  return <Component {...pageProps} />
}
export default MyApp
```

### 3. useGentle

```tsx
import { useGentle } from '../context/gentleContext'

interface IProps extends InferGetServerSidePropsType<typeof getServerSideProps> {}

const Home: React.FC<IProps> = ({ user }) => {
  const gentleClient = useGentle()

  useEffect(() => {
    // post event data to 'http://localhost:5000/logs'
    gentleClient.track<T>({
      endPoint: '/logs',
      event: { eventName: 'view', eventProperties: { page: 'home' } },
    })
  }, [])

  return (
    <div>
      <h1>HOME</h1>
    </div>
  )
}
```
