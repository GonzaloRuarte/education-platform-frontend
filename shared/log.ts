const logInfo = (message: any) => {
  console.log(`INFO: ${message}`)
}

const logWarning = (message: any) => {
  console.log(`WARNING: ${message}`)
}

const logError = (message: any) => {
  console.log(`ERROR: ${message}`)
}

const logDebug = (message: any) => {
  console.log(`DEBUG: ${message}`)
}

const log = {
  info: logInfo,
  warning: logWarning,
  error: logError,
  debug: logDebug,
}

export default log

export { logInfo, logWarning, logError, logDebug }