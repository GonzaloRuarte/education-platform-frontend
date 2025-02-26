const logInfo = (...data: any) => {
  console.log('INFO:', ...data)
}

const logWarning = (...data: any) => {
  console.log('WARNING:', ...data)
}

const logError = (...data: any) => {
  console.log('ERROR:', ...data)
}

const logDebug = (...data: any) => {
  console.log('DEBUG:', ...data)
}

const log = {
  info: logInfo,
  warning: logWarning,
  error: logError,
  debug: logDebug,
}

export default log

export { logInfo, logWarning, logError, logDebug }
