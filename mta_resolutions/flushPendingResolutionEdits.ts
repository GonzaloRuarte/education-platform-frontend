const flushPendingResolutionEdits = async () => {
  if (typeof document === 'undefined') return

  const activeElement = document.activeElement
  if (activeElement instanceof HTMLElement) {
    activeElement.blur()
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 0))
}

export { flushPendingResolutionEdits }
