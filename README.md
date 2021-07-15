# sample-sdk

## Install

`npm i gentleman-sample-sdk`

## Usage (Nextjs)

### 1. create context

```ts
import React, { useContext, createContext, useState } from 'react'
import { GentleSDKClient } from 'gentleman-sample-sdk'

const GentleSDKContext = createContext<GentleSDKClient | null>(null)

interface IProps {
  gentleClient: GentleSDKClient
}

export const GentleProvider: React.FC<IProps> = ({ gentleClient, children }) => {
  const [state] = useState<GentleSDKClient>(gentleClient)

  return <GentleSDKContext.Provider value={state}>{children}</GentleSDKContext.Provider>
}

export const useGentle = () => {
  if (GentleSDKContext !== null) return useContext(GentleSDKContext)

  throw new Error('GentleSDKContext is null!')
}
```

### 2. in \_app.tsx

```tsx
import { GentleProvider } from '../context/gentleContext'
import { createGentleInstance } from 'gentleman-sample-sdk'

function MyApp({ Component, pageProps }: AppProps) {
  let gentleClient
  if (process.browser) gentleClient = createGentleInstance()

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
    gentleClient?.track({ eventName: 'view', properties: { page: 'home' } })
  }, [])

  return (
    <div>
      <h1>HOME</h1>
    </div>
  )
}
```
