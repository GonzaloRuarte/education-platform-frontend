import { useState } from 'react'

const useInProgress = (initialValue = false) => {
  const [isInProgress, setIsInProgress] = useState(initialValue)
  return { isInProgress, setIsInProgress }
}

export {
  useInProgress,
}